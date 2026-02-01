<script lang="ts" setup>
const props = defineProps<{
  initialPgn: string
}>()

import { SQUARES } from 'chess.js'
import { useChessBoardStore } from '@/stores/game/chessboard'
import Square from './ChessSquare.vue'
import { ref, computed } from 'vue'

const chessBoardStore = useChessBoardStore()
chessBoardStore.setPgn(props.initialPgn)

const isBoardFlipped = ref(false)
const toggleBoardFlip = () => {
  isBoardFlipped.value = !isBoardFlipped.value
}

const squares = computed(() => {
  return isBoardFlipped.value ? [...SQUARES].reverse() : SQUARES
})
</script>

<template>
  <div class="chessboard">
    <template v-for="square in squares" :key="square">
      <Square
        :square="square"
        :piece="chessBoardStore.getPieceForSquare(square)"
        :onClick="() => chessBoardStore.handleSquareClick(square)"
        :isHighlighted="chessBoardStore.highlightedSquares.includes(square)"
        :color="chessBoardStore.getSquareColor(square)"
      />
    </template>
  </div>

  <div>Game state: {{ chessBoardStore.board.gameState }}</div>
  <button @click="chessBoardStore.setPgn('')">Reset board</button>
  <button @click="toggleBoardFlip">Flip board</button>
</template>

<style lang="css" scoped>
.chessboard {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: 400px;
  aspect-ratio: 1 / 1;
  border: 2px solid #333;
  max-width: 100%;
}
</style>
