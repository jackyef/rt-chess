import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const useIdentityStore = defineStore('identity', () => {
  const identity = ref<string>('');

  onMounted(() => {
    refreshIdentity()
  })

  const resetIdentity = () => {
    identity.value = '';
  };

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

  return { identity, refreshIdentity, resetIdentity }
});
