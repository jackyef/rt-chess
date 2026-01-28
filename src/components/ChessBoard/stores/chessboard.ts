import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Chess, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '../constants'

export const useChessBoardStore = defineStore('chessboard', () => {
  const pgn = ref('')
  const chessJs = ref<Chess>(new Chess())

  function setPgn(newPgn: string) {
    pgn.value = newPgn
    chessJs.value.loadPgn(newPgn)
  }

  function getPieceForSquare(square: Square) {
    const piece = chessJs.value.get(square)
    if (piece) {
      return piece.color + piece.type as ColorAndPieceSymbol
    }
    return null
  }

  return { pgn, setPgn, chessJs, getPieceForSquare }
})
