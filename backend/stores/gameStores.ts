import { Chess } from 'chess.js'
import type { Game, GameOptions } from '../types'

/**
 * Keep track of all ongoing games in memory.
 * Each game is identified by a unique game ID.
 */
export const store: Map<string, Game> = new Map()

export const createGame = (gameId: string, options?: GameOptions) => {
  if (store.has(gameId)) {
    throw new Error('Game with this ID already exists')
  }

  const newGame: Game = {
    id: gameId,
    startedAt: null,
    endedAt: null,
    lastMoveAt: null,
    chessInstance: new Chess(),
    timeControl: {
      initial: 180000, // default to 3 minutes
      increment: 2000, // default to 2 seconds
    },
    remainingTime: {
      white: null,
      black: null,
    },
    timeout: null,
    ...options,
  }
  store.set(gameId, newGame)
  return newGame
}

export const getGame = (gameId: string) => {
  return store.get(gameId) || null
}

export const deleteGame = (gameId: string) => {
  return store.delete(gameId)
}
