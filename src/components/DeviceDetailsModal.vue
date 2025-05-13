<template>
  <Teleport to="body">
    <div 
      v-if="open" 
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      @click.self="$emit('close')"
    >
      <div 
        class="w-full max-w-3xl bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-2xl animate-modal-in overflow-hidden flex flex-col"
        style="max-height: 90vh; font-family: var(--font-main);"
      >
        <!-- Loading state -->
        <div v-if="loading" class="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div class="w-20 h-20 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mb-6"></div>
          <p class="text-[var(--color-text-secondary)]">Loading device details...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="p-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6">
            <IconifyIcon icon="mdi:alert-circle-outline" class="text-4xl text-red-500 dark:text-red-300" />
          </div>
          <p class="text-[var(--color-error)] mb-6">{{ error }}</p>
          <button @click="$emit('close')" class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white">Close</button>
        </div>
        
        <!-- Content -->
        <template v-else-if="device">
          <!-- Header -->
          <div class="relative">
            <!-- Background gradient -->
            <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-40 sm:h-48"></div>
            
            <!-- Close button -->
            <button 
              @click="$emit('close')" 
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black bg-opacity-30 flex items-center justify-center text-white hover:bg-opacity-50 transition"
              aria-label="Close"
            >
              <IconifyIcon icon="mdi:close" class="text-xl" />
            </button>
            
            <!-- Device image -->
            <div class="absolute left-1/2 transform -translate-x-1/2 -bottom-16 w-32 h-32 rounded-xl overflow-hidden border-4 border-[var(--color-surface)] shadow-lg bg-white flex items-center justify-center">
              <img 
                v-if="deviceIconUrl && !useDefaultIcon" 
                :src="deviceIconUrl" 
                alt="Device icon" 
                class="w-full h-full object-contain"
                @error="onImageError"
              />
              <div v-else class="w-20 h-20 flex items-center justify-center">
                <IconifyIcon icon="mdi:power-socket" class="text-6xl text-[var(--color-primary)]" />
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="pt-20 px-6 pb-6 overflow-y-auto">
            <!-- Device name and status -->
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-[var(--color-text)] mb-1">{{ deviceName }}</h2>
              <div class="flex items-center justify-center gap-3">
                <p class="text-[var(--color-text-secondary)] text-sm">{{ device.product_name }}</p>
                <span 
                  class="text-xs px-2 py-0.5 rounded-full" 
                  :class="device.is_online ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                >
                  {{ device.is_online ? 'Online' : 'Offline' }}
                </span>
              </div>
              
              <!-- Edit name button -->
              <button
                @click="isEditing = true"
                class="mt-2 px-3 py-1 rounded-full border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Edit name
              </button>
            </div>
            
            <!-- Edit name form -->
            <div v-if="isEditing" class="mb-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
              <h3 class="text-sm font-medium mb-2">Edit Device Name</h3>
              <form @submit.prevent="saveDeviceName" class="flex flex-col sm:flex-row items-center gap-2">
                <input
                  v-model="editedName"
                  class="flex-1 w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                  placeholder="Enter device name"
                />
                <div class="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    @click="isEditing = false"
                    class="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white"
                    :disabled="!editedName.trim() || savingName"
                  >
                    {{ savingName ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </form>
              <p v-if="nameError" class="mt-2 text-xs text-[var(--color-error)]">{{ nameError }}</p>
            </div>
            
            <!-- Tabs -->
            <div class="border-b border-[var(--color-border)] mb-6">
              <div class="flex">
                <button 
                  @click="activeTab = 'details'"
                  class="px-4 py-2 font-medium text-sm transition-colors relative"
                  :class="activeTab === 'details' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'"
                >
                  Details
                  <div v-if="activeTab === 'details'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]"></div>
                </button>
                <button 
                  @click="activeTab = 'controls'"
                  class="px-4 py-2 font-medium text-sm transition-colors relative"
                  :class="activeTab === 'controls' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'"
                >
                  Controls
                  <div v-if="activeTab === 'controls'" class="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]"></div>
                </button>
              </div>
            </div>
            
            <!-- Tab content -->
            <!-- Details tab -->
            <div v-if="activeTab === 'details'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <DetailItem icon="mdi:identifier" label="Device ID" :value="device.id" />
                <DetailItem icon="mdi:barcode" label="Product ID" :value="device.product_id" />
                <DetailItem icon="mdi:shape" label="Category" :value="device.category" />
                <DetailItem icon="mdi:ip-network" label="IP Address" :value="device.ip" />
                <DetailItem icon="mdi:earth" label="Time Zone" :value="formatTimeZone(device.time_zone)" />
                <DetailItem icon="mdi:map-marker" label="Location" :value="formatLocation(device.lat, device.lon)" />
              </div>
              
              <div class="space-y-4">
                <DetailItem 
                  icon="mdi:calendar" 
                  label="Created" 
                  :value="formatReadableDate(device.create_time)" 
                  :tooltip="formatFullDate(device.create_time)" 
                />
                <DetailItem 
                  icon="mdi:clock-time-four" 
                  label="Last Active" 
                  :value="formatReadableDate(device.active_time)" 
                  :tooltip="formatFullDate(device.active_time)" 
                />
                <DetailItem 
                  icon="mdi:update" 
                  label="Last Updated" 
                  :value="formatRelativeTime(device.update_time)" 
                  :tooltip="formatFullDate(device.update_time)" 
                />
                <DetailItem icon="mdi:key" label="Local Key" value="••••••••••••••" tooltip="Hidden for security" />
                <DetailItem icon="mdi:uuid" label="UUID" :value="device.uuid" />
                <DetailItem v-if="device.bind_space_id" icon="mdi:office-building" label="Space ID" :value="device.bind_space_id" />
                <DetailItem v-if="device.model" icon="mdi:devices" label="Model" :value="device.model" />
              </div>
            </div>
            
            <!-- Controls tab -->
            <div v-else-if="activeTab === 'controls'" class="space-y-6">
              <!-- Power Controls -->
              <div class="p-5 bg-[var(--color-bg-secondary)] rounded-lg">
                <h3 class="text-base font-medium mb-4 flex items-center">
                  <IconifyIcon icon="mdi:power" class="mr-2 text-[var(--color-primary)]" />
                  Power Controls
                </h3>
                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                    @click="turnOn()"
                    class="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center"
                    :disabled="isControlling || !device.is_online"
                  >
                    <IconifyIcon icon="mdi:power" class="mr-2" />
                    <span v-if="isControlling === 'on'">Turning On...</span>
                    <span v-else>Turn On</span>
                  </button>
                  <button
                    @click="turnOff()"
                    class="flex-1 px-4 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center"
                    :disabled="isControlling || !device.is_online"
                  >
                    <IconifyIcon icon="mdi:power-off" class="mr-2" />
                    <span v-if="isControlling === 'off'">Turning Off...</span>
                    <span v-else>Turn Off</span>
                  </button>
                </div>
              </div>
              
              <!-- Test Activation -->
              <div class="p-5 bg-[var(--color-bg-secondary)] rounded-lg">
                <h3 class="text-base font-medium mb-4 flex items-center">
                  <IconifyIcon icon="mdi:test-tube" class="mr-2 text-[var(--color-accent)]" />
                  Test Activation
                </h3>
                <div class="flex flex-col space-y-4">
                  <div>
                    <div class="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1">
                      <span>500ms</span>
                      <span>{{ testDuration }}ms</span>
                      <span>5000ms</span>
                    </div>
                    <input
                      v-model.number="testDuration"
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      class="w-full accent-[var(--color-accent)]"
                      :disabled="isControlling || !device.is_online"
                    />
                  </div>
                  <button
                    @click="testDevice()"
                    class="w-full px-4 py-3 rounded-lg bg-[var(--color-accent)] hover:opacity-90 text-white font-medium transition disabled:opacity-50 flex items-center justify-center"
                    :disabled="isControlling || !device.is_online"
                  >
                    <IconifyIcon icon="mdi:flash" class="mr-2" />
                    <span v-if="isControlling === 'test'">Testing...</span>
                    <span v-else>Test Device ({{ (testDuration / 1000).toFixed(1) }}s)</span>
                  </button>
                </div>
              </div>
              
              <!-- Device State -->
              <div class="p-5 bg-[var(--color-bg-secondary)] rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-base font-medium flex items-center">
                    <IconifyIcon icon="mdi:information-outline" class="mr-2 text-[var(--color-primary)]" />
                    Device State
                  </h3>
                  <button
                    @click="refreshState"
                    class="px-3 py-1 rounded border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg)] transition flex items-center gap-1"
                    :disabled="stateLoading || !device.is_online"
                  >
                    <IconifyIcon icon="mdi:refresh" :class="{ 'animate-spin': stateLoading }" />
                    <span class="hidden sm:inline">{{ stateLoading ? 'Refreshing...' : 'Refresh' }}</span>
                  </button>
                </div>
                
                <div class="bg-[var(--color-bg)] rounded-lg p-4">
                  <template v-if="deviceState">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-[var(--color-text-secondary)]">Switch State:</span>
                      <div 
                        class="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                        :class="deviceState.value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                      >
                        <IconifyIcon :icon="deviceState.value ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'" />
                        {{ deviceState.value ? 'ON' : 'OFF' }}
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-[var(--color-text-secondary)]">State Code:</span>
                      <code class="px-2 py-1 bg-[var(--color-bg-secondary)] rounded text-xs">{{ deviceState.code }}</code>
                    </div>
                  </template>
                  <div v-else-if="stateLoading" class="flex justify-center py-3">
                    <div class="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                  </div>
                  <div v-else class="text-center py-3 text-[var(--color-text-secondary)] flex items-center justify-center gap-2">
                    <IconifyIcon icon="mdi:help-circle-outline" />
                    <span>State unknown</span>
                    <span v-if="!device.is_online" class="text-xs text-[var(--color-error)]">(Device offline)</span>
                  </div>
                </div>
              </div>
              
              <!-- Offline Message -->
              <div v-if="!device.is_online" class="p-4 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg flex gap-2 items-center">
                <IconifyIcon icon="mdi:wifi-off" class="text-xl flex-shrink-0" />
                <p class="text-sm">This device is currently offline. Controls are disabled until the device comes back online.</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDevicesStore } from '../stores/devices';
import { useToast } from 'vue-toastification';
import { Icon as IconifyIcon } from '@iconify/vue';
import DetailItem from './DetailItem.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  deviceId: { type: String, default: null },
});

const emit = defineEmits(['close', 'refresh']);

const devicesStore = useDevicesStore();
const toast = useToast();

// State variables
const device = ref(null);
const loading = ref(false);
const error = ref(null);
const activeTab = ref('details');
const isEditing = ref(false);
const editedName = ref('');
const nameError = ref('');
const savingName = ref(false);
const deviceState = ref(null);
const stateLoading = ref(false);
const isControlling = ref(null);
const testDuration = ref(2000);
const useDefaultIcon = ref(false);

// Computed properties
const deviceName = computed(() => {
  if (device.value) {
    // Try both camelCase and snake_case versions of the property name
    return device.value.customName || device.value.custom_name || device.value.name || 'Unnamed Device';
  }
  return '';
});

const deviceIconUrl = computed(() => {
  if (useDefaultIcon.value || !device.value?.icon) return null;
  
  // Typically Tuya device icons are hosted at their CDN
  return `https://images.tuyacn.com/${device.value.icon}`;
});

// Watch for device id changes and fetch details
watch(() => props.deviceId, async (newId) => {
  if (newId && props.open) {
    await fetchDeviceDetails();
  }
}, { immediate: true });

// Watch for open state
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.deviceId) {
    await fetchDeviceDetails();
  } else {
    // Reset state when closing
    activeTab.value = 'details';
    isEditing.value = false;
    nameError.value = '';
  }
});

// Methods
async function fetchDeviceDetails() {
  if (!props.deviceId) return;
  
  loading.value = true;
  error.value = null;
  device.value = null;
  deviceState.value = null;
  useDefaultIcon.value = false;
  
  try {
    device.value = await devicesStore.getDeviceDetails(props.deviceId);
    
    // Add detailed logging for device name properties
    console.log("Device details:", device.value);
    console.log("Device name properties:", {
      customName: device.value.customName,
      name: device.value.name, 
      custom_name: device.value.custom_name, // Check for snake_case version
      deviceName: deviceName.value // The computed property
    });
    
    // Initialize editedName with whichever property is available
    editedName.value = device.value.customName || device.value.custom_name || '';
    
    // Also fetch the device state if online
    if (device.value.is_online) {
      refreshState();
    }
  } catch (err) {
    console.error('Failed to fetch device details:', err);
    error.value = err?.message || 'Failed to fetch device details';
  } finally {
    loading.value = false;
  }
}

function onImageError() {
  // If the image fails to load, fall back to the default icon
  useDefaultIcon.value = true;
}

async function refreshState() {
  if (!props.deviceId || !device.value?.is_online) return;
  
  stateLoading.value = true;
  try {
    deviceState.value = await devicesStore.getDeviceState(props.deviceId);
  } catch (err) {
    console.error('Failed to fetch device state:', err);
    toast.error('Failed to fetch device state');
  } finally {
    stateLoading.value = false;
  }
}

async function saveDeviceName() {
  if (!editedName.value.trim()) {
    nameError.value = 'Device name cannot be empty';
    return;
  }
  
  savingName.value = true;
  nameError.value = '';
  
  try {
    await devicesStore.updateDeviceName(props.deviceId, editedName.value.trim());
    
    // Update the local device object
    if (device.value) {
      // Make sure we're setting the property that's actually being used
      device.value.customName = editedName.value.trim();
      
      // Also set the snake_case version if it exists
      if ('custom_name' in device.value) {
        device.value.custom_name = editedName.value.trim();
      }
    }
    
    toast.success('Device name updated successfully');
    isEditing.value = false;
    
    // Emit refresh event to update parent components
    emit('refresh');
  } catch (err) {
    console.error('Failed to update device name:', err);
    nameError.value = err?.message || 'Failed to update device name';
  } finally {
    savingName.value = false;
  }
}

async function turnOn() {
  if (!props.deviceId || !device.value?.is_online) return;
  
  isControlling.value = 'on';
  try {
    const result = await devicesStore.switchOn(props.deviceId);
    toast.success(result.message || 'Device turned on');
    await refreshState();
  } catch (err) {
    console.error('Failed to turn device on:', err);
    toast.error(err?.message || 'Failed to turn device on');
  } finally {
    isControlling.value = null;
  }
}

async function turnOff() {
  if (!props.deviceId || !device.value?.is_online) return;
  
  isControlling.value = 'off';
  try {
    const result = await devicesStore.switchOff(props.deviceId);
    toast.success(result.message || 'Device turned off');
    await refreshState();
  } catch (err) {
    console.error('Failed to turn device off:', err);
    toast.error(err?.message || 'Failed to turn device off');
  } finally {
    isControlling.value = null;
  }
}

async function testDevice() {
  if (!props.deviceId || !device.value?.is_online) return;
  
  isControlling.value = 'test';
  try {
    const result = await devicesStore.testDevice(props.deviceId, testDuration.value);
    toast.success(result.message || 'Test activation triggered');
    await refreshState();
  } catch (err) {
    console.error('Failed to test device:', err);
    toast.error(err?.message || 'Failed to test device');
  } finally {
    isControlling.value = null;
  }
}

// Helper functions
function formatFullDate(timestamp) {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp * 1000).toLocaleString();
}

function formatReadableDate(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  
  // Format like "August 23, 2024"
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  // Format relative time
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Fall back to readable date for older items
  return formatReadableDate(timestamp);
}

function formatLocation(lat, lon) {
  if (!lat || !lon) return 'Unknown';
  
  // Format coordinates with more precision
  try {
    const latitude = parseFloat(lat).toFixed(3);
    const longitude = parseFloat(lon).toFixed(3);
    
    // Add compass directions
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude)}° ${latDir}, ${Math.abs(longitude)}° ${lonDir}`;
  } catch (e) {
    return `${lat}, ${lon}`;
  }
}

function formatTimeZone(timezone) {
  if (!timezone) return 'Unknown';
  
  // Try to format it in a more user-friendly way
  try {
    // Convert "-07:00" to "UTC-7" format
    const match = timezone.match(/([+-])(\d+):(\d+)/);
    if (match) {
      const [_, sign, hours, minutes] = match;
      if (minutes === '00') {
        return `UTC${sign}${parseInt(hours)}`;
      }
      return `UTC${sign}${parseInt(hours)}:${minutes}`;
    }
    
    // If format doesn't match, return as is
    return timezone;
  } catch (e) {
    return timezone;
  }
}
</script>

<style scoped>
.animate-modal-in {
  animation: modal-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}

@keyframes modal-in {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Custom slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 4px;
  background: var(--color-border);
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style> 