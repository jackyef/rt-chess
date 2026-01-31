<script setup lang="ts">
import IdentityForm from '@/components/IdentityForm.vue'
import { createMatch, joinMatch } from '@/lib/clients/gameClient'
import { useIdentityStore } from '@/stores/identity'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { NetworkError, ValidationError, GameError } from '@/types/errors'

const router = useRouter()
const identityStore = useIdentityStore()
const { identity } = storeToRefs(identityStore)

const isCreatingMatch = ref(false)
const isJoiningMatch = ref(false)
const joinError = ref<string | null>(null)

const handleCreateMatch = async () => {
  isCreatingMatch.value = true
  joinError.value = null
  try {
    const gameId = await createMatch()
    router.push(`/pvp/game/${gameId}`)
  } catch (error) {
    console.error('Error creating match:', error)
    if (error instanceof NetworkError) {
      joinError.value = 'Network error. Please try again.'
    } else {
      joinError.value = 'Failed to create match. Please try again.'
    }
  } finally {
    isCreatingMatch.value = false
  }
}

const handleJoinMatch = async (event: SubmitEvent) => {
  const form = event.target as HTMLFormElement
  const gameIdValue = form['gameId'].value.trim()

  if (!gameIdValue) {
    joinError.value = 'Please enter a game ID'
    return
  }

  isJoiningMatch.value = true
  joinError.value = null

  try {
    const gameId = await joinMatch(gameIdValue)
    console.log('Match joined successfully with ID:', gameId)
    router.push(`/pvp/game/${gameId}`)
  } catch (error) {
    console.error('Error joining match:', error)
    if (error instanceof ValidationError) {
      joinError.value = error.message
    } else if (error instanceof GameError) {
      joinError.value = 'Game not found. Please check the game ID.'
    } else if (error instanceof NetworkError) {
      joinError.value = 'Network error. Please try again.'
    } else {
      joinError.value = 'Failed to join match. Please try again.'
    }
  } finally {
    isJoiningMatch.value = false
  }
}
</script>

<template>
  <div class="container">
    <IdentityForm />

    <div v-if="identity">
      <div class="match">
        <button @click="handleCreateMatch" :disabled="isCreatingMatch">
          {{ isCreatingMatch ? 'Creating...' : 'Start a game' }}
        </button>
        <div>or,</div>
        <form @submit.prevent="handleJoinMatch">
          <input type="text" placeholder="game ID" name="gameId" />
          <button type="submit" :disabled="isJoiningMatch">
            {{ isJoiningMatch ? 'Joining...' : 'Join a match' }}
          </button>
        </form>
        <div v-if="joinError" class="error">{{ joinError }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.match {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  margin-top: 32px;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 8px;
}
</style>
