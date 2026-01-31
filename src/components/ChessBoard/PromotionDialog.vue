<script setup lang="ts">
import ChessPiece from './ChessPiece.vue'

interface Props {
  isOpen: boolean
  color: 'w' | 'b'
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
}

const { isOpen, color, onSelect, onCancel } = defineProps<Props>()

const pieces = [
  { type: 'q', name: 'Queen' },
  { type: 'r', name: 'Rook' },
  { type: 'b', name: 'Bishop' },
  { type: 'n', name: 'Knight' },
] as const
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="onCancel">
        <div class="modal-content" @click.stop>
          <h3>Choose promotion piece</h3>
          <div class="pieces">
            <button
              v-for="piece in pieces"
              :key="piece.type"
              @click="onSelect(piece.type)"
              class="piece-button"
            >
              <ChessPiece :piece="`${color}${piece.type}`" class="piece-image" />
              <span>{{ piece.name }}</span>
            </button>
          </div>
          <button @click="onCancel" class="cancel-button">Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  width: 100%;
}

h3 {
  margin: 0 0 16px 0;
  text-align: center;
  color: #333;
}

.pieces {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.piece-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.piece-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.piece-image {
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
}

.cancel-button {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
}

.cancel-button:hover {
  background: #e9ecef;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
