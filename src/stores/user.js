import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useSettingsStore } from './settings';

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
      
      // Get the allowNonLiveUsers setting
      const settingsStore = useSettingsStore();
      await settingsStore.fetchAllowNonLiveUsers();
      
      const payload = { 
        username: user,
        allowNonLive: settingsStore.allowNonLiveUsers
      };
      
      const res = await apiClient.post('/api/tiktok/connect', payload);
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
      
      // Make sure we properly pass through the server's error message
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      } else if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      } else {
        throw err;
      }
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

  // Update connection status from WebSocket
  function updateConnectionStatus(isConnected, user = null) {
    connected.value = isConnected;
    if (user) {
      username.value = user;
    } else if (!isConnected) {
      username.value = '';
    }
  }

  return { username, connected, connect, disconnect, updateConnectionStatus };
}); 