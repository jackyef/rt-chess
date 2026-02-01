import type { GameEndedReason } from './game.types'

export type BackendGameWebSocketMessage = {
  type: 'info'
  payload: {
    message: string
  }
} | {
  type: 'move_made'
  payload: {
    san: string
    lastMoveAt: number
    remainingTime: {
      white: number,
      black: number,
    }
  }
} | {
  type: 'illegal_move_attempt'
  payload: {
    san: string
  }
} | {
  type: 'player_joined'
} | {
  type: 'game_ended'
  payload: {
    reason: GameEndedReason
    winner: 'white' | 'black' | 'draw'
  }
}

export type ClientGameWebSocketMessage = {
  type: 'make_move'
  payload: {
    san: string
  }
} | {
  type: 'join_game'
}

export type WebSocketData = {
  identity: string
  gameId: string
}
