<script setup lang="ts">
import { createStockfishClient, type StockfishEvaluation } from '@/api/stockfish.api';
import { computed, onUnmounted, onWatcherCleanup, ref, watch } from 'vue';

const { fen, topPlayer } = defineProps<{
  fen: string
  topPlayer: 'White' | 'Black'
}>()

const stockfishClient = createStockfishClient()
const evaluation = ref<StockfishEvaluation>({
  type: 'cp',
  value: 0
})

watch(() => fen, () => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const unsubscribe = stockfishClient.subscribe(newEvaluation => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => {
      evaluation.value = newEvaluation
    }, 300)
  })

  stockfishClient.evaluateFen(fen)

  onWatcherCleanup(() => {
    unsubscribe()
    if (timeout) {
      clearTimeout(timeout)
    }
  })
}, { immediate: true })

onUnmounted(() => {
  stockfishClient.close()
})

const shouldFlipBar = computed(() => topPlayer === 'White')

const whiteBarHeightPercentage = () => {
  const evalType = evaluation.value.type

  if (evalType === 'mate') {
    return evaluation.value.value > 0 ? 100 : 0
  }

  const evalValue = evaluation.value.value
  const maxEval = 1000 // 100% bar height at +10.0 or -10.0
  const isWhiteAdvantage = evalValue >= 0
  const absoluteEval = Math.abs(evalValue)
  const clampedEval = Math.min(absoluteEval, maxEval)

  // For example, if it's +500
  // 1000 - 500 = 500
  // 500 / 1000 * 100 = 50
  // 100 - 50 = 50
  // 50 / 2 = 25
  // 100 - 25 = 75% height for white bar
  const barDiff = ((maxEval - clampedEval) / 1000 * 100)
  const winningBarPercentage = 100 - (barDiff / 2)

  return isWhiteAdvantage ? winningBarPercentage : 100 - winningBarPercentage
}

const shownValuation = computed(() => {
  if (evaluation.value.type === 'mate') {
    return `M${evaluation.value.value}`
  } else {
    const sign = evaluation.value.value > 0 ? '+' : ''
    const centipawns = evaluation.value.value
    const pawns = (centipawns / 100).toFixed(1)
    return `${sign}${pawns}`
  }
})

</script>

<template>
  <div :class="`bar ${shouldFlipBar ? 'flipped' : ''}`">
    <div class="black" :style="{ height: (100 - whiteBarHeightPercentage()) + '%' }"></div>
    <div class="white" :style="{ height: (whiteBarHeightPercentage()) + '%' }"></div>
  </div>

  <div class="popover">{{  shownValuation  }}</div>
</template>

<style lang="css" scoped>
.bar {
  anchor-name: --evalbar;
  width: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: clip;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.popover {
  position: absolute;
  position-anchor: --evalbar;
  top: anchor(center);
  left: anchor(left);
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  width: 5ch;
  text-align: center;
  transform: translate(-25%, -50%);
}

.bar.flipped {
  flex-direction: column-reverse;
}

.white, .black {
  transition: height 0.5s ease;
}

.white {
  background-color: #f0f0f0;
}

.black {
  background-color: #202020;
}
</style>
