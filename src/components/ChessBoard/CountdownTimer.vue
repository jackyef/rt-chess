<script lang="ts" setup>
import { ref, watch, onUnmounted, computed } from 'vue'

const {
  remainingTime: remainingTimeProps,
  isPaused = false,
  lastMoveAt: lastMoveAtProps,
} = defineProps<{
  lastMoveAt: number
  remainingTime: number
  isPaused?: boolean
}>()

let intervalId: ReturnType<typeof setInterval> | null = null
const remainingTime = ref(remainingTimeProps)
const lastMoveAt = ref(lastMoveAtProps)

const targetTimestamp = computed(() => {
  return lastMoveAt.value + remainingTimeProps
})

function stop() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function start() {
  stop()

  intervalId = setInterval(() => {
    const next = targetTimestamp.value - Date.now()
    remainingTime.value = Math.max(next, 0)

    if (remainingTime.value === 0) {
      stop()
    }
  }, 250) // smoother than 1s, still cheap
}

/**
 * React to prop changes from server
 */
watch(
  () => [remainingTimeProps, lastMoveAtProps],
  ([newTime, newLastMoveAt]) => {
    remainingTime.value = newTime ?? 0
    lastMoveAt.value = newLastMoveAt ?? 0
    if (!isPaused) {
      start()
    }
  },
  { immediate: true },
)

/**
 * React to pause / resume
 */
watch(
  () => isPaused,
  (paused) => {
    if (paused) {
      stop()
    } else {
      start()
    }
  },
)

onUnmounted(stop)
</script>

<template>
  <div class="countdown-timer">
    <span
      >{{ Math.floor(remainingTime / 60000) }}:{{
        (Math.floor(remainingTime / 1000) % 60).toString().padStart(2, '0')
      }}</span
    >
  </div>
</template>

<style scoped>
.countdown-timer {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
