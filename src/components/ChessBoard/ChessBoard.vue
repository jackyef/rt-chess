<script lang="ts" setup>
const props = defineProps<{
  initialPgn: string
}>()

import { useChessBoardStore } from './stores/chessboard'
import { ROWS, COLUMNS } from './constants';
import Square from './Square.vue';

const chessBoardStore = useChessBoardStore()
chessBoardStore.setPgn(props.initialPgn)

</script>

<template>
  <div class="chessboard">
    <template v-for="(row, i) in ROWS">
      <template v-for="(col, j) in COLUMNS">
        <Square :square="`${col}${row}`" />
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
</style>
