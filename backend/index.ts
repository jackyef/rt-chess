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

import type { WebSocketData } from './types/websocket.types'
import { identityRoutes } from './routes/identity.routes'
import { getGameByIdHandler, createGameHandler, joinGameHandler } from './routes/game.routes'
import { handleWebSocketOpen, handleWebSocketMessage, handleWebSocketClose } from './handlers/websocket.handler'

const server = Bun.serve({
  // `routes` requires Bun v1.2.3+
  routes: {
    // Static routes
    "/api/status": new Response("OK"),
    "/api/identity": identityRoutes,
    "/api/game/:id": getGameByIdHandler,
    "/api/game/create": {
      POST: createGameHandler
    },
    "/api/game/:id/join": {
      POST: joinGameHandler
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

      const identity = decodeURIComponent(cookieMap["rt-chess-identity"] || "Unknown spectator");

      const gameId = req.url.split("gameId=")[1];
      if (!gameId) {
        return new Response("Unauthorized", { status: 401 });
      }

      const success = server.upgrade(req, { data: { identity, gameId } });
      return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
    }


    /** These are only needed for production.
     *  In development, we hit the vite dev server and api calls are proxied to bun.
     *  In production, bun is our only server, serving both apis and frontend assets.
     */
    if (url.pathname.startsWith('/assets')) {
      return new Response(Bun.file(`./dist/frontend${url.pathname}`));
    }

    // Fallback to the SPA entrypoint
    return new Response(Bun.file('./dist/frontend/index.html'));
  },

  websocket: {
    data: {} as WebSocketData,

    open(ws) {
      handleWebSocketOpen(ws);
    },

    message(ws, message) {
      handleWebSocketMessage(ws, String(message), server);
    },

    close(ws) {
      handleWebSocketClose(ws);
    }
  },
});

console.log(`Server running at ${server.url}`);
