<template>
  <div class="relative inline-block">
    <button
      ref="themeBtn"
      @click="toggleTheme"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      class="flex items-center justify-center w-10 h-10 rounded-full transition bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
    >
      <IconifyIcon
        :icon="theme === 'dark' ? 'mdi:weather-night' : 'mdi:white-balance-sunny'"
        class="text-2xl"
        :class="theme === 'dark' ? 'text-yellow-300' : 'text-[var(--color-primary)]'"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue';
import { useThemeStore } from '../stores/theme';
import { Icon as IconifyIcon } from '@iconify/vue';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.theme);
const toggleTheme = themeStore.toggleTheme;

const themeBtn = ref(null);
</script> 