# Frontend Integration Guide: TikTok-Tuya Integration Server

This guide explains how to connect your frontend (e.g., Vue.js) to the TikTok-Tuya backend for real-time smart switch activation based on TikTok livestream events.

---

## 1. Overview

- **Connect to TikTok live**: User enters their TikTok username and clicks "Connect" to start monitoring.
- **Real-time events**: The backend emits TikTok and Tuya events via WebSocket.
- **Device control**: The frontend can list available Tuya devices, query their state, get device details, and manually control them.
- **Settings**: Activation durations can be configured globally or per device.

---

## 2. REST API Endpoints

### **TikTok Stream Management**

- **Connect to TikTok Live**
  - `POST /api/tiktok/connect`
  - Body: `{ "username": "tiktok_username" }`
  - Response: `{ success, message, username }`

- **Disconnect from TikTok Live**
  - `POST /api/tiktok/disconnect`
  - Response: `{ success, message }`

- **Get Connection Status**
  - `GET /api/tiktok/status`
  - Response: `{ connected: true|false, username }`

---

### **Device Management**

- **List Devices**
  - `GET /api/devices`
  - Response: `{ devices: [ { id, name, ... } ] }`

- **Get Device Details**
  - `GET /api/devices/:deviceId`
  - Response: `{ device: { ...deviceDetails } }`

- **Get Device Switch State**
  - `GET /api/devices/:deviceId/state`
  - Response: `{ state: { code: 'switch_1', value: true|false } }`
  - `value: true` means ON, `false` means OFF.

- **Modify Device Custom Name**
  - `POST /api/devices/:deviceId/name`
  - Body: `{ "name": "New Device Name" }`
  - Response:
    - `{ success: true, message: 'Device name updated', tuya: { ... } }`
    - `{ success: false, message: 'Failed to update device name', tuya: { ... } }`

- **Switch Device ON**
  - `POST /api/devices/:deviceId/on`
  - Optional: `{ "duration": 2000 }` (ms) in body or as query param
  - If `duration` is provided, the device will turn ON, wait, then turn OFF after the specified time.
  - If `duration` is omitted, the device will turn ON and stay ON until you explicitly call the OFF endpoint.
  - Response:
    - `{ success: true, message: 'Switch activated for 2s' }` (timed)
    - `{ success: true, message: 'Switch turned on indefinitely' }` (indefinite)
    - `{ success: false, message: 'Failed to turn device ON', tuya: { ... } }` (if device did not actually turn ON)

- **Switch Device OFF**
  - `POST /api/devices/:deviceId/off`
  - Response:
    - `{ success: true, message: 'Switch deactivated' }`
    - `{ success: false, message: 'Failed to turn device OFF', tuya: { ... } }` (if device did not actually turn OFF)

---

### **Settings Management**

- **Get Global Activation Duration**
  - `GET /api/settings/activation-duration`
  - Response: `{ key, value }`

- **Get Per-Device Activation Duration**
  - `GET /api/settings/activation-duration/:deviceId`
  - Response: `{ key, value }`

- **Set Global Activation Duration**
  - `POST /api/settings/activation-duration`
  - Body: `{ "value": 2000 }` (ms)

- **Set Per-Device Activation Duration**
  - `POST /api/settings/activation-duration/:deviceId`
  - Body: `{ "value": 3000 }` (ms)

---

## 3. WebSocket Integration

- **Connect to WebSocket**
  - Use `socket.io-client` to connect to the backend (same host/port as API).

- **Events Emitted by Backend:**
  - `tiktok-event`:  
    `{ type: 'like' | 'chat' | ... , data: {...} }`
  - `tuya-activation`:  
    `{ deviceId, duration, triggeredBy: { type, data } }`

- **Example (Vue.js with socket.io-client):**
  ```js
  import { io } from 'socket.io-client';
  const socket = io('http://localhost:8800');

  socket.on('tiktok-event', (event) => {
    // Handle TikTok event (e.g., update UI)
  });

  socket.on('tuya-activation', (data) => {
    // Handle Tuya device activation (e.g., show animation)
  });
  ```

---

## 4. Typical Frontend Flow

1. **User enters TikTok username and clicks Connect**
   - POST to `/api/tiktok/connect` with `{ username }`
   - On success, show "Connected" and start listening for events via WebSocket.

2. **User can view available devices**
   - GET `/api/devices` to list all Tuya devices.

3. **User can view device details and state**
   - GET `/api/devices/:deviceId` for details.
   - GET `/api/devices/:deviceId/state` for ON/OFF state.

4. **User can manually control devices**
   - POST `/api/devices/:deviceId/on` or `/off` to test or override automation.
   - If ON is called without duration, device stays ON until turned OFF.
   - If ON is called with duration, device turns OFF after the specified time.
   - API will return `success: false` if the device did not actually switch ON/OFF (see `tuya` field for details).

5. **User can configure activation durations**
   - GET/POST `/api/settings/activation-duration` (global) or `/api/settings/activation-duration/:deviceId` (per-device).

6. **User can disconnect**
   - POST to `/api/tiktok/disconnect` to stop monitoring.

---

## 5. Error Handling

- All API errors return `{ success: false, message: "..." }` and appropriate HTTP status codes.
- For device ON/OFF, if the device did not actually perform the action, `success: false` is returned and the raw Tuya response is included in the `tuya` field for debugging.
- WebSocket connection errors should be handled on the frontend (e.g., show "Disconnected" if socket disconnects).

---

## 6. Security & CORS

- The backend is configured with CORS enabled for all origins. Adjust as needed for production.

---

## 7. Example: Connecting from Vue.js

```js
// Connect to TikTok
await axios.post('/api/tiktok/connect', { username: 'your_tiktok_username' });

// Listen for events
import { io } from 'socket.io-client';
const socket = io('http://localhost:8800');
socket.on('tiktok-event', (event) => { /* ... */ });
socket.on('tuya-activation', (data) => { /* ... */ });

// List devices
const { data } = await axios.get('/api/devices');

// Get device details
const { data: details } = await axios.get(`/api/devices/${deviceId}`);

// Get device ON/OFF state
const { data: state } = await axios.get(`/api/devices/${deviceId}/state`);

// Modify device custom name
await axios.post(`/api/devices/${deviceId}/name`, { name: 'Main Bedroom Light' });

// Switch device on for 3 seconds
await axios.post(`/api/devices/${deviceId}/on`, { duration: 3000 });

// Switch device on indefinitely
await axios.post(`/api/devices/${deviceId}/on`);

// Switch device off
await axios.post(`/api/devices/${deviceId}/off`);

// Set global activation duration
await axios.post('/api/settings/activation-duration', { value: 2000 });
```

---

## 8. Notes

- Only one TikTok stream can be monitored at a time.
- Device info is always fetched live from Tuya API.
- Activation duration can be set per request, per device, or globally.
- All real-time events are delivered via WebSocket.
- Device ON/OFF endpoints now reflect the actual result from Tuya, not just API call success.
- You can query device ON/OFF state at any time using the new endpoint.

---

**For any questions or issues, please refer to the backend team or the main project documentation.** 