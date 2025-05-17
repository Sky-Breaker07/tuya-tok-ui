<template>
  <div class="w-full max-w-3xl mx-auto mb-8">
    <!-- Room info (if available) -->
    <div v-if="roomInfo" class="mb-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-bold text-xl">{{ roomInfo.title || 'TikTok Live' }}</h3>
          <div class="text-sm text-[var(--color-text-secondary)] mt-1">
            <span v-if="roomInfo.status === 2" class="inline-flex items-center text-red-500 mr-2">
              <IconifyIcon icon="mdi:access-point" class="animate-pulse mr-1" /> LIVE
            </span>
            <span v-else class="text-[var(--color-text-secondary)] mr-2">
              <IconifyIcon icon="mdi:access-point-off" class="mr-1" /> Offline
            </span>
            <span class="inline-flex items-center">
              <IconifyIcon icon="mdi:account-group" class="mr-1" /> {{ roomInfo.userCount || 0 }} viewers
            </span>
          </div>
        </div>
        <div v-if="roomInfo.hostInfo" class="flex items-center">
          <img v-if="roomInfo.hostInfo.avatarUrl" :src="roomInfo.hostInfo.avatarUrl" class="w-10 h-10 rounded-full" :alt="roomInfo.hostInfo.nickname" />
          <div class="ml-2 text-sm">
            <div class="font-semibold">{{ roomInfo.hostInfo.nickname }}</div>
            <div class="text-xs text-[var(--color-text-secondary)]">@{{ roomInfo.hostInfo.uniqueId }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.type" class="flex flex-col items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow p-4">
        <IconifyIcon :icon="stat.icon" class="text-2xl mb-1" :class="stat.color" />
        <span class="text-2xl font-bold" :class="stat.color">{{ stat.count.toLocaleString() }}</span>
        <span class="text-xs text-[var(--color-text-secondary)] mt-1">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { useWsStore } from '../stores/ws';
import { Icon as IconifyIcon } from '@iconify/vue';

const eventsStore = useEventsStore();
const wsStore = useWsStore();

// Get room info from WebSocket store
const roomInfo = computed(() => wsStore.roomInfo);

// Get counts from either WS eventCounts (preferred) or locally calculated counts
const stats = computed(() => {
  // Get counts - prefer WS counts, fall back to locally tracked counts
  const eventCounts = wsStore.eventCounts || eventsStore.counts;
  
  return [
    { 
      type: 'like', 
      label: 'Likes', 
      count: eventCounts.likes || 0, 
      icon: 'mdi:thumb-up', 
      color: 'text-[var(--color-success)]' 
    },
    { 
      type: 'comment', 
      label: 'Comments', 
      count: eventCounts.comments || 0, 
      icon: 'mdi:comment', 
      color: 'text-[var(--color-primary)]' 
    },
    { 
      type: 'gift', 
      label: 'Gifts', 
      count: eventCounts.gifts || 0, 
      icon: 'mdi:gift', 
      color: 'text-[var(--color-accent)]' 
    },
    { 
      type: 'follow', 
      label: 'Follows', 
      count: eventCounts.follows || 0, 
      icon: 'mdi:account-plus', 
      color: 'text-[var(--color-info)]' 
    }
  ];
});
</script> 