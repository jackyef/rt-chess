<script setup lang="ts">
import { ref } from 'vue'
import IdentityForm from '../IdentityForm.vue'
import { useIdentityStore } from '@/stores/identity'

interface Props {
  canJoin: boolean
  onJoin: () => void
}

const props = defineProps<Props>()

const identityStore = useIdentityStore()
const joinState = ref<'none' | 'joining'>('none')

const handleJoinGame = () => {
  if (!identityStore.identity) {
    joinState.value = 'joining'
  } else {
    props.onJoin()
  }
}
</script>

<template>
  <div v-if="canJoin" class="joinGameContainer">
    <button v-if="joinState === 'none'" @click="handleJoinGame">Join game</button>
    <IdentityForm v-if="joinState === 'joining'" :onSuccess="onJoin" />
  </div>
</template>

<style lang="css" scoped>
.joinGameContainer {
  margin-bottom: 16px;
}
</style>