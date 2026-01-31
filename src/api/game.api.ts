/**
 * Game state and match management API client
 */
import type { GameState } from '@/types/api.types'
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
