import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEventsStore = defineStore('events', () => {
  const events = ref([]); // { type, data, timestamp }

  function addEvent(type, data) {
    events.value.unshift({ type, data, timestamp: new Date().toISOString() });
    // Keep only the latest 100 events
    if (events.value.length > 100) events.value.length = 100;
  }

  function clearEvents() {
    events.value = [];
  }

  function filterByType(type) {
    return events.value.filter(e => e.type === type);
  }

  return { events, addEvent, clearEvents, filterByType };
}); 