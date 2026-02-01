<script setup lang="ts">
interface Props {
  gameState: string
}

defineProps<Props>()
</script>

<template>
  <div class="game-status">Game status: {{ gameState }}</div>
</template>

<style lang="css" scoped>
.game-status {
  margin-top: 16px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin: 0 auto;
}
</style>
