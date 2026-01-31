<script setup lang="ts">
import CountdownTimer from './CountdownTimer.vue'

interface Props {
  name: string | undefined
  color: 'White' | 'Black'
  lastMoveAt: number
  remainingTime: number
  isPaused: boolean
}

defineProps<Props>()
</script>

<template>
  <div :class="`playerInfo ${color === 'Black' ? 'black' : 'white'}`">
    <div>
      {{ name || 'Unknown' }} ({{ color }})
      <span class="playerWaitingInfo" v-if="name === '?'">Waiting for opponent...</span>
    </div>
    <CountdownTimer
      :lastMoveAt="lastMoveAt"
      :remainingTime="remainingTime"
      :isPaused="isPaused"
    />
  </div>
</template>

<style lang="css" scoped>
.playerInfo {
  font-size: 1rem;
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  display: flex;
  justify-content: space-between;
}

.playerInfo.white {
  background-color: #f0f0f0;
  color: #000;
}

.playerWaitingInfo {
  font-size: 0.8rem;
}
</style>