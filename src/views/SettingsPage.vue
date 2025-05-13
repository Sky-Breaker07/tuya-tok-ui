<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" style="font-family: var(--font-main)">
    <Header />
    <div class="max-w-5xl mx-auto py-10 px-4">
      <h1 class="text-2xl font-bold mb-4">Settings & Device Control</h1>
      <p class="mb-6 text-[var(--color-text-secondary)]">Manage your Tuya smart switches, set activation durations, and perform manual controls.</p>
      
      <!-- API Connection Status -->
      <div v-if="apiConnectionError" class="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <h3 class="font-bold text-red-800 dark:text-red-200 mb-2">API Connection Error</h3>
        <p class="text-red-700 dark:text-red-300">{{ apiConnectionError }}</p>
        <button 
          @click="testApiConnection" 
          class="mt-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
        >
          Retry Connection
        </button>
      </div>
      
      <div v-if="devicesLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <LoadingSkeleton v-for="i in 6" :key="i" width="100%" height="120px" />
      </div>
      <div v-else-if="devicesError" class="text-center py-8 text-[var(--color-error)]">
        <div>{{ devicesError }}</div>
        <button @click="devicesStore.fetchDevices()" class="mt-4 px-4 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition">Retry</button>
      </div>
      <div v-else-if="devices.length === 0" class="text-center py-8 text-[var(--color-text-secondary)]">
        <p>No devices found.</p>
        <p class="mt-2 text-sm">Make sure your API server is running at: {{ apiUrl }}</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <DeviceCard
          v-for="device in devices"
          :key="device.id"
          :device="device"
          :isActive="activeDeviceId === device.id"
          @on="handleOn(device.id)"
          @off="handleOff(device.id)"
          @test="handleTest(device.id)"
          @view-details="openDeviceDetails"
        />
      </div>
      <div v-if="devicesLoading">
        <LoadingSkeleton width="100%" height="180px" />
      </div>
      <div ref="settingsPanelAnchor">
        <SettingsPanel />
      </div>
    </div>
    <ConfirmModal
      :open="errorModalOpen"
      :title="'Operation Failed'"
      :message="errorModalMessage"
      confirmText="OK"
      :showCancel="false"
      @confirm="errorModalOpen = false"
    />
    
    <!-- Device Details Modal -->
    <DeviceDetailsModal
      :open="deviceDetailsOpen"
      :deviceId="selectedDeviceId"
      @close="deviceDetailsOpen = false"
      @refresh="onDeviceRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useDevicesStore } from '../stores/devices';
import { useToast } from 'vue-toastification';
import Header from '../components/Header.vue';
import DeviceCard from '../components/DeviceCard.vue';
import SettingsPanel from '../components/SettingsPanel.vue';
import LoadingSkeleton from '../components/LoadingSkeleton.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import DeviceDetailsModal from '../components/DeviceDetailsModal.vue';
import { testApiConnection as testApi, API_URL } from '../utils/api-test';

const devicesStore = useDevicesStore();
const toast = useToast();

const activeDeviceId = ref(null);
const devices = computed(() => devicesStore.devices);
const devicesLoading = computed(() => devicesStore.loading);
const devicesError = computed(() => devicesStore.error);

const settingsPanelAnchor = ref(null);
const errorModalOpen = ref(false);
const errorModalMessage = ref('');
const apiConnectionError = ref(null);
const apiUrl = ref(API_URL);

// Device details modal state
const deviceDetailsOpen = ref(false);
const selectedDeviceId = ref(null);

onMounted(async () => {
  await testApiConnection();
  devicesStore.fetchDevices();
});

async function testApiConnection() {
  const result = await testApi();
  if (!result.success) {
    apiConnectionError.value = `Cannot connect to API server at ${apiUrl.value}. Please make sure the server is running.`;
  } else {
    apiConnectionError.value = null;
  }
}

function showErrorDetails(error) {
  let message = error?.message || 'Operation failed';
  
  // If there's a Tuya response with additional details
  if (error?.tuya) {
    message += `\n\nDetails: ${JSON.stringify(error.tuya, null, 2)}`;
  }
  
  errorModalMessage.value = message;
  errorModalOpen.value = true;
}

async function handleOn(deviceId) {
  activeDeviceId.value = deviceId;
  try {
    const result = await devicesStore.switchOn(deviceId);
    if (result.success) {
      if (result.message.includes('indefinitely')) {
        toast.success('Device turned ON indefinitely');
      } else {
        toast.success(result.message || 'Device turned ON');
      }
    } else {
      throw result;
    }
  } catch (err) {
    toast.error('Failed to turn on device');
    showErrorDetails(err);
  } finally {
    activeDeviceId.value = null;
  }
}

async function handleOff(deviceId) {
  activeDeviceId.value = deviceId;
  try {
    const result = await devicesStore.switchOff(deviceId);
    if (result.success) {
      toast.success(result.message || 'Device turned OFF');
    } else {
      throw result;
    }
  } catch (err) {
    toast.error('Failed to turn off device');
    showErrorDetails(err);
  } finally {
    activeDeviceId.value = null;
  }
}

async function handleTest(deviceId) {
  activeDeviceId.value = deviceId;
  try {
    const result = await devicesStore.testDevice(deviceId);
    if (result.success) {
      toast.success(result.message || 'Device test triggered');
    } else {
      throw result;
    }
  } catch (err) {
    toast.error('Failed to test device');
    showErrorDetails(err);
  } finally {
    setTimeout(() => { activeDeviceId.value = null; }, 2000);
  }
}

// Device details modal handlers
function openDeviceDetails(deviceId) {
  selectedDeviceId.value = deviceId;
  deviceDetailsOpen.value = true;
}

function onDeviceRefresh() {
  // Re-fetch devices to reflect any changes (like name updates)
  devicesStore.fetchDevices();
}
</script> 