/**
 * Identity/authentication API client
 */
import { NetworkError, ValidationError } from '@/types/errors'

export const getIdentity = async (): Promise<string> => {
  const response = await fetch('/api/identity')
  if (!response.ok) {
    throw new NetworkError(`Failed to fetch identity: ${response.statusText}`, response.status)
  }
  const data = await response.json()
  return data.identity
}

export const updateIdentity = async (identity: string): Promise<string> => {
  if (!identity.trim()) {
    throw new ValidationError('Identity cannot be empty', 'identity')
  }

  const response = await fetch('/api/identity', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity }),
  })

  if (!response.ok) {
    throw new NetworkError(`Failed to update identity: ${response.statusText}`, response.status)
  }

  return identity
}
