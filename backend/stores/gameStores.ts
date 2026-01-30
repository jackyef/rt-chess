import { Chess } from 'chess.js'
import type { Game } from '../types'

/**
 * Keep track of all ongoing games in memory.
 * Each game is identified by a unique game ID.
 */
export const store: Map<string, Game> = new Map()

export const createGame = (gameId: string) => {
  if (store.has(gameId)) {
    throw new Error('Game with this ID already exists')
  }

  const newGame: Game = {
    id: gameId,
    startedAt: new Date().toISOString(),
    endedAt: '',
    pgn: '',
    chessInstance: new Chess(),
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
