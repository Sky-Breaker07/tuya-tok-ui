<template>
  <div
    class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 items-center transition-all duration-300 w-full max-w-xs mx-auto"
    :class="[isActive ? 'ring-2 ring-[var(--color-primary)] animate-pulse scale-105 shadow-lg device-active-glow' : '']"
    style="font-family: var(--font-main)"
    tabindex="0"
    :aria-label="`Smart switch card for ${device.name}`"
  >
    <div class="flex items-center gap-2 w-full justify-center">
      <IconifyIcon icon="mdi:power-plug" class="text-xl sm:text-2xl text-[var(--color-primary)]" aria-hidden="true" />
      <span class="font-semibold text-base sm:text-lg truncate">{{ device.name }}</span>
    </div>
    <div class="flex items-center justify-center w-full gap-2">
      <span 
        class="text-xs px-2 py-0.5 rounded-full" 
        :class="device.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
      >
        {{ device.isOnline ? 'Online' : 'Offline' }}
      </span>
      <span 
        v-if="device.isOnline && deviceState !== null"
        class="text-xs px-2 py-0.5 rounded-full" 
        :class="deviceState ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'"
      >
        {{ deviceState ? 'ON' : 'OFF' }}
      </span>
      <span 
        v-if="device.isOnline && deviceState === null && !stateError"
        class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      >
        Loading...
      </span>
    </div>
    <div class="flex gap-2 w-full justify-center mt-1">
      <button
        @click="$emit('view-details', device.id)"
        class="px-3 py-1 rounded bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-xs font-medium transition flex-1 flex items-center justify-center"
        aria-label="View device details"
        title="View device details"
      >
        <IconifyIcon icon="mdi:information-outline" class="mr-1" />
        Details
      </button>
    </div>
    <div class="flex flex-col xs:flex-row gap-2 mt-2 w-full justify-center">
      <button
        @click="handleOn"
        class="flex-1 px-2 py-1 sm:px-3 sm:py-1 rounded bg-[var(--color-success)] text-white font-semibold hover:bg-green-700 transition text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Turn ON {{ device.name }}"
        title="Turn ON"
        :disabled="!device.isOnline || deviceState === true"
      >ON</button>
      <button
        @click="handleOff"
        class="flex-1 px-2 py-1 sm:px-3 sm:py-1 rounded bg-[var(--color-error)] text-white font-semibold hover:bg-red-700 transition text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Turn OFF {{ device.name }}"
        title="Turn OFF"
        :disabled="!device.isOnline || deviceState === false"
      >OFF</button>
      <button
        @click="handleTest"
        class="flex-1 px-2 py-1 sm:px-3 sm:py-1 rounded bg-[var(--color-accent)] text-white font-semibold hover:bg-purple-700 transition text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Test {{ device.name }} (turn ON briefly)"
        title="Test (turn ON briefly)"
        :disabled="!device.isOnline"
      >Test</button>
    </div>
    <div class="text-xs text-[var(--color-text-secondary)] mt-1 w-full truncate">ID: {{ device.id }}</div>
    <div class="text-xs text-[var(--color-text-secondary)] w-full truncate">Product: {{ device.productName || 'Unknown' }}</div>
    <div v-if="lastTriggered" class="text-xs text-[var(--color-primary)] w-full truncate">Last triggered: {{ lastTriggered }}</div>
  </div>
</template>

<script setup>
import { Icon as IconifyIcon } from '@iconify/vue';
import { computed, ref, onMounted, watch } from 'vue';
import { useDevicesStore } from '../stores/devices';

const props = defineProps({
  device: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  lastTriggered: { type: String, default: '' },
});

const emit = defineEmits(['on', 'off', 'test', 'view-details']);

const devicesStore = useDevicesStore();
const deviceState = ref(null);
const stateError = ref(null);
const isLoading = ref(false);

// Fetch device state when component mounts and when device online status changes
onMounted(() => {
  if (props.device.isOnline) {
    fetchDeviceState();
  }
});

watch(() => props.device.isOnline, (newValue) => {
  if (newValue) {
    fetchDeviceState();
  } else {
    deviceState.value = null;
  }
});

// Watch for isActive changes to refresh state when a device is activated
watch(() => props.isActive, (newValue, oldValue) => {
  if (newValue !== oldValue && props.device.isOnline) {
    // Add a small delay to allow the backend to process the state change
    setTimeout(() => {
      fetchDeviceState();
    }, 1000);
  }
});

async function fetchDeviceState() {
  if (!props.device.isOnline) return;
  
  isLoading.value = true;
  stateError.value = null;
  
  try {
    const state = await devicesStore.getDeviceState(props.device.id);
    // The state.value is a boolean where true means ON, false means OFF
    deviceState.value = state.value === true;
  } catch (err) {
    console.error(`Failed to get state for device ${props.device.id}:`, err);
    stateError.value = err.message || 'Failed to get device state';
    deviceState.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Handle button clicks with state updates
async function handleOn() {
  emit('on');
  // Update the state after a short delay to allow the backend to process
  setTimeout(() => {
    fetchDeviceState();
  }, 1000);
}

async function handleOff() {
  emit('off');
  // Update the state after a short delay to allow the backend to process
  setTimeout(() => {
    fetchDeviceState();
  }, 1000);
}

async function handleTest() {
  emit('test');
  // For test, we'll update twice - once immediately for ON and once after a delay for OFF
  deviceState.value = true;
  setTimeout(() => {
    fetchDeviceState();
  }, 3000); // Longer delay for test to account for the ON duration
}
</script>

<style scoped>
.device-active-glow {
  box-shadow: 0 0 16px 4px var(--color-primary), 0 2px 8px 0 rgba(0,0,0,0.08);
}
</style> 