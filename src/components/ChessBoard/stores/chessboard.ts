import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Chess, type Move, SQUARES, type Square } from 'chess.js'
import type { ColorAndPieceSymbol, PieceIdMap } from '../constants'

export const useChessBoardStore = defineStore('chessboard', () => {
  const chess = new Chess()
  const pgn = ref<string>(chess.pgn())
  const currentClickedSquareWithPiece = ref<Square | null>(null)
  const highlightedSquares = computed(() => {
    if (currentClickedSquareWithPiece.value) {
      const validMoves = chess.moves({
        square: currentClickedSquareWithPiece.value || undefined,
        verbose: true,
      }) as Move[]
      return validMoves.map((move) => move.to)
    }

    return []
  })

  const board = computed(() => {
    // dependencies:
    // eslint-disable-next-line
    pgn.value

    // Construct initial pieceIdMap
    const pieceIdMap: PieceIdMap = {}
    const seenPieces: Partial<Record<ColorAndPieceSymbol, number>> = {}
    SQUARES.forEach((square) => {
      try {
        const piece = chess.get(square)
        if (piece) {
          const piecePrefix = `${piece.color}${piece.type}` as ColorAndPieceSymbol
          seenPieces[piecePrefix] = (seenPieces[piecePrefix] ?? 0) + 1

          pieceIdMap[square] = `${piecePrefix}_${seenPieces[piecePrefix] as number}`
        }
      } catch {}
    })

    return {
      moveNumber: chess.moveNumber(),
      turn: chess.turn(),
      pieceIdMap,
      squares: SQUARES.reduce(
        (acc, square) => {
          acc[square] = chess.get(square)
          return acc
        },
        {} as Record<Square, ReturnType<Chess['get']>>,
      ),
    }
  })

  function setPgn(newPgn: string) {
    chess.loadPgn(newPgn)
  }

  function getPieceForSquare(square: Square) {
    const piece = board.value.squares[square]

    if (!piece) return null

    if (square === 'd5') {
      console.log({ square, piece})
    }

    return `${piece.color}${piece.type}` satisfies ColorAndPieceSymbol
  }

  function getSquareColor(square: Square) {
    return chess.squareColor(square) ?? 'dark'
  }

  function setCurrentClickedSquareWithPiece(square: Square) {
    currentClickedSquareWithPiece.value = square
  }

  function makeMove(to: Square) {
    if (!currentClickedSquareWithPiece.value) {
      return
    }

    try {
      const move = chess.move({ from: currentClickedSquareWithPiece.value, to })

      // If valid move, clear highlighted squares and make updates.
      if (move) {
        pgn.value = chess.pgn()
        currentClickedSquareWithPiece.value = null
      }
    } catch {
      // If it's another piece, update the selected piece.
      const piece = board.value.squares[to]

      if (piece && piece.color === chess.turn()) {
        setCurrentClickedSquareWithPiece(to)
      }
    }
  }

  return {
    pgn,
    highlightedSquares,
    setPgn,
    getPieceForSquare,
    getSquareColor,
    makeMove,
    handleSquareClick: (square: Square) => {
      if (currentClickedSquareWithPiece.value) {
        makeMove(square)
      } else {
        setCurrentClickedSquareWithPiece(square)
      }
    },
  }
})
