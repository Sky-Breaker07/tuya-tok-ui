<template>
  <div class="w-full max-w-2xl mx-auto mt-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden" style="font-family: var(--font-main)">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white">
      <h3 class="text-xl font-bold flex items-center">
        <IconifyIcon icon="mdi:account-settings" class="mr-2 text-2xl" />
        Connection Settings
      </h3>
      <p class="text-sm mt-1 opacity-90">Configure how the TikTok connection behaves</p>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="p-6 flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      <p class="mt-4 text-[var(--color-text-secondary)]">Loading settings...</p>
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
      <!-- Allow Non-Live Users Toggle -->
      <div class="p-5 border border-[var(--color-border)] rounded-lg hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-medium text-lg flex items-center">
              <IconifyIcon icon="mdi:account-alert" class="mr-2 text-[var(--color-warning)]" />
              Allow Non-Live Users
            </h4>
            <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
              When enabled, you can connect to TikTok users who are not currently streaming live.
              This is useful for testing or setting up your integration before going live.
            </p>
            <div class="mt-3 p-3 bg-[var(--color-bg-secondary)] rounded-lg text-sm border border-[var(--color-border)]">
              <p class="flex items-start">
                <IconifyIcon icon="mdi:information-outline" class="mr-2 mt-0.5 flex-shrink-0 text-[var(--color-info)]" />
                <span>
                  <strong>Note:</strong> When connecting to non-live users, you won't receive real-time events.
                  This setting is primarily for testing device connections and configurations.
                </span>
              </p>
            </div>
          </div>
          
          <div class="ml-4">
            <button 
              @click="toggleAllowNonLive" 
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="allowNonLive ? 'bg-[var(--color-success)]' : 'bg-gray-400 dark:bg-gray-600'"
              role="switch"
              :aria-checked="allowNonLive"
              :disabled="isSaving"
            >
              <span class="sr-only">Allow non-live users</span>
              <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="allowNonLive ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
            
            <!-- Loading indicator -->
            <div v-if="isSaving" class="mt-2 flex justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-[var(--color-primary)]"></div>
            </div>
            
            <!-- Status text -->
            <div v-else class="mt-2 text-xs text-center font-medium" :class="allowNonLive ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'">
              {{ allowNonLive ? 'Enabled' : 'Disabled' }}
            </div>
          </div>
        </div>
        
        <!-- Current connection status -->
        <div v-if="isConnected" class="mt-4 p-3 rounded-lg" :class="allowNonLive ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'">
          <p class="text-sm flex items-center" :class="allowNonLive ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'">
            <IconifyIcon icon="mdi:connection" class="mr-2" />
            Currently connected to: <span class="font-bold ml-1">{{ username }}</span>
          </p>
          <p class="text-xs mt-1" :class="allowNonLive ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'">
            Changes to this setting will take effect on your next connection.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useUserStore } from '../stores/user';
import { useToast } from 'vue-toastification';
import { Icon as IconifyIcon } from '@iconify/vue';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const toast = useToast();

// Local state
const allowNonLive = ref(false);
const isSaving = ref(false);

// Computed properties
const loading = computed(() => settingsStore.loading);
const error = computed(() => settingsStore.error);
const isConnected = computed(() => userStore.connected);
const username = computed(() => userStore.username);

// Initialize
onMounted(async () => {
  await fetchSettings();
});

// Fetch settings
async function fetchSettings() {
  await settingsStore.fetchAllowNonLiveUsers();
  allowNonLive.value = settingsStore.allowNonLiveUsers;
}

// Toggle the setting
async function toggleAllowNonLive() {
  isSaving.value = true;
  
  try {
    const newValue = !allowNonLive.value;
    await settingsStore.setAllowNonLiveUsers(newValue);
    allowNonLive.value = newValue;
    
    toast.success(`Non-live users ${newValue ? 'allowed' : 'disallowed'}`);
    
    if (isConnected.value) {
      toast.info('This change will take effect on your next connection.');
    }
  } catch (err) {
    toast.error(`Failed to update setting: ${err.message || 'Unknown error'}`);
    // Revert to previous value on error
    allowNonLive.value = settingsStore.allowNonLiveUsers;
  } finally {
    isSaving.value = false;
  }
}
</script> 