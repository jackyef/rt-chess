import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from '../types/websocket.types'
import type { GameEndedReason } from '../types/game.types'

export const parseClientGameWebSocketMessage = (message: string): ClientGameWebSocketMessage => {
  const data = JSON.parse(message)
  return data as ClientGameWebSocketMessage
}

export const createInfoMessage = (message: string): BackendGameWebSocketMessage => ({
  type: 'info',
  payload: { message },
})

export const createMoveMadeMessage = (
  san: string,
): BackendGameWebSocketMessage => ({
  type: 'move_made',
  payload: { san },
})

export const createUpdateRemainingTimeMessage = (
  lastMoveAt: number,
  remainingTime: { white: number; black: number },
): BackendGameWebSocketMessage => ({
  type: 'update_remaining_time',
  payload: {
    lastMoveAt,
    remainingTime,
  },
})

export const createIllegalMoveMessage = (san: string): BackendGameWebSocketMessage => ({
  type: 'illegal_move_attempt',
  payload: { san },
})

export const createPlayerJoinedMessage = (): BackendGameWebSocketMessage => ({
  type: 'player_joined',
})

export const createGameEndedMessage = (
  reason: GameEndedReason,
  winner: 'white' | 'black' | 'draw',
): BackendGameWebSocketMessage => ({
  type: 'game_ended',
  payload: { reason, winner },
})
