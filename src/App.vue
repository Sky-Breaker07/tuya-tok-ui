<template>
  <div class="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]" style="font-family: var(--font-main)">
    <!-- Header and ThemeSwitch will be added here in the future -->
    <router-view />
    <!-- Toastification is globally configured in main.js -->
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import './assets/main.css';
</script>
