import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Chess, type Square } from 'chess.js'
import type { ColorAndPieceSymbol } from '../constants'

export const useChessBoardStore = defineStore('chessboard', () => {
  const pgn = ref('')
  const chessJs = ref<Chess>(new Chess())
  const highlightedSquares = ref<string[]>([])

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

  function getSquareColor(square: Square) {
    return chessJs.value.squareColor(square)
  }

  function onPieceClick(square: Square) {
    highlightedSquares.value = chessJs.value.moves({ square })
  }

  console.log({ highlightedSquares})

  return { pgn, setPgn, chessJs, getPieceForSquare, getSquareColor, onPieceClick, highlightedSquares}
})
