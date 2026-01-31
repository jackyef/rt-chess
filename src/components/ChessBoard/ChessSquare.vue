<script setup lang="ts">
import type { Square } from 'chess.js'
import Piece from './ChessPiece.vue'
import type { ColorAndPieceSymbol } from './constants'

const props = defineProps<{
  square: Square
  piece: ColorAndPieceSymbol | null
  color: 'light' | 'dark'
  onClick?: () => void
  onDrop?: (fromSquare: Square, toSquare: Square) => void
  isHighlighted?: boolean
  isLastMove?: boolean
}>()

const handleDragStart = (event: DragEvent) => {
  if (props.piece && event.dataTransfer) {
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ piece: props.piece, square: props.square }),
    )
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (props.onDrop && event.dataTransfer) {
    try {
      const data = JSON.parse(event.dataTransfer.getData('text/plain'))
      props.onDrop(data.square, props.square)
    } catch (error) {
      console.error('Failed to parse drag data:', error)
    }
  }
}
</script>

<template>
  <template v-if="onClick">
    <button
      :class="`square ${color} ${isLastMove ? 'last-move' : ''}`"
      :data-square="square"
      @click="onClick"
      @dragover.prevent
      @drop="handleDrop"
    >
      <Piece v-if="piece" :piece :draggable="true" @dragstart="handleDragStart" />
      <div v-if="isHighlighted" class="dot"></div>
    </button>
  </template>
  <template v-else>
    <div
      :class="`square ${color} ${isLastMove ? 'last-move' : ''}`"
      :data-square="square"
      @dragover.prevent
      @drop="handleDrop"
    >
      <Piece v-if="piece" :piece :draggable="true" @dragstart="handleDragStart" />
      <div v-if="isHighlighted" class="dot"></div>
    </div>
  </template>
</template>

<style lang="css" scoped>
button {
  margin: 0;
  padding: 0;
  outline: none;
  text-align: inherit;
  border: none;
  cursor: pointer;
}

button:hover {
  filter: brightness(1.1);
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
  top: 4px;
  left: 4px;
  font-size: 0.8rem;
  color: #eaeaea;
  z-index: -1;
}

.dot {
  width: 20%;
  height: 20%;
  background-color: rgba(40, 40, 40, 0.5);
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

.last-move {
  box-shadow: inset 0 0 0 3px #ff6b35 !important;
}
</style>
