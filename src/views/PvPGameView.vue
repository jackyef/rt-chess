<script setup lang="ts">
import ChessBoardPvp from '@/components/ChessBoard/ChessBoardPvp.vue'
import { useChessBoardPvpStore } from '@/components/ChessBoard/stores/chessboardPvp'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const gameId = router.currentRoute.value.params.id as string
const chessboardPvpStore = useChessBoardPvpStore()
const { board, pgn } = storeToRefs(chessboardPvpStore)

onMounted(() => {
  ;(async () => {
    try {
      const response = await fetch(`/api/game/${gameId}`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const json = await response.json()
      chessboardPvpStore.setPgn(json.pgn)
    } catch (error) {
      console.error('Error fetching game state:', error)
    }
  })()
})
</script>

<template>
  <h1>This is a pvp game chess page</h1>
  <div class="pvp">
    <div v-if="!chessboardPvpStore.pgn">Loading game...</div>
    <ChessBoardPvp v-else :playingAs="board.playingAs" />
  </div>
</template>

<style>
h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.pvp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
