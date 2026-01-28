<script setup lang="ts">
import { computed } from 'vue';
import { useChessBoardStore } from './stores/chessboard';
import type { Square } from 'chess.js';
import Piece from './Piece.vue';

const props = defineProps<{
  square: Square
}>()

const chessBoardStore = useChessBoardStore()
let highlightedSquares = computed(() => chessBoardStore.highlightedSquares)
let squareColor = computed(() => chessBoardStore.getSquareColor(props.square))

</script>

<template>
  <div :class="`square ${squareColor}`" :data-square="square" @click="">
    <Piece :squareId="square" />

    <div v-if="highlightedSquares.includes(square)" class="dot"></div>
  </div>
</template>


<style lang="css" scoped>
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

.dot {
  width: 20%;
  height: 20%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
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
