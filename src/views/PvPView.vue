<script setup lang="ts">
import IdentityForm from '@/components/IdentityForm.vue'
import { createMatch, joinMatch } from '@/lib/clients/gameClient'
import { useIdentityStore } from '@/stores/identity'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const identityStore = useIdentityStore()
const { identity } = storeToRefs(identityStore)

const handleCreateMatch = () => {
  ;(async () => {
    try {
      const gameId = await createMatch()

      router.push(`/pvp/game/${gameId}`)
    } catch (error) {
      console.error('Error creating match:', error)
    }
  })()
}

const handleJoinMatch = (event: SubmitEvent) => {
  const form = event.target as HTMLFormElement
  const gameIdValue = form['gameId'].value as string

  ;(async () => {
    try {
      const gameId = await joinMatch(gameIdValue)
      console.log('Match joined successfully with ID:', gameId)

      router.push(`/pvp/game/${gameId}`)
    } catch (error) {
      console.error('Error joining match:', error)
    }
  })()
}
</script>

<template>
  <div class="container">
    <IdentityForm />

    <div v-if="identity">
      <div class="match">
        <button @click="handleCreateMatch">Start a game</button>
        <div>or,</div>
        <form @submit.prevent="handleJoinMatch">
          <input type="text" placeholder="game ID" name="gameId" />
          <button type="submit">Join a match</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
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
</style>
