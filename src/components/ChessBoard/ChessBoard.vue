<script lang="ts" setup>
const props = defineProps<{
  initialPgn: string
}>()

import { useChessBoardStore } from './stores/chessboard'
import { ROWS, COLUMNS } from './constants';
import Piece from './Piece.vue';

const chessBoardStore = useChessBoardStore()
chessBoardStore.setPgn(props.initialPgn)

</script>

<template>
  <div class="chessboard">
    <template v-for="(row, i) in ROWS">
      <template v-for="(col, j) in COLUMNS" :piece="chessBoardStore.getPieceForSquare(`${col}${row}`)">
        <div
          :class="`square ${(i + j) % 2 === 0 ? 'light' : 'dark'}`"
          :data-square="`${col}${row}`"
        >
          <Piece :squareId="`${col}${row}`" />
        </div>
      </template>
    </template>
  </div>
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

.square {
  width: 12.5%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  isolation: isolate;
}

.square::before {
  content: attr(data-square);
  position: absolute;
  top: 2px;
  left: 2px;
  width: 100%;
  height: 100%;
  font-size: 0.6rem;
  color: #eaeaea;
  z-index: -1;
}

.light.square {
  background-color: #f0d9b5;
}

.light.square::before {
  color: #333;
}

.dark.square {
  background-color: #b58863;
}
</style>
