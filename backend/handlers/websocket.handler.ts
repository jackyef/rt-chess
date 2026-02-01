import type { ServerWebSocket, Server } from 'bun'
import type { WebSocketData } from '../types'
import type { Game } from '../types/game.types'
import * as gamesStore from '../stores/gameStores'
import { getGameEndedReason } from '../services/game.service'
import {
  parseClientGameWebSocketMessage,
  createInfoMessage,
  createMoveMadeMessage,
  createIllegalMoveMessage,
  createGameEndedMessage,
  createPlayerJoinedMessage
} from '../utils/websocket.utils'

type GameWebSocket = ServerWebSocket<WebSocketData>
type GameServer = Server<WebSocketData>

export const handleWebSocketOpen = (ws: GameWebSocket) => {
  const msg = `${ws.data.identity} has connected to game ${ws.data.gameId}`
  const message = createInfoMessage(msg)

  ws.subscribe(`game-${ws.data.gameId}`)
  ws.publish(`game-${ws.data.gameId}`, JSON.stringify(message))
}

export const handleWebSocketMessage = (ws: GameWebSocket, message: string, server: GameServer) => {
  const clientMessage = parseClientGameWebSocketMessage(message)

  console.log('[WebSocket] Received message:', clientMessage)

  if (clientMessage.type === 'make_move') {
    handleMakeMove(ws, clientMessage.payload.san, server)
  } else if (clientMessage.type === 'join_game') {
    handleJoinGame(ws, server)
  }
}

export const handleWebSocketClose = (ws: GameWebSocket) => {
  const msg = `${ws.data.identity} has disconnected from the game ${ws.data.gameId}`
  const message = createInfoMessage(msg)

  ws.publish(`game-${ws.data.gameId}`, JSON.stringify(message))
  ws.unsubscribe(`game-${ws.data.gameId}`)
}

const handleMakeMove = (ws: GameWebSocket, san: string, server: GameServer) => {
  const game = gamesStore.getGame(ws.data.gameId)
  console.log('[WebSocket] Handling make move for game:', ws.data.gameId, 'SAN:', san)
  console.log('[WebSocket] game ID:', game?.id)
  if (!game) return

  const chessInstance = game.chessInstance
  const turn = chessInstance.turn() === 'w' ? 'White' : 'Black'
  const headers = chessInstance.getHeaders()
  const currentPlayer = headers[turn]

  if (currentPlayer !== ws.data.identity) {
    console.log('[WebSocket] Not this player\'s turn:', ws.data.identity, 'Current player:', currentPlayer)
    // Not this player's turn
    return
  }

  const moveResult = chessInstance.move(san)
  const currentTime = Date.now()
  const timeTaken = game.lastMoveAt ? currentTime - game.lastMoveAt : 100

  if (moveResult) {
    updateRemainingTime(game, turn, timeTaken)
    clearExistingTimeout(game)

    const isGameOver = chessInstance.isGameOver()

    if (isGameOver) {
      handleGameOver(game, turn, ws.data.gameId, server)
    } else {
      setupNextPlayerTimeout(game, turn, ws.data.gameId, server)
    }

    game.lastMoveAt = currentTime

    const backendMessage = createMoveMadeMessage(
      san,
      game.lastMoveAt,
      {
        white: game.remainingTime.white || 0,
        black: game.remainingTime.black || 0
      }
    )

    ws.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage))
  } else {
    const backendMessage = createIllegalMoveMessage(san)
    ws.send(JSON.stringify(backendMessage))
  }
}

const handleJoinGame = (ws: GameWebSocket, server: GameServer) => {
  const game = gamesStore.getGame(ws.data.gameId)
  if (!game) return

  const backendMessage = createPlayerJoinedMessage()
  server.publish(`game-${ws.data.gameId}`, JSON.stringify(backendMessage))
}

const updateRemainingTime = (game: Game, turn: 'White' | 'Black', timeTaken: number) => {
  if (turn === 'White' && game.remainingTime.white && game.timeControl) {
    game.remainingTime.white = game.remainingTime.white - timeTaken + game.timeControl.increment
  } else if (turn === 'Black' && game.remainingTime.black && game.timeControl) {
    game.remainingTime.black = game.remainingTime.black - timeTaken + game.timeControl.increment
  }
}

const clearExistingTimeout = (game: Game) => {
  if (game.timeout) {
    clearTimeout(game.timeout)
    game.timeout = null
  }
}

const handleGameOver = (game: Game, turn: 'White' | 'Black', gameId: string, server: GameServer) => {
  const reason = getGameEndedReason(game)
  const winner = reason === 'checkmate' ? (turn === 'White' ? 'white' : 'black') : 'draw'

  gamesStore.endGame(game.id, reason, winner)

  const backendMessage = createGameEndedMessage(
    reason,
    reason === 'checkmate' ? (turn === 'White' ? 'white' : 'black') : 'draw'
  )

  server.publish(`game-${gameId}`, JSON.stringify(backendMessage))
}

const setupNextPlayerTimeout = (game: Game, turn: 'White' | 'Black', gameId: string, server: GameServer) => {
  if (turn === 'White' && game.remainingTime.black) {
    game.timeout = setTimeout(() => {
      game.remainingTime.black = 0
      gamesStore.endGame(game.id, 'timeout', 'white')

      const backendMessage = createGameEndedMessage('timeout', 'white')
      server.publish(`game-${gameId}`, JSON.stringify(backendMessage))
    }, game.remainingTime.black)
  } else if (turn === 'Black' && game.remainingTime.white) {
    game.timeout = setTimeout(() => {
      game.remainingTime.white = 0
      gamesStore.endGame(game.id, 'timeout', 'black')

      const backendMessage = createGameEndedMessage('timeout', 'black')
      server.publish(`game-${gameId}`, JSON.stringify(backendMessage))
    }, game.remainingTime.white)
  }
}
