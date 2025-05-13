<template>
  <div class="w-full max-w-2xl mx-auto mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow p-6" style="font-family: var(--font-main)">
    <h3 class="text-lg font-bold mb-4">Activation Duration Settings</h3>
    <form @submit.prevent="confirmGlobal" class="flex items-center gap-3 mb-4">
      <label class="font-medium" for="global-duration">Global Duration (ms):</label>
      <input
        id="global-duration"
        type="number"
        v-model.number="global"
        min="100"
        max="10000"
        step="100"
        class="w-28 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
        :disabled="loading"
        aria-label="Set global activation duration in milliseconds"
        title="Set global activation duration in milliseconds"
      />
      <button
        type="submit"
        class="px-3 py-1 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60"
        :disabled="loading"
        aria-label="Save global activation duration"
        title="Save global activation duration"
      >Save</button>
    </form>
    <div v-if="devices.length > 0">
      <h4 class="font-semibold mb-2">Per-Device Duration</h4>
      <div class="space-y-2">
        <form v-for="device in devices" :key="device.id" @submit.prevent="confirmDevice(device.id)" class="flex items-center gap-3">
          <span class="w-32 truncate">{{ getDeviceName(device) }}</span>
          <input
            :id="'duration-' + device.id"
            type="number"
            v-model.number="perDevice[device.id]"
            min="100"
            max="10000"
            step="100"
            class="w-24 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            :disabled="loading"
            :aria-label="'Set activation duration for ' + getDeviceName(device)"
            :title="'Set activation duration for ' + getDeviceName(device)"
          />
          <button
            type="submit"
            class="px-2 py-1 rounded bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            :disabled="loading"
            :aria-label="'Save activation duration for ' + getDeviceName(device)"
            :title="'Save activation duration for ' + getDeviceName(device)"
          >Save</button>
        </form>
      </div>
    </div>
    <div v-if="error" class="text-[var(--color-error)] mt-3">{{ error }}</div>
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

onMounted(async () => {
  await settingsStore.fetchGlobalDuration();
  global.value = settingsStore.globalDuration;
  // Remove per-device fetch loop from here
});

// Watch for devices to load and then fetch per-device durations
watch(devices, async (newDevices) => {
  for (const device of newDevices) {
    await settingsStore.fetchPerDeviceDuration(device.id);
    perDevice.value[device.id] = settingsStore.perDeviceDuration[device.id] ?? global.value;
    console.log(perDevice.value[device.id]);
  }
}, { immediate: true });

watch(() => settingsStore.globalDuration, (val) => {
  global.value = val;
});

watch(() => settingsStore.perDeviceDuration, (val) => {
  perDevice.value = { ...val };
});

// Helper function to handle different property naming conventions
function getDeviceName(device) {
  if (device.custom_name && device.custom_name.trim()) return device.custom_name.trim();
  if (device.name && device.name.trim()) return device.name.trim();
  return 'Unnamed Device';
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
  modalTitle.value = `Save Duration for ${deviceName}?`;
  modalMessage.value = `Are you sure you want to set the activation duration for ${deviceName} to ${perDevice.value[deviceId]} ms?`;
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
  if (value < 100 || value > 10000) {
    toast.error('Duration must be between 100 and 10000 ms');
    return;
  }
  await settingsStore.setPerDeviceDuration(deviceId, value);
  toast.success('Device duration updated');
}
</script> 