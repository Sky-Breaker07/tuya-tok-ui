# Frontend Integration Guide: TikTok-Tuya Integration Server

This guide explains how to connect your frontend (e.g., Vue.js) to the TikTok-Tuya backend for real-time smart switch activation based on TikTok livestream events.

---

## 1. Overview

- **Connect to TikTok live**: User enters their TikTok username and clicks "Connect" to start monitoring.
- **Real-time events**: The backend emits TikTok and Tuya events via WebSocket.
- **Device control**: The frontend can list available Tuya devices, query their state, get device details, and manually control them.
- **Settings**: Activation durations can be configured globally or per device.
- **Event-to-Device Mapping**: Configure which devices respond to which TikTok events.

---

## 2. REST API Endpoints

### **TikTok Stream Management**

- **Connect to TikTok Live**
  - `POST /api/tiktok/connect`
  - Body: `{ "username": "tiktok_username", "throttleSettings": { ... }, "forceConnect": true|false }`
    - `username`: Required - TikTok username to connect to (without @ symbol)
    - `throttleSettings`: Optional - Custom throttling settings for events
    - `forceConnect`: Optional - Force connection even if user is not live
  - Response (success): 
    ```json
    { 
      "success": true, 
      "message": "Connected to live stream", 
      "username": "tiktok_username",
      "isLive": true|false,
      "throttleSettings": { ... },
      "roomInfo": { ... } 
    }
    ```
  - Response (error - not live): 
    ```json
    {
      "success": false,
      "message": "User is not currently live streaming. Set forceConnect=true to connect anyway.",
      "error": "USER_NOT_LIVE",
      "isLive": false,
      "roomInfo": { ... }
    }
    ```

- **Disconnect from TikTok Live**
  - `POST /api/tiktok/disconnect`
  - Response: `{ success: true, message: "Successfully disconnected from TikTok stream" }`

- **Get Connection Status**
  - `GET /api/tiktok/status`
  - Response: 
    ```json
    { 
      "connected": true|false, 
      "username": "tiktok_username", 
      "isLive": true|false,
      "counts": { 
        "likes": 123, 
        "comments": 45, 
        "gifts": 6, 
        "follows": 7 
      },
      "roomInfo": { ... }
    }
    ```

- **Get Room Information**
  - `GET /api/tiktok/room-info/:username` - Get info for a specific username
  - `GET /api/tiktok/room-info` - Get info for currently connected user
  - Response: 
    ```json
    { 
      "success": true, 
      "username": "tiktok_username", 
      "isLive": true|false,
      "roomInfo": { ... } 
    }
    ```

- **Configure Offline Connect Setting**
  - `GET /api/settings/allow-offline-connect` - Get current setting
  - Response: `{ "key": "allow_connect_to_offline_users", "value": true|false, "description": "..." }`
  - `POST /api/settings/allow-offline-connect` - Update setting
  - Body: `{ "value": true|false }`
  - Response: `{ "success": true, "key": "allow_connect_to_offline_users", "value": true|false, "description": "..." }`

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

### **Device-to-Event Mapping Management**

- **Get All Device-to-Event Mappings**
  - `GET /api/device-mappings`
  - Response:
    ```json
    {
      "mappings": {
        "like": {
          "deviceId": "123456",
          "enabled": true,
          "minCount": 5,
          "updatedAt": "2023-01-01T12:00:00.000Z"
        },
        "chat": {
          "deviceId": "234567",
          "enabled": true,
          "minCount": 1,
          "updatedAt": "2023-01-01T12:00:00.000Z"
        },
        "gift": { ... },
        "follow": { ... }
      },
      "supportedEvents": ["like", "chat", "gift", "follow"],
      "devices": [
        { "id": "123456", "name": "Living Room Plug" },
        { "id": "234567", "name": "Bedroom Lamp" }
      ]
    }
    ```

- **Get a Specific Device-to-Event Mapping**
  - `GET /api/device-mappings/:eventType` (e.g., `/api/device-mappings/like`)
  - Response:
    ```json
    {
      "eventType": "like",
      "mapping": {
        "deviceId": "123456",
        "enabled": true,
        "minCount": 5,
        "duration": 3000
      },
      "exists": true
    }
    ```

- **Update a Device-to-Event Mapping**
  - `POST /api/device-mappings/:eventType` (e.g., `/api/device-mappings/like`)
  - Body:
    ```json
    {
      "deviceId": "123456",      // Device ID to activate (required if enabled=true)
      "enabled": true,           // Whether this mapping is active (default: true)
      "minCount": 5,             // Activate after every X events (default: 1)
      "duration": 3000           // Optional: Also update duration for this device
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "eventType": "like",
      "mapping": {
        "deviceId": "123456",
        "enabled": true,
        "minCount": 5,
        "updatedAt": "2023-01-01T12:00:00.000Z"
      },
      "message": "Successfully updated mapping for like events"
    }
    ```

---

### **Device-to-Event Mapping Management**- **Get All Device-to-Event Mappings**  - `GET /api/device-mappings`  - Response:    ```json    {      "mappings": {        "like": {          "deviceId": "123456",          "enabled": true,          "minCount": 5,          "updatedAt": "2023-01-01T12:00:00.000Z"        },        "chat": {          "deviceId": "234567",          "enabled": true,          "minCount": 1,          "updatedAt": "2023-01-01T12:00:00.000Z"        },        "gift": { ... },        "follow": { ... }      },      "supportedEvents": ["like", "chat", "gift", "follow"],      "devices": [        { "id": "123456", "name": "Living Room Plug" },        { "id": "234567", "name": "Bedroom Lamp" }      ]    }    ```- **Get a Specific Device-to-Event Mapping**  - `GET /api/device-mappings/:eventType` (e.g., `/api/device-mappings/like`)  - Response:    ```json    {      "eventType": "like",      "mapping": {        "deviceId": "123456",        "enabled": true,        "minCount": 5,        "duration": 3000      },      "exists": true    }    ```- **Update a Device-to-Event Mapping**  - `POST /api/device-mappings/:eventType` (e.g., `/api/device-mappings/like`)  - Body:    ```json    {      "deviceId": "123456",      // Device ID to activate (required if enabled=true)      "enabled": true,           // Whether this mapping is active (default: true)      "minCount": 5,             // Activate after every X events (default: 1)      "duration": 3000           // Optional: Also update duration for this device    }    ```  - Response:    ```json    {      "success": true,      "eventType": "like",      "mapping": {        "deviceId": "123456",        "enabled": true,        "minCount": 5,        "updatedAt": "2023-01-01T12:00:00.000Z"      },      "message": "Successfully updated mapping for like events"    }    ```### **Settings Management**- **Get Global Activation Duration**  - `GET /api/settings/activation-duration`  - Response: `{ key, value }`- **Get Per-Device Activation Duration**  - `GET /api/settings/activation-duration/:deviceId`  - Response: `{ key, value }`- **Set Global Activation Duration**  - `POST /api/settings/activation-duration`  - Body: `{ "value": 2000 }` (ms)- **Set Per-Device Activation Duration**  - `POST /api/settings/activation-duration/:deviceId`  - Body: `{ "value": 3000 }` (ms)

---

## 3. WebSocket Integration

### **Connect to WebSocket**
Use `socket.io-client` to connect to the backend. The connection approach is different depending on your environment:

#### Development Environment
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:8800');
```

#### Production Environment (Vercel, etc.)
In production, always use the same host as your API requests. This is especially important for Vercel deployments:

```js
import { io } from 'socket.io-client';

// Get the current URL to determine the WebSocket host
const getWebSocketUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the same host (for Vercel, Netlify, etc.)
    return undefined; // Socket.IO will use the current host automatically
  } else {
    // In development, use localhost with the specific port
    return 'http://localhost:8800';
  }
};

const socket = io(getWebSocketUrl());

// Listen for connection confirmation
socket.on('connection-acknowledged', (data) => {
  console.log('Connected to WebSocket server', data.socketId);
  
  // Let the server know the client is ready to receive events
  socket.emit('client-ready', { clientInfo: 'some-optional-info' });
});
```

### **WebSocket Events Reference**

The server emits the following events to the frontend:

#### TikTok Events

1. **`tiktok-event`**: Individual TikTok events (likes, comments, gifts, etc.)
   ```js
   socket.on('tiktok-event', (event) => {
     const { type, data, currentCounts, timestamp } = event;
     
     // type can be: like, chat, gift, follow, etc.
     // data contains the raw TikTok event data
     // currentCounts contains the running totals of all events
     // timestamp is when the event was processed
   });
   ```

2. **`tiktok-connection-status`**: Connection status updates
   ```js
   socket.on('tiktok-connection-status', (status) => {
     const { connected, username, isLive, message, error, errorCode } = status;
     
     // Update UI to show current connection status
     if (connected) {
       showConnectedState(username, isLive);
     } else {
       showDisconnectedState(message, error);
     }
   });
   ```

3. **`room-info-update`**: Stream and broadcaster information updates
   ```js
   socket.on('room-info-update', (roomInfo) => {
     const {
       roomId,
       title,                // Stream title
       status,               // 2 means live
       userCount,            // Current viewer count
       totalUserCount,
       likeCount,            // Total likes
       hostInfo              // Information about the streamer
     } = roomInfo;
     
     // Update UI with room information
     updateStreamInfo(roomInfo);
   });
   ```

4. **`event-counts-update`**: Regular updates of event totals
   ```js
   socket.on('event-counts-update', (data) => {
     const { counts, timestamp } = data;
     
     // Update counters in UI
     updateCounters(counts.likes, counts.comments, counts.gifts, counts.follows);
   });
   ```

#### Tuya Device Events

5. **`tuya-activation`**: When a device is triggered by a TikTok event
   ```js
   socket.on('tuya-activation', (data) => {
     const {
       deviceId,             // ID of the activated device
       duration,             // How long the device will be on (ms)
       success,              // Whether activation succeeded
       triggeredBy,          // What triggered the activation
       timestamp             // When the activation occurred
     } = data;
     
     // Show device activation animation
     if (success) {
       showDeviceAnimation(deviceId, duration, triggeredBy.type);
     }
   });
   ```

6. **`tuya-device-status`**: Device status updates
   ```js
   socket.on('tuya-device-status', (data) => {
     const { deviceId, status } = data;
     updateDeviceStatus(deviceId, status);
   });
   ```

---

## 4. Device-to-Event Mapping Guide

The device-to-event mapping system allows you to configure which devices respond to which TikTok events. For example, you can:

- Have light A turn on when someone likes the stream
- Have light B turn on when someone comments
- Have light C turn on when you receive gifts
- Have light D turn on when someone follows you

### Vue.js Example for Managing Mappings

```vue
<template>
  <div class="device-mapping-panel">
    <h2>Event-to-Device Mappings</h2>
    
    <!-- Mapping cards for each event type -->
    <div v-for="eventType in supportedEvents" :key="eventType" class="mapping-card">
      <h3>{{ formatEventType(eventType) }} Events</h3>
      
      <div class="form-group">
        <label>Enabled</label>
        <toggle-switch v-model="mappings[eventType].enabled" />
      </div>
      
      <div class="form-group" v-if="mappings[eventType].enabled">
        <label>Device</label>
        <select v-model="mappings[eventType].deviceId">
          <option value="">-- Select Device --</option>
          <option v-for="device in devices" :key="device.id" :value="device.id">
            {{ device.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group" v-if="mappings[eventType].enabled">
        <label>Activate after every</label>
        <div class="input-group">
          <input 
            type="number" 
            v-model.number="mappings[eventType].minCount" 
            min="1" 
            max="100"
          />
          <span>{{ eventType }}{{ mappings[eventType].minCount > 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div class="form-group" v-if="mappings[eventType].enabled">
        <label>Activation Duration (ms)</label>
        <input 
          type="number" 
          v-model.number="mappings[eventType].duration" 
          min="500" 
          step="500"
        />
      </div>
      
      <button 
        @click="saveMapping(eventType)" 
        :disabled="!canSaveMapping(eventType)"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      supportedEvents: ['like', 'chat', 'gift', 'follow'],
      devices: [],
      mappings: {
        like: { enabled: false, deviceId: '', minCount: 1, duration: 3000 },
        chat: { enabled: false, deviceId: '', minCount: 1, duration: 3000 },
        gift: { enabled: false, deviceId: '', minCount: 1, duration: 3000 },
        follow: { enabled: false, deviceId: '', minCount: 1, duration: 3000 }
      }
    };
  },
  
  async mounted() {
    await this.loadDevices();
    await this.loadMappings();
  },
  
  methods: {
    formatEventType(type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    
    async loadDevices() {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        this.devices = data.devices;
      } catch (error) {
        console.error('Failed to load devices:', error);
      }
    },
    
    async loadMappings() {
      try {
        const response = await fetch('/api/device-mappings');
        const data = await response.json();
        
        // Initialize mappings from server data
        for (const eventType of this.supportedEvents) {
          if (data.mappings[eventType]) {
            // Keep the duration if it exists
            const duration = this.mappings[eventType].duration;
            this.mappings[eventType] = { 
              ...data.mappings[eventType],
              duration: data.mappings[eventType].duration || duration
            };
          }
        }
        
        // Load durations for enabled mappings
        for (const eventType of this.supportedEvents) {
          if (this.mappings[eventType].enabled && this.mappings[eventType].deviceId) {
            await this.loadDuration(eventType);
          }
        }
      } catch (error) {
        console.error('Failed to load mappings:', error);
      }
    },
    
    async loadDuration(eventType) {
      const deviceId = this.mappings[eventType].deviceId;
      if (!deviceId) return;
      
      try {
        const response = await fetch(`/api/settings/activation-duration/${deviceId}`);
        const data = await response.json();
        if (data.value) {
          this.mappings[eventType].duration = parseInt(data.value);
        }
      } catch (error) {
        console.error(`Failed to load duration for ${eventType}:`, error);
      }
    },
    
    canSaveMapping(eventType) {
      const mapping = this.mappings[eventType];
      return !mapping.enabled || (mapping.enabled && mapping.deviceId);
    },
    
    async saveMapping(eventType) {
      const mapping = this.mappings[eventType];
      
      try {
        const response = await fetch(`/api/device-mappings/${eventType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: mapping.deviceId,
            enabled: mapping.enabled,
            minCount: mapping.minCount,
            duration: mapping.duration
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`Mapping for ${this.formatEventType(eventType)} events updated successfully!`);
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error(`Failed to save mapping for ${eventType}:`, error);
        alert('Failed to save mapping. See console for details.');
      }
    }
  }
};
</script>
```

---

## 5. Error Handling

The API uses standardized error responses across all endpoints:

```js
{
  success: false,
  message: "Human-readable error message",
  error: "ERROR_CODE" // Machine-readable error code for programmatic handling
}
```

### Common Error Codes

- `MISSING_USERNAME`: Username parameter is required but missing- `USER_NOT_LIVE`: Attempted to connect to a user who is not currently live streaming- `CONNECTION_ERROR`: Error connecting to TikTok (see message for details)- `DISCONNECT_ERROR`: Error disconnecting from TikTok- `ROOM_INFO_ERROR`: Error fetching room information- `SETTINGS_ERROR`: Error managing settings- `MISSING_VALUE`: Required value is missing in request- `MAPPINGS_ERROR`: Error retrieving device mappings- `MAPPING_UPDATE_ERROR`: Error updating device mapping- `MISSING_EVENT_TYPE`: Event type parameter is required but missing- `MISSING_DEVICE_ID`: Device ID is required when mapping is enabled- `INVALID_EVENT_TYPE`: The provided event type is not supported
- `MISSING_EVENT_TYPE`: Event type parameter is required but missing
- `MISSING_DEVICE_ID`: Device ID is required when mapping is enabled
- `INVALID_EVENT_TYPE`: The provided event type is not supported

### Handling Non-Live Connections

There are three ways to connect to users who are not currently live streaming:

1. **Frontend option**: Pass `forceConnect: true` in the connect request:
   ```js
   connectToTikTok('username', true);
   ```

2. **Server setting**: Use the `allow-offline-connect` setting:
   ```js
   // Enable system-wide
   await fetch('/api/settings/allow-offline-connect', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ value: true })
   });
   
   // Then connect normally
   connectToTikTok('username');
   ```

3. **Handle error and retry**: If connection fails with `USER_NOT_LIVE`, you can prompt the user and then retry with `forceConnect: true`:
   ```js
   const result = await connectToTikTok(username);
   if (!result.success && result.error === 'USER_NOT_LIVE') {
     // Show confirmation dialog
     if (confirm('User is not live. Connect anyway?')) {
       await connectToTikTok(username, true);
     }
   }
   ```

---

## 6. Typical Frontend Flow

1. **User enters TikTok username and clicks Connect**
   - POST to `/api/tiktok/connect` with `{ username }`
   - If connection fails with `USER_NOT_LIVE`, you can offer options to:
     - Wait until user goes live
     - Connect anyway (by calling with `forceConnect: true`)
     - Configure default behavior with the allow-offline-connect setting

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

5. **User can configure settings**
   - GET/POST `/api/settings/activation-duration` (global) or `/api/settings/activation-duration/:deviceId` (per-device).
   - GET/POST `/api/settings/allow-offline-connect` to configure default behavior for non-live users.
   - GET/POST `/api/device-mappings/:eventType` to configure which devices respond to which TikTok events.

6. **User can disconnect**
   - POST to `/api/tiktok/disconnect` to stop monitoring.

---

## 7. Security & CORS

- The backend is configured with CORS enabled for all origins. Adjust as needed for production.
- For Vercel deployments, make sure to enable WebSocket support in your project settings.

---

## 8. Notes

- Only one TikTok stream can be monitored at a time.- Device info is always fetched live from Tuya API.- Activation duration can be set per request, per device, or globally.- All real-time events are delivered via WebSocket.- Device ON/OFF endpoints now reflect the actual result from Tuya, not just API call success.- You can query device ON/OFF state at any time using the new endpoint.- WebSocket events include a timestamp to help with synchronization.- The server automatically sends periodic updates of event counts (every 3-5 seconds).- Gift streaks are properly handled, with the `isStreakInProgress` flag to distinguish between ongoing and completed gift streaks.- Connection to non-live users is possible, but disabled by default. This can be enabled via API settings or per-request.- Device-to-event mappings are stored in the database, allowing for flexible configuration of which devices respond to which events.- Each event type (like, chat, gift, follow) can be mapped to a different device with custom activation settings.
- Device-to-event mappings are stored in the database, allowing for flexible configuration of which devices respond to which events.

---

## 9. Deployment Considerations

### Vercel Deployment

When deploying to Vercel:

1. **WebSocket Support**: 
   - Vercel supports WebSockets on all plans, but there are some limitations on the free tier:
     - 100 concurrent connections
     - Timeout of 5 minutes (upgraded plans have longer)

2. **Environment Variables**:
   - Set `NODE_ENV=production` in your Vercel project settings

3. **Frontend Connection**:
   - Use the automatic host detection shown in the WebSocket connection example above
   - Do not hardcode any localhost URLs in production code

4. **CORS Settings**:
   - Update the CORS origin in the server code to match your frontend domain

5. **Connection Timeouts**:
   - Keep in mind that Vercel has timeouts on its serverless functions
   - Your WebSocket connections should implement reconnection logic

---

**For any questions or issues, please refer to the backend team or the main project documentation.** 