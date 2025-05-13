import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useDevicesStore = defineStore('devices', () => {
  const devices = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // Create a dedicated axios instance for this store
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async function fetchDevices() {
    loading.value = true;
    error.value = null;
    try {
      console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
      const res = await apiClient.get('/api/devices');
      devices.value = res.data.devices || [];
    } catch (err) {
      console.error('API Error:', err);
      error.value = err?.message || 'Failed to fetch devices.';
    } finally {
      loading.value = false;
    }
  }

  async function getDeviceDetails(deviceId) {
    try {
      const res = await apiClient.get(`/api/devices/${deviceId}`);
      return res.data.device;
    } catch (err) {
      throw err;
    }
  }

  async function getDeviceState(deviceId) {
    try {
      const res = await apiClient.get(`/api/devices/${deviceId}/state`);
      return res.data.state;
    } catch (err) {
      throw err;
    }
  }

  async function updateDeviceName(deviceId, name) {
    try {
      const res = await apiClient.post(`/api/devices/${deviceId}/name`, { name });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update device name');
      }
      // Update the name in the local devices array if the device exists
      const deviceIndex = devices.value.findIndex(d => d.id === deviceId);
      if (deviceIndex !== -1) {
        devices.value[deviceIndex].custom_name = name;
      }
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }

  async function switchOn(deviceId, duration) {
    try {
      const res = await apiClient.post(`/api/devices/${deviceId}/on`, duration ? { duration } : {});
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to turn device ON');
      }
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }

  async function switchOff(deviceId) {
    try {
      const res = await apiClient.post(`/api/devices/${deviceId}/off`);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to turn device OFF');
      }
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }

  async function testDevice(deviceId, duration = 2000) {
    try {
      // Just call the switch ON endpoint with a duration parameter
      // The backend will handle turning it off after the specified duration
      return await switchOn(deviceId, duration);
    } catch (err) {
      throw err;
    }
  }

  return { 
    devices, 
    loading, 
    error, 
    fetchDevices, 
    getDeviceDetails,
    getDeviceState,
    updateDeviceName,
    switchOn, 
    switchOff, 
    testDevice 
  };
}); 