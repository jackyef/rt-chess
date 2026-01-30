<script setup lang="ts">
import { useIdentityStore } from '@/stores/identity'
import { storeToRefs } from 'pinia'

const identityStore = useIdentityStore()
const { identity } = storeToRefs(identityStore)

const handleSetIdentity = (event: SubmitEvent) => {
  const form = event.target as HTMLFormElement
  const identityValue = form['identity'].value

  ;(async () => {
    try {
      const response = await fetch('/api/identity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identity: identityValue }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      identityStore.refreshIdentity()
      console.log('Identity saved successfully')
    } catch (error) {
      console.error('Error saving identity:', error)
    }
  })()
}

const handleCreateMatch = () => {
  ;(async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()

      console.log('Match created successfully with ID:', json.id)

      // TODO: Redirect to the game page
    } catch (error) {
      console.error('Error creating match:', error)
    }
  })()
}

const handleJoinMatch = (event: SubmitEvent) => {
  const form = event.target as HTMLFormElement
  const gameIdValue = form['gameId'].value

  ;(async () => {
    try {
      const response = await fetch(`/api/game/${gameIdValue}/join`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()

      console.log('Match joined successfully with ID:', json.id)

      // TODO: Redirect to the game page
    } catch (error) {
      console.error('Error joining match:', error)
    }
  })()
}
</script>

<template>
  <div class="pvp">
    <form v-if="!identity" @submit.prevent="handleSetIdentity">
      <input type="text" placeholder="Set your name" name="identity" />
      <button type="submit">Set identity</button>
    </form>
    <div v-else>
      <h2>Hi, {{ identity }}! <button @click="identityStore.resetIdentity">Change name</button></h2>

      <div class="match">
        <button @click="handleCreateMatch">Create a match</button>
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

.pvp {
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
