import * as gamesStore from '../stores/gameStores'
import { gameToBoardState } from '../services/game.service'
import { assertIdentity } from '../middleware/auth'

export const getGameByIdHandler = (req: Bun.BunRequest) => {
  const game = gamesStore.getGame(req.params.id!);

  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  return Response.json({ id: req.params.id, ...gameToBoardState(game) });
}

export const createGameHandler = async (req: Bun.BunRequest) => {
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

export const joinGameHandler = async (req: Bun.BunRequest) => {
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
}
