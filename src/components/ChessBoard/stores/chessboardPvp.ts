import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { Chess, type Move, SQUARES, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '../constants'
import { useIdentityStore } from '@/stores/identity'

export const useChessBoardPvpStore = defineStore('chessboardPvp', () => {
  const chess = new Chess()
  const pgn = ref<string>('')
  const identityStore = useIdentityStore()
  const { identity } = storeToRefs(identityStore)
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

    const chessHeaders = chess.getHeaders()
    const whitePlayer = chessHeaders.White
    const blackPlayer = chessHeaders.Black

    return {
      whitePlayer,
      blackPlayer,
      playingAs: (() => {
        if (identity.value === whitePlayer) {
          return 'White' as const
        } else if (identity.value === blackPlayer) {
          return 'Black' as const
        }

        return 'White' as const
      })(),
      gameState: (() => {
        if (chess.isCheckmate()) return 'checkmate' as const
        if (chess.isStalemate()) return 'stalemate' as const
        if (chess.isInsufficientMaterial()) return 'insufficient_material' as const
        if (chess.isThreefoldRepetition()) return 'threefold_repetition' as const
        if (chess.isCheck()) return 'check' as const
        return 'normal' as const
      })(),
      isGameOver: chess.isGameOver(),
      moveNumber: chess.moveNumber(),
      turn: chess.turn(),
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
    pgn.value = chess.pgn()
    currentClickedSquareWithPiece.value = null
  }

  function getPieceForSquare(square: Square) {
    const piece = board.value.squares[square]

    if (!piece) return null

    return `${piece.color}${piece.type}` satisfies ColorAndPieceSymbol
  }

  function getSquareColor(square: Square) {
    return chess.squareColor(square) ?? 'dark'
  }

  function setCurrentClickedSquareWithPiece(square: Square) {
    const piece = board.value.squares[square]

    if (!piece || piece.color !== board.value.turn || piece.color !== board.value.playingAs.charAt(0).toLowerCase()) {
      return
    }

    currentClickedSquareWithPiece.value = square
  }

  function makeMove(to: Square) {
    if (!currentClickedSquareWithPiece.value) {
      return
    }

    try {
      const move = chess.move({
        from: currentClickedSquareWithPiece.value,
        to,
        // TODO: Handle promotions properly
        // for now, always promote to queen
        promotion: 'q',
      })

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
    board,
    setPgn,
    getPieceForSquare,
    getSquareColor,
    handleSquareClick: (square: Square) => {
      if (chess.isGameOver()) return

      if (currentClickedSquareWithPiece.value) {
        makeMove(square)
      } else {
        setCurrentClickedSquareWithPiece(square)
      }
    },
  }
})
