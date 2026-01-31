<script lang="ts" setup>
import { SQUARES } from 'chess.js'
import Square from './ChessSquare.vue'
import { ref, computed, watch } from 'vue'
import { useChessBoardPvpStore } from './stores/chessboardPvp'
import PlayerInfo from './PlayerInfo.vue'
import GameStatus from './GameStatus.vue'
import JoinGame from './JoinGame.vue'

const chessBoardStore = useChessBoardPvpStore()

const isBoardFlipped = ref(chessBoardStore.board.playingAs === 'Black' ? true : false)
const toggleBoardFlip = () => {
  isBoardFlipped.value = !isBoardFlipped.value
}

watch(
  () => chessBoardStore.board.playingAs,
  (newVal) => {
    if (newVal === 'Black') {
      isBoardFlipped.value = true
    } else if (newVal === 'White') {
      isBoardFlipped.value = false
    }
  },
)

const squares = computed(() => {
  return isBoardFlipped.value ? [...SQUARES].reverse() : SQUARES
})

const topPlayer = computed(() => {
  if (!isBoardFlipped.value) {
    return {
      color: 'Black' as const,
      name: chessBoardStore.board.blackPlayer,
    }
  } else {
    return {
      color: 'White' as const,
      name: chessBoardStore.board.whitePlayer,
    }
  }
})

const bottomPlayer = computed(() => {
  if (isBoardFlipped.value) {
    return {
      color: 'Black' as const,
      name: chessBoardStore.board.blackPlayer,
    }
  } else {
    return {
      color: 'White' as const,
      name: chessBoardStore.board.whitePlayer,
    }
  }
})

const canJoinGame = computed(() => {
  return (
    chessBoardStore.board.playingAs === 'Spectator' &&
    (chessBoardStore.board.whitePlayer === '?' || chessBoardStore.board.blackPlayer === '?')
  )
})
</script>

<template>
  <JoinGame :canJoin="canJoinGame" :onJoin="chessBoardStore.joinGame" />

  <div class="container">
    <PlayerInfo
      :name="topPlayer.name"
      :color="topPlayer.color"
      :lastMoveAt="chessBoardStore.lastMoveAt"
      :remainingTime="chessBoardStore.remainingTime[topPlayer.color === 'Black' ? 'black' : 'white']"
      :isPaused="
        !chessBoardStore.hasStarted ||
        chessBoardStore.hasEnded ||
        chessBoardStore.board.turn.toLowerCase() !== topPlayer.color.charAt(0).toLowerCase()
      "
    />

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

    <PlayerInfo
      :name="bottomPlayer.name"
      :color="bottomPlayer.color"
      :lastMoveAt="chessBoardStore.lastMoveAt"
      :remainingTime="chessBoardStore.remainingTime[bottomPlayer.color === 'Black' ? 'black' : 'white']"
      :isPaused="
        !chessBoardStore.hasStarted ||
        chessBoardStore.hasEnded ||
        chessBoardStore.board.turn.toLowerCase() !== bottomPlayer.color.charAt(0).toLowerCase()
      "
    />
  </div>

  <GameStatus :gameState="chessBoardStore.board.gameState" />
  <button @click="toggleBoardFlip">Flip board</button>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  --borderColor: #333;
  --borderRadius: 8px;
}

.playerInfo:first-of-type {
  border-radius: var(--borderRadius) var(--borderRadius) 0 0;
  border-bottom-width: 0px;
}
.playerInfo:last-of-type {
  border-radius: 0 0 var(--borderRadius) var(--borderRadius);
  border-top-width: 0px;
}

.chessboard {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: 800px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--borderColor);
  max-width: 100%;
}
</style>
