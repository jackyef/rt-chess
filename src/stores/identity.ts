import { updateIdentity } from "@/lib/clients/gameClient";
import { defineStore } from "pinia";
import { ref } from "vue";

const STORAGE_KEY = 'rt-chess-identity'

export const useIdentityStore = defineStore('identity', () => {
  const identity = ref<string>(loadFromStorage());

  function loadFromStorage(): string {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function saveToStorage(value: string) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      console.warn('Failed to save identity to localStorage:', error);
    }
  }

  const resetIdentity = () => {
    identity.value = '';
    saveToStorage('');
  };

  const setIdentity = async (newIdentity: string): Promise<void> => {
    try {
      await updateIdentity(newIdentity);
      identity.value = newIdentity;
      saveToStorage(newIdentity);
    } catch (error) {
      console.error('Failed to update identity:', error);
      throw error;
    }
  }

  const refreshIdentity = async () => {
    try {
      const response = await fetch('/api/identity');
      if (response.ok) {
        const data = await response.json();
        identity.value = data.identity;
        saveToStorage(data.identity);
      } else {
        console.error('Failed to fetch identity:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching identity:', error);
    }
  }

  return { identity, refreshIdentity, resetIdentity, setIdentity }
});
