<template>
  <header class="w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0 px-2 sm:px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm" style="font-family: var(--font-main)">
    <!-- Logo/Title -->
    <div class="flex items-center gap-2 mb-1 sm:mb-0">
      <span class="text-lg sm:text-xl font-bold text-[var(--color-primary)]">TikTok → Tuya</span>
    </div>
    <!-- Mobile Navigation -->
    <MobileNavMenu class="sm:hidden" />
    <!-- Desktop Navigation Links -->
    <nav class="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4 mb-1 sm:mb-0" aria-label="Main navigation">
      <router-link to="/" class="px-2 py-1 rounded font-medium text-sm sm:text-base" :class="{ 'bg-[var(--color-primary)] text-white': isHome, 'text-[var(--color-primary)]': !isHome }" aria-label="Go to Home page" title="Home">Home</router-link>
      <router-link to="/settings" class="px-2 py-1 rounded font-medium text-sm sm:text-base" :class="{ 'bg-[var(--color-primary)] text-white': isSettings, 'text-[var(--color-primary)]': !isSettings }" aria-label="Go to Settings page" title="Settings">Settings</router-link>
    </nav>
    <!-- Connection Status & Actions -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
      <span v-if="isConnected" class="text-[var(--color-success)] font-medium text-xs sm:text-base" aria-label="Connected as {{ userStore.username }}" title="Connected as {{ userStore.username }}">Connected as <b>{{ userStore.username }}</b></span>
      <span v-else class="text-[var(--color-text-secondary)] text-xs sm:text-base" aria-label="Disconnected" title="Disconnected">Disconnected</span>
      <button
        v-if="isConnected"
        @click="showModal = true"
        class="ml-0 sm:ml-2 px-2 sm:px-3 py-1 rounded bg-[var(--color-error)] text-white font-semibold hover:bg-red-700 transition text-xs sm:text-base"
        aria-label="Disconnect from TikTok"
        title="Disconnect"
      >Disconnect</button>
      <ThemeSwitch />
    </div>
    <ConfirmModal
      :open="showModal"
      title="Disconnect from TikTok?"
      message="Are you sure you want to disconnect from TikTok livestream?"
      confirmText="Disconnect"
      cancelText="Cancel"
      @confirm="onDisconnect"
      @cancel="showModal = false"
    />
  </header>
</template>

<script setup>
import { useUserStore } from '../stores/user';
import ThemeSwitch from './ThemeSwitch.vue';
import { useToast } from 'vue-toastification';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmModal from './ConfirmModal.vue';
import MobileNavMenu from './MobileNavMenu.vue';

const userStore = useUserStore();
const toast = useToast();
const isConnected = computed(() => userStore.connected);

const route = useRoute();
const isHome = computed(() => route.path === '/');
const isSettings = computed(() => route.path === '/settings');

const showModal = ref(false);

async function onDisconnect() {
  showModal.value = false;
  try {
    await userStore.disconnect();
    toast.success('Disconnected from TikTok.');
  } catch (err) {
    toast.error(err?.message || 'Failed to disconnect.');
  }
}
</script> 