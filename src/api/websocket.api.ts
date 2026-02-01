/**
 * WebSocket client for real-time game communication
 */
import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from '@/types/api.types'

export type Subscriber = (message: BackendGameWebSocketMessage) => void

export interface WebSocketGameClient {
  onDisconnection: (callback: () => void) => void
  subscribe: (subscriber: Subscriber) => () => void
  sendMessage: (message: ClientGameWebSocketMessage) => void
  close: () => void
}

export const createWebSocketGameClient = (gameId: string): WebSocketGameClient => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const wsUrl = `${protocol}://${window.location.host}/api/ws/game?gameId=${gameId}`
  const socket = new WebSocket(wsUrl)

  let intentionallyClosed = false
  const subscribers = new Set<Subscriber>()
  const disconnectCallbacks = new Set<() => void>()

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as BackendGameWebSocketMessage
    subscribers.forEach((subscriber) => {
      subscriber(message)
    })
  }

  socket.onerror = () => {
    socket.close()
  }

  socket.onclose = () => {
    if (!intentionallyClosed) {
      disconnectCallbacks.forEach((callback) => callback())
    }
  }

  return {
    onDisconnection: (callback: () => void) => {
      disconnectCallbacks.add(callback)
    },
    subscribe: (subscriber: Subscriber) => {
      subscribers.add(subscriber)
      return () => subscribers.delete(subscriber)
    },
    sendMessage: (message: ClientGameWebSocketMessage) => {
      socket.send(JSON.stringify(message))
    },
    close: () => {
      intentionallyClosed = true
      socket.close()
      subscribers.clear()
    },
  }
}
