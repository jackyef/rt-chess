/**
 * Shared types between frontend and backend
 * These types define the API contract
 */

export type GameEndedReason =
  | 'timeout'
  | 'checkmate'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'draw_agreement'

export type GameState = {
  winner: 'white' | 'black' | 'draw' | null
  startedAt: number | null
  endedAt: number | null
  lastMoveAt: number | null
  endedReason: GameEndedReason | null
  remainingTime: {
    white: number | null
    black: number | null
  }
  pgn: string
}

export type BackendGameWebSocketMessage =
  | {
    type: 'info'
    payload: {
      message: string
    }
  }
  | {
    type: 'move_made'
    payload: {
      san: string
      lastMoveAt: number
      remainingTime: {
        white: number
        black: number
      }
    }
  }
  | {
    type: 'illegal_move_attempt'
    payload: {
      san: string
    }
  }
  | {
    type: 'player_joined'
  }
  | {
    type: 'game_ended'
    payload: {
      reason: GameEndedReason
      winner: 'white' | 'black' | 'draw'
    }
  }

export type ClientGameWebSocketMessage =
  | {
    type: 'make_move'
    payload: {
      san: string
    }
  }
  | {
    type: 'join_game'
  }
