import { updateIdentity } from "@/lib/clients/gameClient";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useIdentityStore = defineStore('identity', () => {
  const identity = ref<string>('');

  const resetIdentity = () => {
    identity.value = '';
  };

  const setIdentity = async (newIdentity: string): Promise<void> => {
    try {
      await updateIdentity(newIdentity);
      await refreshIdentity()
    } catch (error) {
      console.error('Failed to update identity:', error);
    }
  }

  const refreshIdentity = async () => {
    try {
      const response = await fetch('/api/identity');
      if (response.ok) {
        const data = await response.json();
        identity.value = data.identity;
      } else {
        console.error('Failed to fetch identity:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching identity:', error);
    }
  }

  return { identity, refreshIdentity, resetIdentity, setIdentity }
});
