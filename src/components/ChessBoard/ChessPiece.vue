<script setup lang="ts">
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

defineProps<{
  piece: ColorAndPieceSymbol
  draggable?: boolean
}>()

import type { ColorAndPieceSymbol } from './constants'

const pieceImages: Record<ColorAndPieceSymbol, string> = {
  bb: blackBishop,
  wb: whiteBishop,
  bk: blackKing,
  wk: whiteKing,
  bn: blackKnight,
  wn: whiteKnight,
  bp: blackPawn,
  wp: whitePawn,
  bq: blackQueen,
  wq: whiteQueen,
  br: blackRook,
  wr: whiteRook,
} as const
</script>

<template>
  <img v-if="piece" :src="pieceImages[piece]" :alt="piece" :draggable="draggable" />
</template>

<style lang="css" scoped>
img {
  width: 90%;
  height: auto;
}
</style>
