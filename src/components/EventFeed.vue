<template>
  <div class="w-full max-w-2xl mx-auto mt-8">
    <div class="flex items-center gap-2 mb-3">
      <span class="font-semibold">Event Feed</span>
      <select v-model="filter" class="ml-auto px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm">
        <option value="">All</option>
        <option value="tiktok-event">TikTok Events</option>
        <option value="tuya-activation">Device Activations</option>
      </select>
      <button @click="clearEvents" class="ml-2 px-2 py-1 rounded bg-[var(--color-error)] text-white text-xs font-semibold hover:bg-red-700 transition">Clear</button>
    </div>
    <ul class="space-y-2">
      <li v-for="(event, idx) in filteredEvents" :key="idx" class="flex items-center gap-3 p-3 rounded bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <IconifyIcon :icon="event.type === 'tiktok-event' ? 'mdi:tiktok' : 'mdi:power-plug'" class="text-xl" :class="event.type === 'tiktok-event' ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'" />
        <div class="flex-1">
          <div class="text-sm">
            <span v-if="event.type === 'tiktok-event'">
              <b>{{ event.data?.data?.user || 'User' }}</b> {{ event.data?.type || 'event' }}
            </span>
            <span v-else-if="event.type === 'tuya-activation'">
              Device <b>{{ event.data.deviceId }}</b> activated for {{ event.data.duration }}ms
              <span v-if="event.data.triggeredBy"> (by {{ event.data.triggeredBy.type }})</span>
            </span>
          </div>
          <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
        </div>
      </li>
      <li v-if="filteredEvents.length === 0" class="text-center text-[var(--color-text-secondary)] py-6">No events yet.</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useEventsStore } from '../stores/events';
import { Icon as IconifyIcon } from '@iconify/vue';

const eventsStore = useEventsStore();
const filter = ref('');

const filteredEvents = computed(() => {
  if (!filter.value) return eventsStore.events;
  return eventsStore.events.filter(e => e.type === filter.value);
});

function clearEvents() {
  eventsStore.clearEvents();
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}
</script> 