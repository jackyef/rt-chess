<script lang="ts" setup>
import { SQUARES } from 'chess.js'
import Square from './Square.vue'
import { ref, computed } from 'vue'
import { useChessBoardPvpStore } from './stores/chessboardPvp'
import IdentityForm from '../IdentityForm.vue'

const chessBoardStore = useChessBoardPvpStore()
const joinState = ref<'none' | 'joining' | 'joined'>('none')

const isBoardFlipped = ref(chessBoardStore.board.playingAs === 'Black' ? true : false)
const toggleBoardFlip = () => {
  isBoardFlipped.value = !isBoardFlipped.value
}

const squares = computed(() => {
  return isBoardFlipped.value ? [...SQUARES].reverse() : SQUARES
})

const topPlayer = computed(() => {
  if (!isBoardFlipped.value) {
    return {
      color: 'Black',
      name: chessBoardStore.board.blackPlayer,
    }
  } else {
    return {
      color: 'White',
      name: chessBoardStore.board.whitePlayer,
    }
  }
})
const bottomPlayer = computed(() => {
  if (isBoardFlipped.value) {
    return {
      color: 'Black',
      name: chessBoardStore.board.blackPlayer,
    }
  } else {
    return {
      color: 'White',
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
  <div v-if="canJoinGame" class="joinGameContainer">
    <button v-if="joinState === 'none'" @click="joinState = 'joining'">Join game</button>
    <IdentityForm v-if="joinState === 'joining'" :onSuccess="chessBoardStore.joinGame" />
  </div>
  <div className="container">
    <div :className="`playerInfo ${topPlayer.color === 'Black' ? 'black' : 'white'}`">
      {{ topPlayer.name }} ({{ topPlayer.color }})

      <span class="playerWaitingInfo" v-if="topPlayer.name === '?'">Waiting for opponent...</span>
    </div>
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
    <div :className="`playerInfo ${bottomPlayer.color === 'Black' ? 'black' : 'white'}`">
      {{ bottomPlayer.name }} ({{ bottomPlayer.color }})
      <span class="playerWaitingInfo" v-if="bottomPlayer.name === '?'"
        >Waiting for opponent...</span
      >
    </div>
  </div>

  <div>Game State: {{ chessBoardStore.board.gameState }}</div>
  <button @click="toggleBoardFlip">Flip board</button>
</template>

<style lang="css" scoped>
.joinGameContainer {
  margin-bottom: 16px;
}

.container {
  display: flex;
  flex-direction: column;
  --borderColor: #333;
  --borderRadius: 8px;
}

.playerInfo {
  font-size: 1rem;
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
}

.playerInfo:first-of-type {
  border-radius: var(--borderRadius) var(--borderRadius) 0 0;
  border-bottom-width: 0px;
}
.playerInfo:last-of-type {
  border-radius: 0 0 var(--borderRadius) var(--borderRadius);
  border-top-width: 0px;
}

.playerInfo.white {
  background-color: #f0f0f0;
  color: #000;
}

.playerWaitingInfo {
  font-size: 0.8rem;
}

.chessboard {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: 800px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--borderColor);
}
</style>
