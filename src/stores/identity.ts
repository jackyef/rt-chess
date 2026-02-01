import { updateIdentity, getIdentity } from '@/api/identity.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIdentityStore = defineStore('identity', () => {
  const identity = ref<string>('')

  const resetIdentity = () => {
    identity.value = ''
  }

  const setIdentity = async (newIdentity: string): Promise<void> => {
    try {
      await updateIdentity(newIdentity)
      await refreshIdentity()
    } catch (error) {
      console.error('Failed to update identity:', error)
      throw error
    }
  }

  const refreshIdentity = async () => {
    try {
      const fetchedIdentity = await getIdentity()
      identity.value = fetchedIdentity
    } catch (error) {
      console.error('Error fetching identity:', error)
    }
  }

  return { identity, refreshIdentity, resetIdentity, setIdentity }
})
