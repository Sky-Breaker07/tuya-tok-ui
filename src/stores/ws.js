import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useEventsStore } from './events';
import { useUserStore } from './user';

export const useWsStore = defineStore('ws', () => {
  const connected = ref(false);
  const error = ref(null);
  const roomInfo = ref(null);
  const eventCounts = ref({ likes: 0, comments: 0, gifts: 0, follows: 0 });
  let socket = null;

  function connect() {
    if (socket) return;
    
    const eventsStore = useEventsStore();
    const userStore = useUserStore();
    
    // Get the WebSocket URL based on environment
    const getWebSocketUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        // In production, use the same host
        return undefined; // Socket.IO will use the current host automatically
      } else {
        // In development, use the configured URL or default to localhost
        return import.meta.env.VITE_WS_URL || 'http://localhost:8800';
      }
    };

    socket = io(getWebSocketUrl(), {
      autoConnect: true,
      transports: ['websocket'],
    });

    // Connection events
    socket.on('connect', () => {
      connected.value = true;
      error.value = null;
      console.log('Connected to WebSocket server');
    });
    
    socket.on('connection-acknowledged', (data) => {
      console.log('Socket ID:', data.socketId);
      socket.emit('client-ready', { clientType: 'web-dashboard' });
    });
    
    socket.on('disconnect', () => {
      connected.value = false;
      console.log('Disconnected from WebSocket server');
    });
    
    socket.on('connect_error', (err) => {
      error.value = err?.message || 'WebSocket connection error';
      console.error('WebSocket connection error:', err);
    });

    // TikTok events
    socket.on('tiktok-event', (event) => {
      console.log('Received tiktok-event:', event);
      eventsStore.addEvent('tiktok-event', event);
    });
    
    // TikTok connection status
    socket.on('tiktok-connection-status', (status) => {
      console.log('Received tiktok-connection-status:', status);
      userStore.updateConnectionStatus(status.connected, status.username);
      if (status.error) {
        error.value = status.message || 'TikTok connection error';
      }
      eventsStore.addEvent('connection-status', status);
    });
    
    // Room info updates
    socket.on('room-info-update', (info) => {
      console.log('Received room-info-update:', info);
      roomInfo.value = info;
      eventsStore.addEvent('room-info', info);
    });
    
    // Event counts
    socket.on('event-counts-update', (data) => {
      console.log('Received event-counts-update:', data);
      eventCounts.value = data.counts;
      eventsStore.addEvent('counts-update', data);
    });
    
    // Tuya device activations
    socket.on('tuya-activation', (data) => {
      console.log('Received tuya-activation:', data);
      eventsStore.addEvent('tuya-activation', data);
    });
    
    // Tuya device status
    socket.on('tuya-device-status', (data) => {
      console.log('Received tuya-device-status:', data);
      eventsStore.addEvent('device-status', data);
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      connected.value = false;
      roomInfo.value = null;
      eventCounts.value = { likes: 0, comments: 0, gifts: 0, follows: 0 };
    }
  }

  return { 
    connected, 
    error, 
    roomInfo,
    eventCounts,
    connect, 
    disconnect 
  };
}); 