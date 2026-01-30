<script lang="ts" setup>
const props = defineProps<{
  playingAs: 'White' | 'Black'
}>()

import { SQUARES } from 'chess.js'
import Square from './Square.vue'
import { ref, computed } from 'vue'
import { useChessBoardPvpStore } from './stores/chessboardPvp'

const chessBoardStore = useChessBoardPvpStore()

const isBoardFlipped = ref(props.playingAs === 'Black' ? true : false)
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

  <div>Game State: {{ chessBoardStore.board.gameState }}</div>
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
}
</style>
