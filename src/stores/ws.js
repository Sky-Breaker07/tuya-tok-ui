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
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  function connect() {
    if (socket) return;
    
    const eventsStore = useEventsStore();
    const userStore = useUserStore();
    
    // Get the WebSocket URL based on environment
    const getWebSocketUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        // In production, use the same host but without explicit protocol
        // Socket.IO will determine the appropriate protocol
        return window.location.origin;
      } else {
        console.log('Using development WebSocket URL:', import.meta.env.VITE_WS_URL);
        // In development, use the configured URL or default to localhost
        return import.meta.env.VITE_WS_URL || 'http://localhost:8800';
      }
    };

    const socketOptions = {
      autoConnect: true,
      transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
      path: '/socket.io/',
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      withCredentials: true
    };

    console.log('Connecting to WebSocket server at:', getWebSocketUrl(), 'with options:', socketOptions);
    socket = io(getWebSocketUrl(), socketOptions);

    // Connection events
    socket.on('connect', () => {
      connected.value = true;
      error.value = null;
      reconnectAttempts = 0;
      console.log('Connected to WebSocket server with ID:', socket.id);
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
      reconnectAttempts++;
      error.value = err?.message || 'WebSocket connection error';
      console.error('WebSocket connection error:', err);
      
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Maximum reconnection attempts reached, falling back to polling');
        // If we've tried websocket and it's failing, force polling only
        if (socket.io.opts.transports.includes('websocket')) {
          socket.io.opts.transports = ['polling'];
          socket.disconnect().connect();
        }
      }
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