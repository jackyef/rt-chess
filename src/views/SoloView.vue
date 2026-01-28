<script setup lang="ts">
import ChessBoard from '@/components/ChessBoard/ChessBoard.vue';

</script>

<template>
  <h1>This is a solo chess page</h1>
  <div class="solo">
    <ChessBoard initialPgn="" />
  </div>
</template>

<style>
h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.solo {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
