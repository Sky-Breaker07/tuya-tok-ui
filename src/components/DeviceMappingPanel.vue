<template>
  <div class="w-full max-w-2xl mx-auto mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden" style="font-family: var(--font-main)">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-500 p-5 text-white">
      <h3 class="text-xl font-bold flex items-center">
        <IconifyIcon icon="mdi:connection" class="mr-2 text-2xl" />
        Event to Device Mapping
      </h3>
      <p class="text-sm mt-1 opacity-90">Map TikTok events to specific devices for automatic activation</p>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="p-6 flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      <p class="mt-4 text-[var(--color-text-secondary)]">Loading device mappings...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="p-6 text-center">
      <IconifyIcon icon="mdi:alert-circle" class="text-4xl text-[var(--color-error)] mb-2" />
      <p class="text-[var(--color-error)]">{{ error }}</p>
      <button 
        @click="fetchMappings" 
        class="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
      >
        Retry
      </button>
    </div>
    
    <!-- Content -->
    <div v-else class="p-6">
      <div v-if="!devices.length" class="text-center py-4 text-[var(--color-text-secondary)]">
        <p>No devices available for mapping.</p>
        <p class="text-sm mt-1">Please make sure your devices are connected.</p>
      </div>
      
      <div v-else>
        <!-- Mapping cards -->
        <div class="space-y-4">
          <div 
            v-for="trigger in availableTriggers" 
            :key="trigger.id" 
            class="border border-[var(--color-border)] rounded-lg p-4 transition-all hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <!-- Trigger info -->
              <div class="flex items-center">
                <div :class="`${trigger.color} p-2 rounded-full bg-opacity-20`">
                  <IconifyIcon :icon="trigger.icon" class="text-xl" />
                </div>
                <div class="ml-3">
                  <h4 class="font-medium">{{ trigger.name }}</h4>
                  <p class="text-xs text-[var(--color-text-secondary)]">
                    {{ getMappingStatus(trigger.id) }}
                  </p>
                </div>
              </div>
              
              <!-- Device selector -->
              <div class="flex items-center">
                <select 
                  :id="`device-${trigger.id}`"
                  v-model="mappings[trigger.id]"
                  class="pr-8 pl-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm appearance-none"
                  :disabled="isSaving === trigger.id"
                  @change="updateMapping(trigger.id)"
                >
                  <option value="">Not mapped</option>
                  <option 
                    v-for="device in devices" 
                    :key="device.id" 
                    :value="device.id"
                  >
                    {{ getDeviceName(device) }}
                  </option>
                </select>
                
                <!-- Min count selector (only show if a device is selected) -->
                <select
                  v-if="mappings[trigger.id]"
                  v-model="minCounts[trigger.id]"
                  class="ml-2 pr-8 pl-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm appearance-none w-20"
                  :disabled="isSaving === trigger.id"
                  @change="updateMapping(trigger.id)"
                >
                  <option value="1">Every 1</option>
                  <option value="5">Every 5</option>
                  <option value="10">Every 10</option>
                  <option value="25">Every 25</option>
                  <option value="50">Every 50</option>
                  <option value="100">Every 100</option>
                </select>
                
                <!-- Loading indicator -->
                <div v-if="isSaving === trigger.id" class="ml-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-[var(--color-primary)]"></div>
                </div>
                
                <!-- Success indicator -->
                <IconifyIcon 
                  v-else-if="lastSaved === trigger.id" 
                  icon="mdi:check-circle" 
                  class="ml-2 text-[var(--color-success)] text-xl animate-fadeOut"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Help text -->
        <div class="mt-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          <p class="flex items-start">
            <IconifyIcon icon="mdi:information-outline" class="mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Select a device for each event type to automatically trigger that device when the event occurs during a TikTok livestream.
              Select "Not mapped" to disable automatic activation for that event type.
              <br><br>
              For each mapping, you can also choose how frequently the device activates (e.g., "Every 5" means the device will activate after every 5 events of that type).
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useDevicesStore } from '../stores/devices';
import { useToast } from 'vue-toastification';
import { Icon as IconifyIcon } from '@iconify/vue';

const settingsStore = useSettingsStore();
const devicesStore = useDevicesStore();
const toast = useToast();

// Local state
const mappings = ref({});
const minCounts = ref({}); // Store minCount values for each trigger
const isSaving = ref(null); // Currently saving trigger ID
const lastSaved = ref(null); // Last saved trigger ID for showing success indicator
const fadeOutTimer = ref(null);
const rawMappingData = ref({}); // Store the raw mapping data from the API
const localLoading = ref(false); // Local loading state
const localError = ref(null); // Local error state

// Computed properties
const loading = computed(() => settingsStore.loading || localLoading.value);
const error = computed(() => settingsStore.error || localError.value);
const devices = computed(() => devicesStore.devices);
const availableTriggers = computed(() => settingsStore.availableTriggers);

// Initialize
onMounted(async () => {
  await fetchMappings();
});

// Fetch device mappings directly from API to get full mapping data
async function fetchMappings() {
  isSaving.value = null;
  localLoading.value = true;
  localError.value = null;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/device-mappings`);
    const data = await response.json();
    
    // Store the raw mapping data
    rawMappingData.value = data.mappings || {};
    
    // Extract device IDs and minCounts for our local state
    const deviceIds = {};
    const counts = {};
    
    for (const eventType in rawMappingData.value) {
      const mapping = rawMappingData.value[eventType];
      if (mapping.enabled && mapping.deviceId) {
        deviceIds[eventType] = mapping.deviceId;
        counts[eventType] = mapping.minCount || 1;
      } else {
        deviceIds[eventType] = '';
        counts[eventType] = 1;
      }
    }
    
    // Initialize any missing event types
    for (const trigger of availableTriggers.value) {
      if (!deviceIds[trigger.id]) {
        deviceIds[trigger.id] = '';
      }
      if (!counts[trigger.id]) {
        counts[trigger.id] = 1;
      }
    }
    
    mappings.value = deviceIds;
    minCounts.value = counts;
    
  } catch (err) {
    localError.value = `Failed to load device mappings: ${err.message || 'Unknown error'}`;
    console.error('Error loading device mappings:', err);
  } finally {
    localLoading.value = false;
  }
}

// Update a mapping when the select changes
async function updateMapping(triggerId) {
  const deviceId = mappings.value[triggerId];
  const minCount = parseInt(minCounts.value[triggerId] || 1);
  isSaving.value = triggerId;
  
  try {
    if (deviceId) {
      // Create a payload with the required fields
      const payload = {
        deviceId,
        enabled: true,
        minCount
      };
      
      // Send the update request
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/device-mappings/${triggerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`${getEventName(triggerId)} mapped to ${getDeviceNameById(deviceId)}`);
        
        // Update our local raw mapping data
        rawMappingData.value = {
          ...rawMappingData.value,
          [triggerId]: {
            deviceId,
            enabled: true,
            minCount
          }
        };
      } else {
        throw new Error(result.message || 'Failed to update mapping');
      }
    } else {
      // Send a disable request
      const payload = {
        enabled: false
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/device-mappings/${triggerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.info(`${getEventName(triggerId)} mapping cleared`);
        
        // Update our local raw mapping data
        if (rawMappingData.value[triggerId]) {
          rawMappingData.value[triggerId].enabled = false;
        }
      } else {
        throw new Error(result.message || 'Failed to clear mapping');
      }
    }
    
    // Show success indicator briefly
    lastSaved.value = triggerId;
    if (fadeOutTimer.value) clearTimeout(fadeOutTimer.value);
    fadeOutTimer.value = setTimeout(() => {
      lastSaved.value = null;
    }, 3000);
    
  } catch (err) {
    toast.error(`Failed to update mapping: ${err.message || 'Unknown error'}`);
    // Revert to previous values on error
    await fetchMappings(); // Refresh all mappings
  } finally {
    isSaving.value = null;
  }
}

// Watch for changes in the store
watch(() => settingsStore.deviceMappings, (newMappings) => {
  // Only update our local state if we're not in the middle of saving
  if (!isSaving.value) {
    mappings.value = { ...newMappings };
  }
});

// Helper functions
function getDeviceName(device) {
  if (device.custom_name && device.custom_name.trim()) return device.custom_name.trim();
  if (device.name && device.name.trim()) return device.name.trim();
  return 'Unnamed Device';
}

function getDeviceNameById(deviceId) {
  const device = devices.value.find(d => d.id === deviceId);
  return device ? getDeviceName(device) : deviceId;
}

function getEventName(triggerId) {
  const trigger = availableTriggers.value.find(t => t.id === triggerId);
  return trigger ? trigger.name : triggerId;
}

function getMappingStatus(triggerId) {
  const deviceId = mappings.value[triggerId];
  if (!deviceId) return 'Not currently mapped to any device';
  
  const device = devices.value.find(d => d.id === deviceId);
  const minCount = minCounts.value[triggerId] || 1;
  
  if (device) {
    return `Mapped to: ${getDeviceName(device)} (every ${minCount} ${triggerId}${minCount > 1 ? 's' : ''})`;
  } else {
    return `Mapped to unknown device: ${deviceId}`;
  }
}
</script>

<style scoped>
.animate-fadeOut {
  animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.2em;
}
</style> 