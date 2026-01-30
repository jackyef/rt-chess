export const createGameClient = () => {
  // TODO: Derive from env
  const serverBaseUrl = 'http://localhost:3000/api'

  return {
    setIdentity: async (identity: string) => {
      const response = await fetch(`${serverBaseUrl}/identity`, {
        method: 'PUT',
        body: JSON.stringify({ identity }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to set identity')
      }
    },
    createGame: async () => {
      const response = await fetch(`${serverBaseUrl}/game/create`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create game')
      }

      const data = await response.json()
      return data as { id: string; pgn: string }
    },
    joinGame: async () => {
      const response = await fetch(`${serverBaseUrl}/game/join`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to join game')
      }

      const data = await response.json()
      return data as { id: string; pgn: string }
    },
    getGame: async (gameId: string) => {
      const response = await fetch(`${serverBaseUrl}/game/${gameId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to get game')
      }

      const data = await response.json()
      return data as { id: string; pgn: string }
    }
  }
}
