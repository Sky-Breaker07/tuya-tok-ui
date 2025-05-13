<template>
  <div class="sm:hidden">
    <button
      @click="open = !open"
      class="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
      aria-label="Open navigation menu"
      :aria-expanded="open"
    >
      <IconifyIcon :icon="open ? 'mdi:close' : 'mdi:menu'" class="text-2xl text-[var(--color-primary)]" />
    </button>
    <transition name="slide-fade">
      <nav
        v-if="open"
        class="fixed top-0 left-0 w-3/4 max-w-xs h-full bg-[var(--color-surface)] shadow-lg z-50 flex flex-col gap-4 p-6 border-r border-[var(--color-border)] animate-slide-in"
        aria-label="Mobile navigation"
      >
        <router-link to="/" class="py-2 px-3 rounded font-medium text-lg text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]" @click="closeMenu">Home</router-link>
        <router-link to="/settings" class="py-2 px-3 rounded font-medium text-lg text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]" @click="closeMenu">Settings</router-link>
        <button @click="closeMenu" class="mt-8 text-xs text-[var(--color-text-secondary)]">Close</button>
      </nav>
    </transition>
    <div v-if="open" class="fixed inset-0 z-40 bg-black bg-opacity-30" @click="closeMenu" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';

const open = ref(false);
function closeMenu() {
  open.value = false;
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}
.slide-fade-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style> 