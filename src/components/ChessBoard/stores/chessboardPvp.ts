import { computed, ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Chess, type Move, SQUARES, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '../constants'
import { useIdentityStore } from '@/stores/identity'
import { getGamePgn, joinMatch, useWsGameClient } from '@/lib/clients/gameClient'

export const useChessBoardPvpStore = defineStore('chessboardPvp', () => {
  const chess = new Chess()
  const pgn = ref<string>('')
  const identityStore = useIdentityStore()
  const router = useRouter()
  const gameId = computed(() => router.currentRoute.value.params.id as string)
  const { wsClient, reconnect } = useWsGameClient(gameId)
  const { identity } = storeToRefs(identityStore)

  async function getLatestGameState() {
    const latestPgn = await getGamePgn(gameId.value)
    setPgn(latestPgn)
  }

  watch(wsClient, (newWsClient, oldWsClient) => {
    if (oldWsClient) {
      oldWsClient.close()
    }

    if (newWsClient) {
      newWsClient.subscribe((message) => {
        if (message.type === 'move_made') {
          try {
            chess.move(message.payload.san)
            setPgn(chess.pgn())
          } catch {
            // If an error happens, that means the move might be invalid.
            // We ask for fresh game state and start over.
            getLatestGameState()
          }
        } else if (message.type === 'player_joined') {
          getLatestGameState()
        }
      })
    }
  })

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

        return 'Spectator' as const
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
      // Make move optimistically.
      const move = chess.move({
        from: currentClickedSquareWithPiece.value,
        to,
        // TODO: Handle promotions properly
        // for now, always promote to queen
        promotion: 'q',
      })

      // If valid move, clear highlighted squares and make updates.
      if (move) {
        wsClient.value?.sendMessage({
          type: 'make_move',
          payload: {
            san: move.san,
          },
        })
        pgn.value = chess.pgn()
        currentClickedSquareWithPiece.value = null
      }
    } catch {
      // If it's another piece, update the selected piece.
      const piece = board.value.squares[to]

      if (piece && piece.color === chess.turn()) {
        setCurrentClickedSquareWithPiece(to)
      } else {
        // Invalid move, do nothing.
        return
      }
    }
  }

  async function joinGame() {
    try {
      await joinMatch(gameId.value)
      wsClient.value?.sendMessage({
        type: 'join_game'
      })
      await getLatestGameState()
      reconnect()
    } catch (error) {
      console.error("Failed to join game:", error)
    }
  }

  return {
    pgn,
    highlightedSquares,
    board,
    setPgn,
    getPieceForSquare,
    getSquareColor,
    joinGame,
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
