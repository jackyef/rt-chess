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
    reason: 'timeout' | 'checkmate' | 'stalemate' | 'resignation' | 'draw_agreement',
    winner: 'white' | 'black' | 'draw'
  }
}

export const parseBackendGameWebSocketMessage = (message: string): BackendGameWebSocketMessage => {
  const data = JSON.parse(message)

  return data as BackendGameWebSocketMessage
}

export type ClientGameWebSocketMessage = {
  type: 'make_move'
  payload: {
    san: string
  }
} | {
  type: 'join_game'
}

export const parseClientGameWebSocketMessage = (message: string): ClientGameWebSocketMessage => {
  const data = JSON.parse(message)

  return data as ClientGameWebSocketMessage
}
