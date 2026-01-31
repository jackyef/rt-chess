/**
 * Library for interacting with the backend, either http or ws.
 * Do not use Vue-specific API here, keep it vanilla.
 */
import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from "../../../backend/lib/websocket"
import { parseBackendGameWebSocketMessage } from "../../../backend/lib/websocket"
import type { GameState } from "../../../backend/types"

export const getGameState = async (gameId: string): Promise<GameState> => {
  const response = await fetch(`/api/game/${gameId}`, {
    method: 'GET',
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const json = await response.json()
  return json as GameState
}


export const updateIdentity = async (identity: string): Promise<string> => {
  const response = await fetch('/api/identity', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity }),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  return identity
}

export const createMatch = async (): Promise<string> => {
  const response = await fetch('/api/game/create', {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const json = await response.json()

  return json.id as string
}

export const joinMatch = async (gameId: string): Promise<string> => {
  const response = await fetch(`/api/game/${gameId}/join`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const json = await response.json()

  return json.id as string
}
type Subscriber = (message: BackendGameWebSocketMessage) => void

export const createWsGameClient = (gameId: string) => {
  const wsUrl = `ws://${window.location.host}/api/ws/game?gameId=${gameId}`
  const socket = new WebSocket(wsUrl)

  const subscribers = new Set<Subscriber>()

  socket.onmessage = (event) => {
    const message = parseBackendGameWebSocketMessage(event.data)
    subscribers.forEach((subscriber) => {
      subscriber(message)
    })
  }

  return {
    subscribe: (subscriber: Subscriber) => {
      subscribers.add(subscriber)
      return () => subscribers.delete(subscriber)
    },
    sendMessage: (message: ClientGameWebSocketMessage) => {
      socket.send(JSON.stringify(message))
    },
    close: () => {
      socket.close()
      subscribers.clear()
    },
  }
}

export type WsGameClient = ReturnType<typeof createWsGameClient>
