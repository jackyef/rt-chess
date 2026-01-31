import type { Game, GameEndedReason, GameState } from "../types"

export const getGameEndedReason = (game: Game): GameEndedReason => {
  const { chessInstance } = game
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
}


export const gameToBoardState = (game: Game): GameState => {
  const { chessInstance: chess, remainingTime } = game

  return {
    // Deriving game state from PGN ensure consistency, but it can be long.
    // FEN is more concise, but it doesn't include move history.
    pgn: chess.pgn(),
    remainingTime: { white: remainingTime.white || 0, black: remainingTime.black || 0 },
    startedAt: game.startedAt,
    endedAt: game.endedAt,
    endedReason: game.endedAt ? game.endedReason : null,
    lastMoveAt: game.lastMoveAt,
    winner: game.winner
  }
}
