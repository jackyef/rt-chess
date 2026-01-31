<script lang="ts" setup>
import { SQUARES } from 'chess.js'
import Square from './Square.vue'
import { ref, computed, watch } from 'vue'
import { useChessBoardPvpStore } from './stores/chessboardPvp'
import IdentityForm from '../IdentityForm.vue'
import { useIdentityStore } from '@/stores/identity'
import CountdownTimer from './CountdownTimer.vue'

const chessBoardStore = useChessBoardPvpStore()
const identityStore = useIdentityStore()
const joinState = ref<'none' | 'joining'>('none')

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

const handleJoinGame = () => {
  if (!identityStore.identity) {
    joinState.value = 'joining'
  } else {
    chessBoardStore.joinGame()
  }
}
</script>

<template>
  <div v-if="canJoinGame" class="joinGameContainer">
    <button v-if="joinState === 'none'" @click="handleJoinGame">Join game</button>
    <IdentityForm v-if="joinState === 'joining'" :onSuccess="chessBoardStore.joinGame" />
  </div>
  <div className="container">
    <div :className="`playerInfo ${topPlayer.color === 'Black' ? 'black' : 'white'}`">
      <div>
        {{ topPlayer.name }} ({{ topPlayer.color }})

        <span class="playerWaitingInfo" v-if="topPlayer.name === '?'">Waiting for opponent...</span>
      </div>
      <CountdownTimer
        :lastMoveAt="chessBoardStore.lastMoveAt"
        :remainingTime="
          chessBoardStore.remainingTime[topPlayer.color === 'Black' ? 'black' : 'white']
        "
        :isPaused="
          !chessBoardStore.hasStarted ||
          chessBoardStore.hasEnded ||
          chessBoardStore.board.turn.toLowerCase() !== topPlayer.color.charAt(0).toLowerCase()
        "
      />
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
      <div>
        {{ bottomPlayer.name }} ({{ bottomPlayer.color }})
        <span class="playerWaitingInfo" v-if="bottomPlayer.name === '?'"
          >Waiting for opponent...</span
        >
      </div>
      <CountdownTimer
        :lastMoveAt="chessBoardStore.lastMoveAt"
        :remainingTime="
          chessBoardStore.remainingTime[bottomPlayer.color === 'Black' ? 'black' : 'white']
        "
        :isPaused="
          !chessBoardStore.hasStarted ||
          chessBoardStore.hasEnded ||
          chessBoardStore.board.turn.toLowerCase() !== bottomPlayer.color.charAt(0).toLowerCase()
        "
      />
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
  max-width: 100%;
  --borderColor: #333;
  --borderRadius: 8px;
}

.playerInfo {
  font-size: 1rem;
  padding: 8px 12px;
  border: 1px solid var(--borderColor);
  display: flex;
  justify-content: space-between;
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
  max-width: 100%;
}
</style>
