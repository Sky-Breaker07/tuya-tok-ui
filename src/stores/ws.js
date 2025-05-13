import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useEventsStore } from './events';

export const useWsStore = defineStore('ws', () => {
  const connected = ref(false);
  const error = ref(null);
  let socket = null;

  function connect() {
    if (socket) return;
    const eventsStore = useEventsStore();
    socket = io(import.meta.env.VITE_WS_URL || window.location.origin, {
      autoConnect: true,
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      connected.value = true;
      error.value = null;
    });
    socket.on('disconnect', () => {
      connected.value = false;
    });
    socket.on('connect_error', (err) => {
      error.value = err?.message || 'WebSocket connection error';
    });
    socket.on('tiktok-event', (data) => {
      eventsStore.addEvent('tiktok-event', data);
    });
    socket.on('tuya-activation', (data) => {
      eventsStore.addEvent('tuya-activation', data);
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      connected.value = false;
    }
  }

  return { connected, error, connect, disconnect };
}); 