export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, 'NETWORK_ERROR', statusCode)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class GameError extends AppError {
  constructor(message: string, public gameId?: string) {
    super(message, 'GAME_ERROR')
    this.name = 'GameError'
  }
}