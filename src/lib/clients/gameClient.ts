/**
 * Library for interacting with the backend, either http or ws.
 * Do not use Vue-specific API here, keep it vanilla.
 */
import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from "../../../backend/types"
import type { GameState } from "../../../backend/types"
import { NetworkError, ValidationError, GameError } from '@/types/errors'

export const getGameState = async (gameId: string): Promise<GameState> => {
  const response = await fetch(`/api/game/${gameId}`, {
    method: 'GET',
  })
  if (!response.ok) {
    throw new NetworkError(`Failed to get game state: ${response.statusText}`, response.status)
  }

  const json = await response.json()
  return json as GameState
}


export const updateIdentity = async (identity: string): Promise<string> => {
  if (!identity.trim()) {
    throw new ValidationError('Identity cannot be empty', 'identity')
  }

  const response = await fetch('/api/identity', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity }),
  })
  if (!response.ok) {
    throw new NetworkError(`Failed to update identity: ${response.statusText}`, response.status)
  }

  return identity
}

export const createMatch = async (): Promise<string> => {
  const response = await fetch('/api/game/create', {
    method: 'POST',
  })
  if (!response.ok) {
    throw new NetworkError(`Failed to create match: ${response.statusText}`, response.status)
  }
  const json = await response.json()

  return json.id as string
}

export const joinMatch = async (gameId: string): Promise<string> => {
  if (!gameId.trim()) {
    throw new ValidationError('Game ID cannot be empty', 'gameId')
  }

  const response = await fetch(`/api/game/${gameId}/join`, {
    method: 'POST',
  })
  if (!response.ok) {
    if (response.status === 404) {
      throw new GameError(`Game ${gameId} not found`, gameId)
    }
    throw new NetworkError(`Failed to join match: ${response.statusText}`, response.status)
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
    const message = JSON.parse(event.data) as BackendGameWebSocketMessage
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
