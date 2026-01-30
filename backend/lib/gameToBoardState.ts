export const gameToBoardState = (game: Game) => {
  const { chessInstance: chess } = game

  return {
    // Deriving game state from PGN ensure consistency, but it can be long.
    // FEN is more concise, but it doesn't include move history.
    pgn: chess.pgn(),
    // gameState: (() => {
    //   if (chess.isCheckmate()) return 'checkmate' as const
    //   if (chess.isStalemate()) return 'stalemate' as const
    //   if (chess.isInsufficientMaterial()) return 'insufficient_material' as const
    //   if (chess.isThreefoldRepetition()) return 'threefold_repetition' as const
    //   if (chess.isCheck()) return 'check' as const
    //   return 'normal' as const
    // })(),
    // isGameOver: chess.isGameOver(),
    // moveNumber: chess.moveNumber(),
    // turn: chess.turn(),
    // squares: SQUARES.reduce(
    //   (acc, square) => {
    //     acc[square] = chess.get(square)
    //     return acc
    //   },
    //   {} as Record<Square, ReturnType<Chess['get']>>,
    // ),
  }
}
