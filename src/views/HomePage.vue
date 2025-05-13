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
        <h2 class="text-xl font-bold mb-4" style="font-family: var(--font-main)">Live TikTok Engagement</h2>
        <p class="mb-4 text-[var(--color-text-secondary)]">See your TikTok livestream stats and real-time event feed. Device controls and settings are now on the <router-link to='/settings' class='text-[var(--color-primary)] underline'>Settings page</router-link>.</p>
        <div v-if="isLoading">
          <LoadingSkeleton width="100%" height="100px" />
          <LoadingSkeleton width="100%" height="200px" class="mt-4" />
        </div>
        <div v-else-if="wsError" class="text-center py-8 text-[var(--color-error)]">
          <div>{{ wsError }}</div>
          <button @click="wsStore.connect()" class="mt-4 px-4 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition">Retry Connection</button>
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../stores/user';
import { useWsStore } from '../stores/ws';
import { useToast } from 'vue-toastification';
import Header from '../components/Header.vue';
import EventFeed from '../components/EventFeed.vue';
import StatsPanel from '../components/StatsPanel.vue';
import LoadingSkeleton from '../components/LoadingSkeleton.vue';

const userStore = useUserStore();
const wsStore = useWsStore();
const toast = useToast();

const username = ref('');
const isLoading = ref(false);
const connectBtn = ref(null);

const isConnected = computed(() => userStore.connected);
const wsError = computed(() => wsStore.error);

async function onConnect() {
  if (!username.value.trim()) {
    toast.error('Please enter your TikTok username.');
    return;
  }
  isLoading.value = true;
  try {
    await userStore.connect(username.value.trim());
    toast.success(`Connected as ${username.value.trim()}`);
    wsStore.connect();
  } catch (err) {
    toast.error(err?.message || 'Failed to connect.');
  } finally {
    isLoading.value = false;
  }
}

watch(isConnected, (val) => {
  if (val) {
    wsStore.connect();
  } else {
    wsStore.disconnect();
  }
});

onMounted(() => {
  if (isConnected.value) wsStore.connect();
});
onUnmounted(() => {
  wsStore.disconnect();
});
</script>
