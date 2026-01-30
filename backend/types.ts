import type { Chess } from 'chess.js'

export type Game = {
  startedAt: string
  endedAt: string
  id: string
  pgn: string
  chessInstance: Chess
}
