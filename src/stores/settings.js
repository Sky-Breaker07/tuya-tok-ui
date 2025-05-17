import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useSettingsStore = defineStore('settings', () => {
  const globalDuration = ref(2000); // ms
  const perDeviceDuration = ref({}); // { [deviceId]: ms }
  const allowNonLiveUsers = ref(false); // Allow connection to users that aren't live
  const deviceMappings = ref({}); // { [triggerType]: deviceId } - Maps event types to devices
  const availableTriggers = ref([
    { id: 'like', name: 'Likes', icon: 'mdi:thumb-up', color: 'text-[var(--color-success)]' },
    { id: 'chat', name: 'Comments', icon: 'mdi:comment', color: 'text-[var(--color-primary)]' },
    { id: 'gift', name: 'Gifts', icon: 'mdi:gift', color: 'text-[var(--color-accent)]' },
    { id: 'follow', name: 'Follows', icon: 'mdi:account-plus', color: 'text-[var(--color-info)]' }
  ]);
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

  // Fetch non-live users setting
  async function fetchAllowNonLiveUsers() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get('/api/settings/allow-offline-connect');
      allowNonLiveUsers.value = res.data.value === true;
    } catch (err) {
      console.error('Failed to fetch allow-offline-connect setting, defaulting to false:', err);
      allowNonLiveUsers.value = false;
    } finally {
      loading.value = false;
    }
  }

  // Set non-live users setting
  async function setAllowNonLiveUsers(value) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.post('/api/settings/allow-offline-connect', { value });
      allowNonLiveUsers.value = value;
    } catch (err) {
      error.value = err?.message || 'Failed to set allow-offline-connect setting.';
    } finally {
      loading.value = false;
    }
  }

  // Fetch device mappings
  async function fetchDeviceMappings() {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiClient.get('/api/device-mappings');
      
      // Process the response to extract deviceId for each event type
      const mappings = {};
      if (res.data && res.data.mappings) {
        for (const eventType in res.data.mappings) {
          const mapping = res.data.mappings[eventType];
          if (mapping.enabled && mapping.deviceId) {
            mappings[eventType] = mapping.deviceId;
          }
        }
      }
      
      deviceMappings.value = mappings;
    } catch (err) {
      console.error('Failed to fetch device mappings, using empty mapping:', err);
      deviceMappings.value = {};
    } finally {
      loading.value = false;
    }
  }

  // Set device mapping for a specific trigger type
  async function setDeviceMapping(triggerType, deviceId) {
    loading.value = true;
    error.value = null;
    try {
      // Create the payload according to the API documentation
      const payload = { 
        deviceId: deviceId,
        enabled: true,
        minCount: 1 // Default to activate after every event
      };
      
      await apiClient.post(`/api/device-mappings/${triggerType}`, payload);
      
      // Update local state
      deviceMappings.value = {
        ...deviceMappings.value,
        [triggerType]: deviceId
      };
    } catch (err) {
      error.value = err?.message || 'Failed to set device mapping.';
    } finally {
      loading.value = false;
    }
  }

  // Clear device mapping for a specific trigger type
  async function clearDeviceMapping(triggerType) {
    loading.value = true;
    error.value = null;
    try {
      // To clear a mapping, we send a POST with enabled=false
      const payload = { enabled: false };
      await apiClient.post(`/api/device-mappings/${triggerType}`, payload);
      
      // Update local state - remove this mapping
      const updatedMappings = { ...deviceMappings.value };
      delete updatedMappings[triggerType];
      deviceMappings.value = updatedMappings;
    } catch (err) {
      error.value = err?.message || 'Failed to clear device mapping.';
    } finally {
      loading.value = false;
    }
  }

  // Fetch all settings at once
  async function fetchAllSettings() {
    await Promise.all([
      fetchGlobalDuration(),
      fetchAllowNonLiveUsers(),
      fetchDeviceMappings()
    ]);
  }

  return {
    globalDuration,
    perDeviceDuration,
    allowNonLiveUsers,
    deviceMappings,
    availableTriggers,
    loading,
    error,
    fetchGlobalDuration,
    setGlobalDuration,
    fetchPerDeviceDuration,
    setPerDeviceDuration,
    fetchAllowNonLiveUsers,
    setAllowNonLiveUsers,
    fetchDeviceMappings,
    setDeviceMapping,
    clearDeviceMapping,
    fetchAllSettings
  };
}); 