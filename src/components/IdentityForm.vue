<script setup lang="ts">
import { useIdentityStore } from '@/stores/identity'
import { storeToRefs } from 'pinia'

const { onSuccess } = defineProps<{ onSuccess?: () => void }>()

const identityStore = useIdentityStore()
const { identity } = storeToRefs(identityStore)

const handleSetIdentity = async (event: SubmitEvent) => {
  const form = event.target as HTMLFormElement
  const identityValue = form['identity'].value

  await identityStore.setIdentity(identityValue)
  onSuccess?.()
}
</script>

<template>
  <form class="container" v-if="!identity" @submit.prevent="handleSetIdentity">
    <input type="text" placeholder="Set your name" name="identity" />
    <button type="submit">Set identity</button>
  </form>
  <div v-else class="container">
    <h2>Hi, {{ identity }}!</h2>
    <button @click="identityStore.resetIdentity">Change name</button>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
</style>
