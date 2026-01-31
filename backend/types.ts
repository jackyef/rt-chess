import type { Chess } from 'chess.js'

export type Game = {
  startedAt: number | null
  endedAt: number | null
  lastMoveAt: number | null
  id: string
  chessInstance: Chess
  timeControl: GameOptions['timeControl']
  remainingTime: {
    white: number | null,
    black: number | null,
  },
  timeout: ReturnType<typeof setTimeout> | null
}

export type GameOptions = {
  timeControl?: {
    initial: number // in milliseconds
    increment: number // in milliseconds
  }
}

export type GameState = {
  startedAt: number | null
  endedAt: number | null
  lastMoveAt: number | null
  pgn: string
  remainingTime: {
    white: number,
    black: number,
  }
}
