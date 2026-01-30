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

const server = Bun.serve({
  // `routes` requires Bun v1.2.3+
  routes: {
    // Static routes
    "/api/status": new Response("OK"),
    "/api/identity": {
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

        // const gameId = Bun.randomUUIDv7();
        const gameId = 'asdasd'; // static for easier testing
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

        return Response.json({ id: gameId, ...gameToBoardState(game) });
      },
    },

    // Wildcard route for all routes that start with "/api/" and aren't otherwise matched
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },

});

console.log(`Server running at ${server.url}`);
