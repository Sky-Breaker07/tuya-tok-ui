<template>
  <div class="w-full max-w-2xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden" style="font-family: var(--font-main)">
    <!-- Header -->
    <div class="bg-gradient-to-r from-green-600 to-teal-500 p-5 text-white">
      <h3 class="text-xl font-bold flex items-center">
        <IconifyIcon icon="mdi:timer-outline" class="mr-2 text-2xl" />
        Activation Duration Settings
      </h3>
      <p class="text-sm mt-1 opacity-90">Configure how long devices stay activated when triggered</p>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="p-6 flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      <p class="mt-4 text-[var(--color-text-secondary)]">Loading duration settings...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="p-6 text-center">
      <IconifyIcon icon="mdi:alert-circle" class="text-4xl text-[var(--color-error)] mb-2" />
      <p class="text-[var(--color-error)]">{{ error }}</p>
      <button 
        @click="fetchSettings" 
        class="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
      >
        Retry
      </button>
    </div>
    
    <!-- Content -->
    <div v-else class="p-6">
      <!-- Global Duration -->
      <div class="mb-6 p-5 border border-[var(--color-border)] rounded-lg hover:shadow-md transition-shadow">
        <h4 class="font-medium text-lg flex items-center">
          <IconifyIcon icon="mdi:earth" class="mr-2 text-[var(--color-primary)]" />
          Global Duration
        </h4>
        <p class="mt-2 text-sm text-[var(--color-text-secondary)] mb-4">
          Default activation time for all devices, unless overridden by device-specific settings.
        </p>
        
        <div class="flex items-center">
          <input
            id="global-duration"
            type="range"
            v-model.number="global"
            min="100"
            max="10000"
            step="100"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            :disabled="loading"
          />
          <div class="ml-4 w-24 flex items-center">
            <input
              type="number"
              v-model.number="global"
              min="100"
              max="10000"
              step="100"
              class="w-20 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
              :disabled="loading"
            />
            <span class="ml-1 text-xs text-[var(--color-text-secondary)]">ms</span>
          </div>
        </div>
        
        <div class="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
          <span>100ms</span>
          <span>5000ms</span>
          <span>10000ms</span>
        </div>
        
        <button
          @click="confirmGlobal"
          class="mt-4 px-4 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60 w-full"
          :disabled="loading"
        >
          Save Global Duration
        </button>
      </div>
      
      <!-- Device-specific durations -->
      <div v-if="devices.length > 0">
        <h4 class="font-medium text-lg flex items-center mb-4">
          <IconifyIcon icon="mdi:devices" class="mr-2 text-[var(--color-accent)]" />
          Device-Specific Durations
        </h4>
        
        <div class="space-y-4">
          <div 
            v-for="device in devices" 
            :key="device.id"
            class="p-4 border border-[var(--color-border)] rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="font-medium">{{ getDeviceName(device) }}</span>
              <span class="text-xs text-[var(--color-text-secondary)]">
                {{ perDevice[device.id] || global }} ms
              </span>
            </div>
            
            <div class="flex items-center">
              <input
                :id="'duration-' + device.id"
                type="range"
                v-model.number="perDevice[device.id]"
                min="100"
                max="10000"
                step="100"
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                :disabled="loading"
              />
              <div class="ml-4 w-24 flex items-center">
                <input
                  type="number"
                  v-model.number="perDevice[device.id]"
                  min="100"
                  max="10000"
                  step="100"
                  class="w-20 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                  :disabled="loading"
                />
                <span class="ml-1 text-xs text-[var(--color-text-secondary)]">ms</span>
              </div>
            </div>
            
            <div class="mt-3 flex justify-between">
              <button
                @click="resetToGlobal(device.id)"
                class="px-3 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg)] transition"
                :disabled="loading || !perDevice[device.id]"
              >
                Reset to Global
              </button>
              
              <button
                @click="confirmDevice(device.id)"
                class="px-3 py-1 text-xs rounded bg-[var(--color-accent)] text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
                :disabled="loading"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Help text -->
      <div class="mt-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]">
        <p class="flex items-start">
          <IconifyIcon icon="mdi:information-outline" class="mr-2 mt-0.5 flex-shrink-0" />
          <span>
            Duration controls how long a device stays ON after being triggered. Values range from 100ms (0.1s) to 10000ms (10s).
          </span>
        </p>
      </div>
    </div>
    
    <ConfirmModal
      :open="modalOpen"
      :title="modalTitle"
      :message="modalMessage"
      confirmText="Save"
      cancelText="Cancel"
      @confirm="onModalConfirm"
      @cancel="modalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useDevicesStore } from '../stores/devices';
import { useToast } from 'vue-toastification';
import { Icon as IconifyIcon } from '@iconify/vue';
import ConfirmModal from './ConfirmModal.vue';

const settingsStore = useSettingsStore();
const devicesStore = useDevicesStore();
const toast = useToast();

const global = ref(settingsStore.globalDuration);
const perDevice = ref({ ...settingsStore.perDeviceDuration });
const loading = computed(() => settingsStore.loading);
const error = computed(() => settingsStore.error);
const devices = computed(() => devicesStore.devices);

const modalOpen = ref(false);
const modalType = ref(''); // 'global' or deviceId
const modalTitle = ref('');
const modalMessage = ref('');

// Initialize
onMounted(async () => {
  await fetchSettings();
});

// Fetch all settings
async function fetchSettings() {
  await settingsStore.fetchGlobalDuration();
  global.value = settingsStore.globalDuration;
  
  // Fetch per-device durations for all available devices
  for (const device of devices.value) {
    await settingsStore.fetchPerDeviceDuration(device.id);
    perDevice.value[device.id] = settingsStore.perDeviceDuration[device.id] ?? global.value;
  }
}

// Watch for changes in the store
watch(() => settingsStore.globalDuration, (val) => {
  global.value = val;
});

watch(() => settingsStore.perDeviceDuration, (val) => {
  perDevice.value = { ...val };
});

// Watch for new devices and fetch their durations
watch(devices, async (newDevices) => {
  for (const device of newDevices) {
    if (perDevice.value[device.id] === undefined) {
      await settingsStore.fetchPerDeviceDuration(device.id);
      perDevice.value[device.id] = settingsStore.perDeviceDuration[device.id] ?? global.value;
    }
  }
}, { immediate: true });

// Helper function to handle different property naming conventions
function getDeviceName(device) {
  if (device.custom_name && device.custom_name.trim()) return device.custom_name.trim();
  if (device.name && device.name.trim()) return device.name.trim();
  return 'Unnamed Device';
}

// Reset a device's duration to the global value
function resetToGlobal(deviceId) {
  perDevice.value[deviceId] = null;
  confirmDevice(deviceId);
}

function confirmGlobal() {
  modalType.value = 'global';
  modalTitle.value = 'Save Global Duration?';
  modalMessage.value = `Are you sure you want to set the global activation duration to ${global.value} ms?`;
  modalOpen.value = true;
}

function confirmDevice(deviceId) {
  modalType.value = deviceId;
  const device = devices.value.find(d => d.id === deviceId);
  const deviceName = getDeviceName(device);
  
  if (perDevice.value[deviceId] === null) {
    modalTitle.value = `Reset ${deviceName} to Global?`;
    modalMessage.value = `Are you sure you want to reset ${deviceName} to use the global activation duration (${global.value} ms)?`;
  } else {
    modalTitle.value = `Save Duration for ${deviceName}?`;
    modalMessage.value = `Are you sure you want to set the activation duration for ${deviceName} to ${perDevice.value[deviceId]} ms?`;
  }
  
  modalOpen.value = true;
}

async function onModalConfirm() {
  modalOpen.value = false;
  if (modalType.value === 'global') {
    await saveGlobal();
  } else if (modalType.value) {
    await saveDevice(modalType.value);
  }
}

async function saveGlobal() {
  if (global.value < 100 || global.value > 10000) {
    toast.error('Duration must be between 100 and 10000 ms');
    return;
  }
  await settingsStore.setGlobalDuration(global.value);
  toast.success('Global duration updated');
}

async function saveDevice(deviceId) {
  const value = perDevice.value[deviceId];
  
  if (value === null) {
    // Reset to global
    await settingsStore.setPerDeviceDuration(deviceId, null);
    toast.success('Device reset to use global duration');
    return;
  }
  
  if (value < 100 || value > 10000) {
    toast.error('Duration must be between 100 and 10000 ms');
    return;
  }
  
  await settingsStore.setPerDeviceDuration(deviceId, value);
  toast.success('Device duration updated');
}
</script>

<style scoped>
/* Custom range slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 5px;
  background: linear-gradient(to right, var(--color-primary), var(--color-accent));
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style> 