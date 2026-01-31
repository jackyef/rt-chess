import type { Chess } from 'chess.js'

// The shape we are storing in memory.
export type Game = {
  startedAt: number | null
  endedAt: number | null
  lastMoveAt: number | null
  id: string
  chessInstance: Chess
  timeControl: GameOptions['timeControl']
  winner: 'white' | 'black' | 'draw' | null
  remainingTime: {
    white: number | null
    black: number | null
  }
  timeout: ReturnType<typeof setTimeout> | null
  endedReason: GameEndedReason | null
}

export type GameOptions = {
  timeControl?: {
    initial: number // in milliseconds
    increment: number // in milliseconds
  }
}

// TODO: Handle resignation and draw offers?
export type GameEndedReason =
  | 'timeout'
  | 'checkmate'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'draw_agreement'

// The shape we are exposing to the clients.
// Needs to be JSON-serializable.
export type GameState = Pick<
  Game,
  'winner' | 'startedAt' | 'endedAt' | 'lastMoveAt' | 'endedReason' | 'remainingTime'
> & {
  pgn: string
}
