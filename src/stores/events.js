import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEventsStore = defineStore('events', () => {
  const events = ref([]); // { type, data, timestamp }
  
  // Event counts for easier access
  const counts = ref({
    likes: 0,
    comments: 0,
    gifts: 0,
    follows: 0
  });

  // Add an event to the events list
  function addEvent(type, data) {
    // Use timestamp from the event if available, otherwise use current time
    const timestamp = data.timestamp || new Date().toISOString();
    
    events.value.unshift({ 
      type, 
      data, 
      timestamp 
    });
    
    // Update counts if this is a tiktok-event
    if (type === 'tiktok-event') {
      updateCounts(data);
    }
    
    // If we receive a counts-update event, update our local counts
    if (type === 'counts-update' && data.counts) {
      counts.value = { ...data.counts };
    }
    
    // Keep only the latest 100 events
    if (events.value.length > 100) {
      events.value.length = 100;
    }
  }

  // Update counts based on event type
  function updateCounts(eventData) {
    if (!eventData || !eventData.type) return;

    switch (eventData.type) {
      case 'like':
        counts.value.likes += eventData.data?.likeCount || 1;
        break;
      case 'chat':
        counts.value.comments += 1;
        break;
      case 'gift':
        counts.value.gifts += 1;
        break;
      case 'follow':
        counts.value.follows += 1;
        break;
    }
  }

  // Reset all event data
  function clearEvents() {
    events.value = [];
    counts.value = {
      likes: 0,
      comments: 0,
      gifts: 0,
      follows: 0
    };
  }

  // Filter events by specific type
  function filterByType(type) {
    return events.value.filter(e => e.type === type);
  }

  // Filter tiktok-events by specific subtype (like, chat, gift, etc)
  function filterByEventType(eventType) {
    return events.value.filter(e => 
      e.type === 'tiktok-event' && e.data?.type === eventType
    );
  }

  // Get all tiktok events only
  const tiktokEvents = computed(() => {
    return events.value.filter(e => e.type === 'tiktok-event');
  });

  // Get all device activation events only
  const deviceEvents = computed(() => {
    return events.value.filter(e => 
      e.type === 'tuya-activation' || e.type === 'device-status'
    );
  });

  return { 
    events, 
    counts,
    addEvent, 
    clearEvents, 
    filterByType,
    filterByEventType,
    tiktokEvents,
    deviceEvents
  };
}); 