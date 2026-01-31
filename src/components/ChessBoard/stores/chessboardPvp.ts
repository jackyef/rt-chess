/**
 * Pinia store to manage the current state of a PvP chess game.
 * It serves as a bridge between Vue components and the backend game client.
 *
 */
import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { Chess, type Move, SQUARES, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '../constants'
import { useIdentityStore } from '@/stores/identity'
import {
  createWsGameClient,
  getGameState,
  joinMatch,
  type WsGameClient,
} from '@/lib/clients/gameClient'

export const useChessBoardPvpStore = defineStore('chessboardPvp', () => {
  const chess = new Chess()
  const pgn = ref<string>('')
  const remainingTime = ref<{ white: number; black: number }>({ white: 0, black: 0 })
  const hasStarted = ref<boolean>(false)
  const hasEnded = ref<boolean>(false)
  const lastMoveAt = ref<number>(0)
  const identityStore = useIdentityStore()
  const wsClient = ref<WsGameClient | null>(null)
  const connectedGameId = ref<string | null>(null)
  const { identity } = storeToRefs(identityStore)

  async function getLatestGameState() {
    if (!connectedGameId.value) return

    const {
      pgn: latestPgn,
      remainingTime: latestRemainingTime,
      startedAt,
      endedAt,
      lastMoveAt: latestLastMoveAt,
    } = await getGameState(connectedGameId.value)

    remainingTime.value = latestRemainingTime
    hasStarted.value = Boolean(startedAt)
    hasEnded.value = Boolean(endedAt)
    lastMoveAt.value = latestLastMoveAt ?? 0
    setPgn(latestPgn)
  }

  function connectToWebSocket(gameId: string) {
    disconnect()
    wsClient.value = createWsGameClient(gameId)
    connectedGameId.value = gameId

    wsClient.value.subscribe((message) => {
      if (message.type === 'move_made') {
        try {
          chess.move(message.payload.san)
          setPgn(chess.pgn())
          remainingTime.value = message.payload.remainingTime
          lastMoveAt.value = message.payload.lastMoveAt
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

  function disconnect() {
    if (wsClient.value) {
      wsClient.value.close()
      wsClient.value = null
      connectedGameId.value = null
    }
  }

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

    if (
      !piece ||
      piece.color !== board.value.turn ||
      piece.color !== board.value.playingAs.charAt(0).toLowerCase()
    ) {
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
      if (!connectedGameId.value) {
        return
      }
      const currentGameId = connectedGameId.value as string

      await joinMatch(currentGameId)
      wsClient.value?.sendMessage({
        type: 'join_game',
      })
      await getLatestGameState()

      // Reconnect so that the websocket connection recognize the new identity in cookie.
      disconnect()
      connectToWebSocket(currentGameId!)
    } catch (error) {
      console.error('Failed to join game:', error)
    }
  }

  return {
    pgn,
    highlightedSquares,
    board,
    hasStarted,
    hasEnded,
    lastMoveAt,
    remainingTime,
    initGameState: getLatestGameState,
    connectToWebSocket,
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
