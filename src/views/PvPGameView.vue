<script setup lang="ts">
import ChessBoardPvp from '@/components/ChessBoard/ChessBoardPvp.vue'
import { useChessBoardPvpStore } from '@/components/ChessBoard/stores/chessboardPvp'
import { getGamePgn } from '@/lib/clients/gameClient'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const gameId = router.currentRoute.value.params.id as string
const chessboardPvpStore = useChessBoardPvpStore()
const { pgn } = storeToRefs(chessboardPvpStore)

onMounted(() => {
  ;(async () => {
    try {
      const pgn = await getGamePgn(gameId)
      chessboardPvpStore.setPgn(pgn)
    } catch (error) {
      console.error('Error fetching game state:', error)
    }
  })()
})

const shareUrl = computed(() => {
  return `${window.location.origin}/pvp/game/${gameId}`
})

const handleShareUrl = async () => {
  const url = shareUrl.value

  try {
    await navigator.share({
      title: 'Chess Game',
      text: 'Join my chess game!',
      url,
    })
  } catch {
    navigator.clipboard.writeText(url).then(
      () => {
        alert('Game URL copied to clipboard!')
      },
      (err) => {
        console.error('Could not copy text: ', err)
      },
    )
  }
}
</script>

<template>
  <div className="gameId">
    <input type="text" readonly="true" :value="shareUrl" />
    <button @click="handleShareUrl">Share URL</button>
  </div>
  <div class="chessboard">
    <div v-if="!pgn">Loading game...</div>
    <ChessBoardPvp v-else />
  </div>
</template>

<style scoped>
.gameId {
  margin-bottom: 16px;
  text-align: center;
}

input {
  font-size: 1rem;
  padding: 4px 8px;
  width: 300px;
  text-align: center;
  background: transparent;
  color: inherit;
  border: none;
  border-radius: 4px;
}

button {
  margin-left: 8px;
  padding: 4px 12px;
  font-size: 1rem;
  cursor: pointer;
}

.chessboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
