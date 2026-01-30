import { onMounted, onUnmounted, ref, watch, type ComputedRef } from "vue"

import type { BackendGameWebSocketMessage, ClientGameWebSocketMessage } from "../../../backend/lib/websocket"
import { parseBackendGameWebSocketMessage } from "../../../backend/lib/websocket"

export const getGamePgn = async (gameId: string): Promise<string> => {
  const response = await fetch(`/api/game/${gameId}`, {
    method: 'GET',
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const json = await response.json()
  return json.pgn as string
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

export const useWsGameClient = (gameId: ComputedRef<string>) => {
   const wsClient = ref<ReturnType<typeof createWsGameClient> | null>(null)

    onMounted(() => {
      if (gameId.value && gameId.value !== 'undefined') {
        wsClient.value = createWsGameClient(gameId.value)
      }
    })

    onUnmounted(() => {
      if (wsClient.value) {
        wsClient.value.close()
        wsClient.value = null
      }
    })

    watch(gameId, (newGameId) => {
      if (!newGameId || newGameId === 'undefined') return
      if (wsClient.value) {
        // clean up previous wsClient
        wsClient.value.close()
        wsClient.value = null
      }

      wsClient.value = createWsGameClient(newGameId)
    })

    return wsClient
  }
