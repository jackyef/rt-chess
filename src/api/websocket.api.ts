/**
 * WebSocket client for real-time game communication
 */
import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from '@/types/api.types'

export type Subscriber = (message: BackendGameWebSocketMessage) => void

export interface WebSocketGameClient {
  subscribe: (subscriber: Subscriber) => () => void
  sendMessage: (message: ClientGameWebSocketMessage) => void
  close: () => void
}

export const createWebSocketGameClient = (gameId: string): WebSocketGameClient => {
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
