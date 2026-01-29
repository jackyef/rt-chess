<script lang="ts" setup>
const props = defineProps<{
  initialPgn: string
}>()

import { useChessBoardStore } from './stores/chessboard'
import { ROWS, COLUMNS } from './constants'
import Square from './Square.vue'

const chessBoardStore = useChessBoardStore()
chessBoardStore.setPgn(props.initialPgn)
</script>

<template>
  <div class="chessboard">
    <template v-for="row in ROWS" :key="row">
      <template v-for="col in COLUMNS" :key="`${col}${row}`">
        <Square
          :square="`${col}${row}`"
          :piece="chessBoardStore.getPieceForSquare(`${col}${row}`)"
          :onClick="() => chessBoardStore.handleSquareClick(`${col}${row}`)"
          :isHighlighted="chessBoardStore.highlightedSquares.includes(`${col}${row}`)"
          :color="chessBoardStore.getSquareColor(`${col}${row}`)"
        />
      </template>
    </template>
  </div>

  <div>Game State: {{ chessBoardStore.board.gameState }}</div>
  <button @click="chessBoardStore.setPgn('')">Reset board</button>
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
