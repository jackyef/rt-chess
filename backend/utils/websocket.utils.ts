import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage, GameEndedReason } from '../types'

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
  lastMoveAt: number,
  remainingTime: { white: number; black: number },
): BackendGameWebSocketMessage => ({
  type: 'move_made',
  payload: { san, lastMoveAt, remainingTime },
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
