import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const username = ref('');
  const connected = ref(false);
  
  // Create a dedicated axios instance for this store
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async function connect(user) {
    try {
      console.log('Connecting to TikTok with API URL:', import.meta.env.VITE_API_BASE_URL);
      const res = await apiClient.post('/api/tiktok/connect', { username: user });
      if (res.data && res.data.success) {
        username.value = res.data.username || user;
        connected.value = true;
      } else {
        throw new Error(res.data?.message || 'Connection failed');
      }
    } catch (err) {
      console.error('TikTok connection error:', err);
      connected.value = false;
      username.value = '';
      throw err;
    }
  }

  async function disconnect() {
    try {
      const res = await apiClient.post('/api/tiktok/disconnect');
      if (res.data && res.data.success) {
        connected.value = false;
        username.value = '';
      } else {
        throw new Error(res.data?.message || 'Disconnect failed');
      }
    } catch (err) {
      throw err;
    }
  }

  return { username, connected, connect, disconnect };
}); 