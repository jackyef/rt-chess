<script setup lang="ts">
import type { Square } from 'chess.js';
import blackBishop from './assets/black-bishop.svg'
import whiteBishop from './assets/white-bishop.svg'
import blackKing from './assets/black-king.svg'
import whiteKing from './assets/white-king.svg'
import blackKnight from './assets/black-knight.svg'
import whiteKnight from './assets/white-knight.svg'
import blackPawn from './assets/black-pawn.svg'
import whitePawn from './assets/white-pawn.svg'
import blackQueen from './assets/black-queen.svg'
import whiteQueen from './assets/white-queen.svg'
import blackRook from './assets/black-rook.svg'
import whiteRook from './assets/white-rook.svg'

const props = defineProps<{
  squareId: Square
}>()

import { useChessBoardStore } from './stores/chessboard'
import type { ColorAndPieceSymbol } from './constants';

let chessBoardStore = useChessBoardStore()
let piece = chessBoardStore.getPieceForSquare(props.squareId)

const pieceImages: Record<ColorAndPieceSymbol, string> = {
  'bb': blackBishop,
  'wb': whiteBishop,
  'bk': blackKing,
  'wk': whiteKing,
  'bn': blackKnight,
  'wn': whiteKnight,
  'bp': blackPawn,
  'wp': whitePawn,
  'bq': blackQueen,
  'wq': whiteQueen,
  'br': blackRook,
  'wr': whiteRook
} as const

</script>

<template>
  <div>
    <template v-if="piece">
      <button @click="chessBoardStore.onPieceClick(props.squareId)">
        <img :src="pieceImages[piece]" :alt="piece" />
      </button>
    </template>
  </div>
</template>

<style lang="css" scoped>
  button {
    all: unset;
    cursor: pointer;
  }
  img {
    max-width: 100%;
    height: auto;
  }
</style>
