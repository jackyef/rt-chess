export type BackendGameWebSocketMessage = {
  type: 'info'
  payload: {
    message: string
  }
} | {
  type: 'move_made'
  payload: {
    san: string
  }
} | {
  type: 'illegal_move_attempt'
  payload: {
    san: string
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
}

export const parseClientGameWebSocketMessage = (message: string): ClientGameWebSocketMessage => {
  const data = JSON.parse(message)

  return data as ClientGameWebSocketMessage
}
