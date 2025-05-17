<template>
  <div class="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
    <Header />
    <div class="flex flex-1 flex-col items-center justify-center px-4 w-full">
      <div v-if="!isConnected" class="w-full max-w-md bg-[var(--color-surface)] rounded-xl shadow-lg p-8 flex flex-col gap-6 border border-[var(--color-border)] mt-8">
        <h1 class="text-2xl font-bold text-center mb-2" style="font-family: var(--font-main)">TikTok → Tuya Smart Switch</h1>
        <form @submit.prevent="onConnect" class="flex flex-col gap-4">
          <label for="username" class="font-medium">TikTok Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter TikTok username"
            class="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            :disabled="isConnected || isLoading"
            autocomplete="off"
            aria-label="Enter your TikTok username"
            title="Enter your TikTok username (without @)"
          />
          <button
            ref="connectBtn"
            type="submit"
            class="w-full py-2 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold transition disabled:opacity-60"
            :disabled="isLoading || isConnected || !username.trim()"
            aria-label="Connect to TikTok livestream"
            title="Connect to TikTok livestream"
          >
            <span v-if="isLoading">Connecting...</span>
            <span v-else>Connect</span>
          </button>
        </form>
      </div>
      <div v-else class="w-full max-w-3xl mt-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 class="text-xl font-bold" style="font-family: var(--font-main)">Live TikTok Engagement</h2>
          
          <div class="flex items-center space-x-2 mt-2 md:mt-0">
            <span class="text-sm">
              <span v-if="wsStore.connected" class="inline-flex items-center text-[var(--color-success)]">
                <IconifyIcon icon="mdi:access-point" class="mr-1" /> Connected
              </span>
              <span v-else class="inline-flex items-center text-[var(--color-error)]">
                <IconifyIcon icon="mdi:access-point-off" class="mr-1" /> Disconnected
              </span>
            </span>
            <span class="text-sm text-[var(--color-text-secondary)]">|</span>
            <router-link to='/settings' class='text-sm text-[var(--color-primary)] hover:underline'>Settings</router-link>
          </div>
        </div>
        
        <div v-if="isLoading">
          <LoadingSkeleton width="100%" height="120px" />
          <LoadingSkeleton width="100%" height="120px" class="mt-4" />
          <LoadingSkeleton width="100%" height="200px" class="mt-4" />
        </div>
        <div v-else-if="wsError" class="text-center py-8 text-[var(--color-error)]">
          <div class="mb-2">{{ wsError }}</div>
          <div class="text-sm text-[var(--color-text-secondary)] mb-4">WebSocket connection failed. Check your network or server status.</div>
          <button @click="reconnectWebSocket" class="px-4 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition">
            Retry Connection
          </button>
        </div>
        <div v-else>
          <StatsPanel />
          <EventFeed />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, h } from 'vue';
import { useUserStore } from '../stores/user';
import { useWsStore } from '../stores/ws';
import { useToast } from 'vue-toastification';
import { Icon as IconifyIcon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import EventFeed from '../components/EventFeed.vue';
import StatsPanel from '../components/StatsPanel.vue';
import LoadingSkeleton from '../components/LoadingSkeleton.vue';
import axios from 'axios';

const userStore = useUserStore();
const wsStore = useWsStore();
const toast = useToast();
const router = useRouter();

const username = ref('');
const isLoading = ref(false);
const connectBtn = ref(null);

const isConnected = computed(() => userStore.connected);
const wsError = computed(() => wsStore.error);

// Create a dedicated axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Check for active connection when component mounts
async function checkConnectionStatus() {
  isLoading.value = true;
  
  try {
    const res = await apiClient.get('/api/tiktok/status');
    
    if (res.data && res.data.connected) {
      // Update the username field with the connected username
      username.value = res.data.username || '';
      
      // Update the user store with the connection status
      userStore.updateConnectionStatus(true, res.data.username);
      
      // Initialize WebSocket connection
      await nextTick();
      initializeWebSocket();
      
      toast.success(`Already connected as ${res.data.username}`);
    }
  } catch (err) {
    console.error('Failed to check connection status:', err);
    // Don't show error toast as this is a background check
  } finally {
    isLoading.value = false;
  }
}

// Connect to TikTok via API and then initialize WebSocket
async function onConnect() {
  if (!username.value.trim()) {
    toast.error('Please enter your TikTok username.');
    return;
  }
  
  isLoading.value = true;
  
  try {
    await userStore.connect(username.value.trim());
    toast.success(`Connected as ${username.value.trim()}`);
    
    // Initialize WebSocket connection
    await nextTick();
    initializeWebSocket();
  } catch (err) {
    // Check if this is a "user not live" error
    if (err?.message?.includes("User is not currently live streaming")) {
      // Create a custom component for the toast
      const NonLiveUserToast = () => {
        return h('div', {}, [
          h('span', {}, 'This user is not currently live streaming. '),
          h('span', {
            style: {
              color: 'var(--color-primary)', 
              textDecoration: 'underline',
              fontWeight: 'bold',
              cursor: 'pointer'
            }
          }, 'Click here'),
          h('span', {}, ' to go to Settings and enable \'Allow Non-Live Users\' option.')
        ]);
      };
      
      // Use the component in the toast
      toast.warning(NonLiveUserToast, {
        timeout: 8000,
        onClick: () => {
          router.push('/settings');
        }
      });
    } else {
      toast.error(err?.message || 'Failed to connect to TikTok.');
    }
  } finally {
    isLoading.value = false;
  }
}

// Initialize WebSocket connection
function initializeWebSocket() {
  wsStore.connect();
  
  // If we're already connected to the socket, show a success toast
  if (wsStore.connected) {
    toast.success('Connected to WebSocket server');
  }
}

// Retry WebSocket connection
function reconnectWebSocket() {
  toast.info('Reconnecting to WebSocket server...');
  wsStore.disconnect();
  setTimeout(() => {
    wsStore.connect();
  }, 1000);
}

// Watch for connection status changes
watch(isConnected, (val) => {
  if (val) {
    initializeWebSocket();
  } else {
    wsStore.disconnect();
  }
});

// Watch for WebSocket errors
watch(() => wsStore.error, (newError) => {
  if (newError) {
    toast.error(`WebSocket error: ${newError}`);
  }
});

// Connect WebSocket on component mount if already connected to TikTok
onMounted(() => {
  // First check if there's an active connection
  checkConnectionStatus();
});

// Disconnect WebSocket on component unmount
onUnmounted(() => {
  wsStore.disconnect();
});
</script>
