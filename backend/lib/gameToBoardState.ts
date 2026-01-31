import type { Game, GameState } from "../types"

export const gameToBoardState = (game: Game): GameState => {
  const { chessInstance: chess, remainingTime } = game

  return {
    // Deriving game state from PGN ensure consistency, but it can be long.
    // FEN is more concise, but it doesn't include move history.
    pgn: chess.pgn(),
    remainingTime: { white: remainingTime.white || 0, black: remainingTime.black || 0 },
    startedAt: game.startedAt,
    endedAt: game.endedAt,
    lastMoveAt: game.lastMoveAt
  }
}
