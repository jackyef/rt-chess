/**
 * Pinia store to manage the current state of a PvP chess game.
 * It serves as a bridge between Vue components and the backend game client.
 *
 */
import { computed, ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { Chess, type Move, SQUARES, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '@/components/ChessBoard/constants'
import { useIdentityStore } from '@/stores/identity'
import { createWebSocketGameClient, type WebSocketGameClient } from '@/api/websocket.api'
import { getGameState, joinMatch } from '@/api/game.api'

export const useChessBoardPvpStore = defineStore('chessboardPvp', () => {
  const chess = new Chess()
  const pgn = ref<string>('')
  const fen = ref<string>('')
  const remainingTime = ref<{ white: number; black: number }>({ white: 0, black: 0 })
  const hasStarted = ref<boolean>(false)
  const hasEnded = ref<boolean>(false)
  const gameEndedReason = ref<string | null>(null)
  const winner = ref<string | null>(null)
  const lastMoveAt = ref<number>(0)
  const identityStore = useIdentityStore()
  const wsClient = ref<WebSocketGameClient | null>(null)
  const wsClientState = ref<'connected' | 'disconnected'>('disconnected')
  const connectedGameId = ref<string | null>(null)
  const { identity } = storeToRefs(identityStore)

  watch(pgn, () => {
    fen.value = chess.fen()
  }, { immediate: true })

  async function getLatestGameState() {
    if (!connectedGameId.value) return

    const {
      pgn: latestPgn,
      remainingTime: latestRemainingTime,
      startedAt,
      endedAt,
      lastMoveAt: latestLastMoveAt,
      endedReason: latestGameEndedReason,
      winner: latestWinner,
    } = await getGameState(connectedGameId.value)

    remainingTime.value = {
      white: latestRemainingTime.white ?? 0,
      black: latestRemainingTime.black ?? 0,
    }
    hasStarted.value = Boolean(startedAt)
    hasEnded.value = Boolean(endedAt)
    lastMoveAt.value = latestLastMoveAt ?? 0
    winner.value = latestWinner
    gameEndedReason.value = endedAt ? latestGameEndedReason : null
    lastMoveSquares.value = []
    setPgn(latestPgn)
  }

  function connectToWebSocket(gameId: string) {
    disconnect()
    wsClient.value = createWebSocketGameClient(gameId)
    wsClientState.value = 'connected'
    connectedGameId.value = gameId

    wsClient.value.subscribe((message) => {
      if (message.type === 'move_made') {
        try {
          const move = chess.move(message.payload.san)
          if (move) {
            lastMoveSquares.value = [move.from, move.to]
          }
          setPgn(chess.pgn())
        } catch {
          // If an error happens, that means the move might be invalid.
          // We ask for fresh game state and start over.
          getLatestGameState()
        }
      } else if (message.type === 'update_remaining_time') {
        lastMoveAt.value = message.payload.lastMoveAt
        remainingTime.value = {
          white: message.payload.remainingTime.white,
          black: message.payload.remainingTime.black,
        }

      } else if (message.type === 'player_joined') {
        getLatestGameState()
      } else if (message.type === 'game_ended') {
        hasEnded.value = true
        gameEndedReason.value = message.payload.reason
        winner.value = message.payload.winner
      }
    })

    wsClient.value.onDisconnection(() => {
      wsClientState.value = 'disconnected'
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
  const pendingPromotion = ref<{ from: Square; to: Square } | null>(null)
  const lastMoveSquares = ref<Square[]>([])
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
        if (gameEndedReason.value) {
          return `ended, winner: ${winner.value}, reason: ${gameEndedReason.value}` as const
        } else if (hasStarted.value) {
          return 'ongoing' as const
        } else {
          return 'waiting_for_players' as const
        }
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
      // Check if this is a pawn promotion
      const piece = chess.get(currentClickedSquareWithPiece.value)
      const isPromotion = piece?.type === 'p' &&
        ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'))

      if (isPromotion) {
        // Show promotion dialog instead of making the move
        pendingPromotion.value = { from: currentClickedSquareWithPiece.value, to }
        return
      }

      // Make move optimistically.
      const move = chess.move({
        from: currentClickedSquareWithPiece.value,
        to,
      })

      // If valid move, clear highlighted squares and make updates.
      if (move) {
        lastMoveSquares.value = [move.from, move.to]
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

  function completePromotion(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion.value) return

    try {
      const move = chess.move({
        from: pendingPromotion.value.from,
        to: pendingPromotion.value.to,
        promotion: piece,
      })

      if (move) {
        lastMoveSquares.value = [pendingPromotion.value.from, pendingPromotion.value.to]
        wsClient.value?.sendMessage({
          type: 'make_move',
          payload: {
            san: move.san,
          },
        })
        pgn.value = chess.pgn()
        currentClickedSquareWithPiece.value = null
        pendingPromotion.value = null
      }
    } catch (error) {
      console.error('Promotion move failed:', error)
      pendingPromotion.value = null
    }
  }

  function cancelPromotion() {
    pendingPromotion.value = null
    currentClickedSquareWithPiece.value = null
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

      // Disconnect and reconnect so that the websocket connection pick up the new identity in cookie.
      disconnect()
      connectToWebSocket(currentGameId)
    } catch (error) {
      console.error('Failed to join game:', error)
    }
  }

  return {
    wsClientState,
    pgn,
    fen,
    highlightedSquares,
    lastMoveSquares,
    pendingPromotion,
    board,
    hasStarted,
    hasEnded,
    lastMoveAt,
    remainingTime,
    initGameState: getLatestGameState,
    connectToWebSocket,
    disconnectWebSocket: disconnect,
    setPgn,
    getPieceForSquare,
    getSquareColor,
    joinGame,
    handleSquareClick: (square: Square) => {
      if (!hasStarted.value || hasEnded.value) return

      if (currentClickedSquareWithPiece.value) {
        makeMove(square)
      } else {
        setCurrentClickedSquareWithPiece(square)
      }
    },
    handleDrop: (fromSquare: Square, toSquare: Square) => {
      if (!hasStarted.value || hasEnded.value) return

      // Clear any previous selection
      currentClickedSquareWithPiece.value = null

      // Check if this is a pawn promotion
      const piece = chess.get(fromSquare)
      const isPromotion = piece?.type === 'p' &&
        ((piece.color === 'w' && toSquare[1] === '8') || (piece.color === 'b' && toSquare[1] === '1'))

      if (isPromotion) {
        // Show promotion dialog instead of making the move
        pendingPromotion.value = { from: fromSquare, to: toSquare }
        return
      }

      try {
        // Make move directly
        const move = chess.move({
          from: fromSquare,
          to: toSquare,
        })

        // If valid move, clear highlighted squares and make updates.
        if (move) {
          lastMoveSquares.value = [move.from, move.to]
          wsClient.value?.sendMessage({
            type: 'make_move',
            payload: {
              san: move.san,
            },
          })
          pgn.value = chess.pgn()
        }
      } catch {
        // Invalid move, do nothing
      }
    },
    completePromotion,
    cancelPromotion,
  }
})
