<template>
  <div class="w-full max-w-3xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div v-for="stat in stats" :key="stat.type" class="flex flex-col items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow p-6">
      <IconifyIcon :icon="stat.icon" class="text-3xl mb-2" :class="stat.color" />
      <span class="text-3xl font-bold" :class="stat.color">{{ stat.count }}</span>
      <span class="text-sm text-[var(--color-text-secondary)] mt-1">{{ stat.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { Icon as IconifyIcon } from '@iconify/vue';

const eventsStore = useEventsStore();

const stats = computed(() => {
  // Aggregate counts for each event type
  const counts = {
    like: 0,
    comment: 0,
    gift: 0,
  };
  for (const event of eventsStore.events) {
    if (event.type === 'tiktok-event') {
      if (event.data.type === 'like') counts.like++;
      if (event.data.type === 'chat') counts.comment++;
      if (event.data.type === 'gift') counts.gift++;
    }
  }
  return [
    { type: 'like', label: 'Likes', count: counts.like, icon: 'mdi:thumb-up', color: 'text-[var(--color-success)]' },
    { type: 'comment', label: 'Comments', count: counts.comment, icon: 'mdi:comment', color: 'text-[var(--color-primary)]' },
    { type: 'gift', label: 'Gifts', count: counts.gift, icon: 'mdi:gift', color: 'text-[var(--color-accent)]' },
  ];
});
</script> 