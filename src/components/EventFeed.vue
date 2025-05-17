<template>
  <div class="w-full max-w-3xl mx-auto mt-8">
    <div class="flex items-center gap-2 mb-3">
      <span class="font-semibold">Event Feed</span>
      <select v-model="filter" class="ml-auto px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm">
        <option value="">All Events</option>
        <option value="like">Likes</option>
        <option value="chat">Comments</option>
        <option value="gift">Gifts</option>
        <option value="follow">Follows</option>
        <option value="tuya-activation">Device Activations</option>
      </select>
      <button @click="clearEvents" class="ml-2 px-2 py-1 rounded bg-[var(--color-error)] text-white text-xs font-semibold hover:bg-red-700 transition">Clear</button>
    </div>
    
    <ul class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      <li v-for="(event, idx) in filteredEvents" :key="idx" 
          class="flex items-start gap-3 p-3 rounded bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
          :class="{'animate-highlight': event.highlight}">
        <!-- TikTok Event Types -->
        <template v-if="event.type === 'tiktok-event'">
          <!-- Like Event -->
          <div v-if="event.data.type === 'like'" class="flex items-start gap-3">
            <IconifyIcon icon="mdi:thumb-up" class="text-xl mt-1 text-[var(--color-success)]" />
            <div class="flex-1">
              <div class="text-sm">
                <span class="font-bold">{{ event.data.data.nickname || event.data.data.uniqueId || 'User' }}</span> 
                liked <span v-if="event.data.data.likeCount > 1" class="font-semibold">{{ event.data.data.likeCount }}x</span>
              </div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Comment/Chat Event -->
          <div v-else-if="event.data.type === 'chat'" class="flex items-start gap-3">
            <IconifyIcon icon="mdi:comment" class="text-xl mt-1 text-[var(--color-primary)]" />
            <div class="flex-1">
              <div>
                <span class="text-sm font-bold">{{ event.data.data.nickname || event.data.data.uniqueId || 'User' }}:</span> 
                <span class="text-sm">{{ event.data.data.comment }}</span>
              </div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Gift Event -->
          <div v-else-if="event.data.type === 'gift'" class="flex items-start gap-3">
            <IconifyIcon icon="mdi:gift" class="text-xl mt-1 text-[var(--color-accent)]" />
            <div class="flex-1">
              <div class="text-sm">
                <span class="font-bold">{{ event.data.data.nickname || event.data.data.uniqueId || 'User' }}</span> 
                sent {{ event.data.data.giftName || 'a gift' }}
                <span v-if="event.data.data.repeatCount > 1" class="font-semibold">x{{ event.data.data.repeatCount }}</span>
                <span v-if="event.data.data.diamondCount" class="text-xs">
                  ({{ event.data.data.diamondCount * (event.data.data.repeatCount || 1) }} diamonds)
                </span>
                <span v-if="event.data.isStreakInProgress" class="ml-1 animate-pulse text-[var(--color-accent)]">
                  <IconifyIcon inline icon="mdi:fire" /> Streak!
                </span>
              </div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Follow Event -->
          <div v-else-if="event.data.type === 'follow'" class="flex items-start gap-3">
            <IconifyIcon icon="mdi:account-plus" class="text-xl mt-1 text-[var(--color-info)]" />
            <div class="flex-1">
              <div class="text-sm">
                <span class="font-bold">{{ event.data.data.nickname || event.data.data.uniqueId || 'User' }}</span> 
                followed
              </div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
          
          <!-- Other TikTok Event -->
          <div v-else class="flex items-start gap-3">
            <IconifyIcon icon="mdi:tiktok" class="text-xl mt-1 text-[var(--color-text-secondary)]" />
            <div class="flex-1">
              <div class="text-sm">
                {{ event.data.type || 'Unknown' }} event: 
                {{ event.data.data?.nickname || event.data.data?.uniqueId || 'User' }}
              </div>
              <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
            </div>
          </div>
        </template>
        
        <!-- Tuya Device Activation -->
        <div v-else-if="event.type === 'tuya-activation'" class="flex items-start gap-3">
          <IconifyIcon icon="mdi:power-plug" class="text-xl mt-1 text-[var(--color-primary)]" />
          <div class="flex-1">
            <div class="text-sm">
              <span class="font-semibold">Device {{ getDeviceName(event.data.deviceId) }}</span> activated 
              <span v-if="event.data.duration">for {{ (event.data.duration/1000).toFixed(1) }}s</span>
              <template v-if="event.data.triggeredBy">
                by <span class="font-semibold">{{ formatTrigger(event.data.triggeredBy) }}</span>
              </template>
            </div>
            <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Device Status Update -->
        <div v-else-if="event.type === 'device-status'" class="flex items-start gap-3">
          <IconifyIcon icon="mdi:power-plug" class="text-xl mt-1 text-[var(--color-text-secondary)]" />
          <div class="flex-1">
            <div class="text-sm">
              <span class="font-semibold">Device {{ getDeviceName(event.data.deviceId) }}</span> 
              status: {{ event.data.status ? 'ON' : 'OFF' }}
            </div>
            <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Fallback for Other Event Types -->
        <div v-else class="flex items-start gap-3">
          <IconifyIcon icon="mdi:information-outline" class="text-xl mt-1 text-[var(--color-text-secondary)]" />
          <div class="flex-1">
            <div class="text-sm">{{ event.type || 'Unknown' }} event</div>
            <div class="text-xs text-[var(--color-text-secondary)]">{{ formatTime(event.timestamp) }}</div>
          </div>
        </div>
      </li>
      <li v-if="filteredEvents.length === 0" class="text-center text-[var(--color-text-secondary)] py-6">No events yet.</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEventsStore } from '../stores/events';
import { Icon as IconifyIcon } from '@iconify/vue';
import { useDevicesStore } from '../stores/devices';

const eventsStore = useEventsStore();
const devicesStore = useDevicesStore();
const filter = ref('');

// Apply filter to events
const filteredEvents = computed(() => {
  if (!filter.value) return eventsStore.events;
  
  if (filter.value === 'tuya-activation') {
    return eventsStore.events.filter(e => e.type === 'tuya-activation');
  }
  
  // For TikTok event types
  return eventsStore.events.filter(e => 
    e.type === 'tiktok-event' && e.data.type === filter.value
  );
});

// Format timestamps
function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Get device name from ID
function getDeviceName(deviceId) {
  const device = devicesStore.devices.find(d => d.id === deviceId);
  return device ? device.name : deviceId;
}

// Format triggering event for device activations
function formatTrigger(trigger) {
  if (!trigger) return 'unknown';
  
  switch (trigger.type) {
    case 'like':
      return 'like';
    case 'chat':
      return 'comment';
    case 'gift':
      return `${trigger.data?.giftName || 'gift'}`;
    case 'follow':
      return 'follow';
    default:
      return trigger.type;
  }
}

// Clear all events
function clearEvents() {
  eventsStore.clearEvents();
}

// Add highlight animation to new events
onMounted(() => {
  // Add animation class that will highlight and fade
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes highlight-fade {
      0% { background-color: var(--color-highlight); }
      100% { background-color: transparent; }
    }
    .animate-highlight {
      animation: highlight-fade 2s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
});
</script>

<style scoped>
/* Scrollbar styles */
.max-h-\[400px\]::-webkit-scrollbar {
  width: 5px;
}
.max-h-\[400px\]::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 5px;
}
.max-h-\[400px\]::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 5px;
}
.max-h-\[400px\]::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style> 