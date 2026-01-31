/**
 * This is the backend to manage game state and logic.
 * Server's state will be the authoritative source of truth for a given game.
 * In a nutshell:
 * 1. Server manages multiple games in memory.
 * 2. Server utilize multiple instances of Chess.js to manage each game's state.
 * 3. Games are identified by a unique game ID.
 * 4. Clients can create new games, fetch game current states via API endpoints.
 * 5. Clients can make moves and receive update via WebSocket.
 * 6. Server validates moves using Chess.js before updating game state.
 * 7. Server broadcasts updated game state to all connected clients after a valid move.
 * 8. Server handles game termination conditions (checkmate, stalemate, draw).
 * 9. Finished games are removed from memory, but persisted into the filesystem.
 */

import * as gamesStore from './stores/gameStores';
import { gameToBoardState } from './lib/gameToBoardState';
import { assertIdentity } from './lib/auth';
import { parseClientGameWebSocketMessage, type BackendGameWebSocketMessage } from './lib/websocket';

const server = Bun.serve({
  // `routes` requires Bun v1.2.3+
  routes: {
    // Static routes
    "/api/status": new Response("OK"),
    "/api/identity": {
      "GET": (req: Bun.BunRequest) => {
        const identity = req.cookies.get("rt-chess-identity");
        return Response.json({ identity: identity || '' });
      },
      "PUT": async (req: Bun.BunRequest) => {
        const { identity } = await req.json();

        // Access request cookies
        const cookies = req.cookies;
        // Used to determine player id, which side they are playing, etc.
        // On an actual app, this will be much more secure, like an actual email with proper auth.
        cookies.set("rt-chess-identity", identity);

        // Just echo back the identity
        return Response.json({ identity });
      }
    },
    "/api/game/:id": (req: Bun.BunRequest) => {
      // return game state by id
      const game = gamesStore.getGame(req.params.id!);

      if (!game) {
        return new Response("Game not found", { status: 404 });
      }

      return Response.json({ id: req.params.id, ...gameToBoardState(game) });
    },
    "/api/game/create": {
      POST: async (req: Bun.BunRequest) => {
        const identityAssertionError = assertIdentity(req);

        if (identityAssertionError) {
          return identityAssertionError;
        }

        const gameId = Bun.randomUUIDv7();
        const game = gamesStore.createGame(gameId);
        const identity = req.cookies.get('rt-chess-identity')!;
        const side = Math.random() < 0.5 ? 'White' : 'Black';
        game.chessInstance.setHeader(side, identity);

        return Response.json({ id: gameId, ...gameToBoardState(game) });
      }
    },
    "/api/game/:id/join": {
      POST: async (req: Bun.BunRequest) => {
        const identityAssertionError = assertIdentity(req);

        if (identityAssertionError) {
          return identityAssertionError;
        }

        const gameId = req.params.id;
        const game = gamesStore.getGame(gameId!);

        if (!game) {
          return new Response("Game not found", { status: 404 });
        }

        const identity = req.cookies.get('rt-chess-identity')!;

        const chessGameHeaders = game.chessInstance.getHeaders();
        const existingWhitePlayer = chessGameHeaders['White'] === '?' ? null : chessGameHeaders['White'];
        const existingBlackPlayer = chessGameHeaders['Black'] === '?' ? null : chessGameHeaders['Black'];

        if (existingWhitePlayer && existingBlackPlayer) {
          return new Response("Game is already full", { status: 400 });
        }

        const existingPlayer = existingWhitePlayer || existingBlackPlayer;

        if (existingPlayer === identity) {
          return new Response("Already joined", { status: 400 });
        }

        const side = existingWhitePlayer ? 'Black' : 'White';
        game.chessInstance.setHeader(side, identity);
        const startingTime = Date.now();
        game.startedAt = startingTime;
        game.lastMoveAt = startingTime;
        game.remainingTime.white = game.timeControl?.initial || null;
        game.remainingTime.black = game.timeControl?.initial || null;

        return Response.json({ id: gameId, ...gameToBoardState(game) });
      },
    },

    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/ws/game")) {
      const cookies = req.headers.get("cookie") || "";
      const cookieMap = Object.fromEntries(
        cookies.split("; ").map((c) => {
          const [key, ...v] = c.split("=");
          return [key, v.join("=")];
        })
      );

      const identity = cookieMap["rt-chess-identity"] || "Unknown spectator";

      const gameId = req.url.split("gameId=")[1];
      if (!gameId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const success = server.upgrade(req, { data: { identity, gameId } });
      return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
    }

    return Response.json({ message: "Not found" }, { status: 404 });
  },

  websocket: {
    // TypeScript: specify the type of ws.data like this
    data: {} as { identity: string, gameId: string },

    open(ws) {
      const msg = `${ws.data.identity} has connected to game ${ws.data.gameId}`;
      const message: BackendGameWebSocketMessage = {
        type: 'info',
        payload: {
          message: msg,
        },
      }
      ws.subscribe(`game-${ws.data.gameId}`);
      ws.publish(`game-${ws.data.gameId}`, JSON.stringify(message));
    },
    message(ws, message) {
      const clientMessage = parseClientGameWebSocketMessage(String(message));

      if (clientMessage.type === 'make_move') {
        const game = gamesStore.getGame(ws.data.gameId);
        if (!game) {
          return;
        }

        const chessInstance = game.chessInstance;
        const turn = chessInstance.turn() === 'w' ? 'White' : 'Black';
        const headers = chessInstance.getHeaders();
        const currentPlayer = headers[turn];

        if (currentPlayer !== ws.data.identity) {
          // Not this player's turn
          return;
        }

        const moveResult = chessInstance.move(clientMessage.payload.san);
        const currentTime = Date.now();
        const timeTaken = game.lastMoveAt ? currentTime - game.lastMoveAt : 100; // default to 100ms if lastMoveAt is null

        console.log('madeMove, before', { gameRemainingTime: game.remainingTime, timeTaken, turn });

        if (moveResult) {

          if (turn === 'White' && game.remainingTime.white && game.timeControl) {
            game.remainingTime.white = game.remainingTime.white - timeTaken + (game.timeControl.increment);
          } else if (turn === 'Black' && game.remainingTime.black && game.timeControl) {
            game.remainingTime.black = game.remainingTime.black - timeTaken + (game.timeControl.increment);
          }

          // Set timeout to mark game as over,
          // if no moves are made within the remaining time
          if (game.timeout) {
            clearTimeout(game.timeout);
            game.timeout = null;
          }

          const isGameOver = chessInstance.isGameOver();

          if (isGameOver) {
            const reason = (() => {
              // TODO: Handle draw offer and resignation
              if (chessInstance.isCheckmate()) {
                return 'checkmate';
              } else if (chessInstance.isStalemate()) {
                return 'stalemate';
              } else if (chessInstance.isThreefoldRepetition()) {
                return 'threefold_repetition';
              } else if (chessInstance.isInsufficientMaterial()) {
                return 'insufficient_material';
              }

              // Unhandled case, shouldn't happen tho.
              return 'draw_agreement';
            })()
            const backendMessage: BackendGameWebSocketMessage = {
              type: 'game_ended',
              payload: {
                reason,
                winner: reason === 'checkmate' ? (turn === 'White' ? 'white' : 'black') : 'draw',
              }
            }
            server.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage));
          }

          if (!isGameOver) {
            if (turn === 'White' && game.remainingTime.black) {
              game.timeout = setTimeout(() => {
                game.remainingTime.black = 0;
                game.endedAt = Date.now();

                const backendMessage: BackendGameWebSocketMessage = {
                  type: 'game_ended',
                  payload: {
                    reason: 'timeout',
                    winner: 'white',
                  }
                }
                server.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage));

              }, game.remainingTime.black);
            } else if (turn === 'Black' && game.remainingTime.white) {
              game.timeout = setTimeout(() => {
                game.remainingTime.white = 0;
                game.endedAt = Date.now();

                const backendMessage: BackendGameWebSocketMessage = {
                  type: 'game_ended',
                  payload: {
                    reason: 'timeout',
                    winner: 'black',
                  }
                }
                ws.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage));

              }, game.remainingTime.white);
            }
          }

          game.lastMoveAt = currentTime;

          const backendMessage: BackendGameWebSocketMessage = {
            type: 'move_made',
            payload: {
              san: clientMessage.payload.san,
              lastMoveAt: game.lastMoveAt,
              remainingTime: { white: game.remainingTime.white || 0, black: game.remainingTime.black || 0 },
            },
          }
          server.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage));
        } else {
          const backendMessage: BackendGameWebSocketMessage = {
            type: 'illegal_move_attempt',
            payload: {
              san: clientMessage.payload.san,
            },
          }
          ws.send(JSON.stringify(backendMessage));
        }
      } else if (clientMessage.type === 'join_game') {
        const game = gamesStore.getGame(ws.data.gameId);
        if (!game) {
          return;
        }

        const backendMessage: BackendGameWebSocketMessage = {
          type: 'player_joined',
        }

        // This is just a notification so all clients can refetch game state
        server.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage));
      }
    },
    close(ws) {
      const msg = `${ws.data.identity} has disconnected from the game ${ws.data.gameId}`;
      const message: BackendGameWebSocketMessage = {
        type: 'info',
        payload: {
          message: msg,
        },
      }
      ws.publish(`game-${ws.data.gameId}`, JSON.stringify(message));
      ws.unsubscribe(`game-${ws.data.gameId}`);
    }
  },

});

console.log(`Server running at ${server.url}`);
