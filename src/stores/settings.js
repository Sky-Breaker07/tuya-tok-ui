import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useSettingsStore = defineStore('settings', () => {
  const globalDuration = ref(2000); // ms
  const perDeviceDuration = ref({}); // { [deviceId]: ms }
  const loading = ref(false);
  const error = ref(null);
  
  // Create a dedicated axios instance for this store
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async function fetchGlobalDuration() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get('/api/settings/activation-duration');
      globalDuration.value = res.data.value || 2000;
    } catch (err) {
      error.value = err?.message || 'Failed to fetch global duration.';
    } finally {
      loading.value = false;
    }
  }

  async function setGlobalDuration(value) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.post('/api/settings/activation-duration', { value });
      globalDuration.value = value;
    } catch (err) {
      error.value = err?.message || 'Failed to set global duration.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchPerDeviceDuration(deviceId) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get(`/api/settings/activation-duration/${deviceId}`);
      perDeviceDuration.value[deviceId] = res.data.value;
    } catch (err) {
      error.value = err?.message || 'Failed to fetch device duration.';
    } finally {
      loading.value = false;
    }
  }

  async function setPerDeviceDuration(deviceId, value) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.post(`/api/settings/activation-duration/${deviceId}`, { value });
      perDeviceDuration.value[deviceId] = value;
    } catch (err) {
      error.value = err?.message || 'Failed to set device duration.';
    } finally {
      loading.value = false;
    }
  }

  return {
    globalDuration,
    perDeviceDuration,
    loading,
    error,
    fetchGlobalDuration,
    setGlobalDuration,
    fetchPerDeviceDuration,
    setPerDeviceDuration,
  };
}); 