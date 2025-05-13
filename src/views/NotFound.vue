<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-4" style="font-family: var(--font-main)">
    <div class="flex flex-col items-center gap-4">
      <IconifyIcon icon="mdi:emoticon-sad-outline" class="text-6xl text-[var(--color-accent)]" />
      <h1 class="text-3xl font-bold">404 - Page Not Found</h1>
      <p class="text-[var(--color-text-secondary)]">Sorry, the page you are looking for does not exist.</p>
      <router-link to="/" class="mt-4 px-4 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition">Go to Home</router-link>
    </div>
  </div>
</template>

<script setup>
import { Icon as IconifyIcon } from '@iconify/vue';
</script> 