# Product Requirements Document (PRD)

## Product: TikTok-Tuya Smart Switch Integration Frontend

---

### 1. Product Vision

Empower content creators to connect their TikTok livestreams with real-world smart devices. The frontend should provide a seamless, real-time dashboard for users to:
- Connect their TikTok account and monitor live events.
- See and control Tuya smart switches in real time.
- Visualize TikTok engagement (likes, comments, etc.) as physical actions (e.g., lights, fans).
- Configure device activation durations and settings.
- Enjoy a modern, responsive, and intuitive user experience.

---

### 2. Target Users
- TikTok creators and streamers.
- Home automation enthusiasts.
- Event hosts and interactive streamers.

---

### 3. User Stories

#### **As a TikTok streamer:**
- I want to enter my TikTok username and connect, so my live events can trigger smart devices.
- I want to see a live dashboard of my TikTok engagement (likes, comments, etc.).
- I want to see a list of my available Tuya smart switches.
- I want to manually test (turn on/off) any smart switch from the dashboard.
- I want to set how long each device stays on when triggered (per device or globally).
- I want to disconnect from TikTok at any time.
- I want to see real-time feedback when my devices are triggered by TikTok events.
- I want to be notified if the backend disconnects or errors occur.

---

### 4. UX Flow & Wireframe Suggestions

#### **A. Landing/Connect Page**
- Input: TikTok username (no @)
- Button: Connect
- Status: Show connection state ("Connected as ...", "Disconnected")

#### **B. Main Dashboard (after connect)**
- **Live TikTok Stats Panel**
  - Real-time display of likes, comments, gifts, etc.
  - Animated counters or charts for engagement.
- **Device List Panel**
  - List all Tuya devices (name, status, last triggered time)
  - Button for each: ON, OFF, Test
  - Show which device is currently being triggered by TikTok events (e.g., highlight or animation)
- **Settings Panel**
  - Set global activation duration (ms)
  - Set per-device activation duration (ms)
- **Event Log/Feed**
  - Real-time feed of TikTok events and device activations ("User123 liked! Living Room Light ON for 3s")
- **Disconnect Button**
  - Cleanly disconnects from TikTok and disables event listening

#### **C. Error/Status Notifications**
- Show banners or toasts for errors (e.g., connection lost, device error)
- Show success notifications for actions (e.g., "Device ON for 3s")

---

### 5. Feature List & Requirements

#### **A. TikTok Integration**
- Connect/disconnect to TikTok live via username
- Show current connection status
- Display real-time TikTok events (likes, comments, etc.)

#### **B. Device Management**
- List all available Tuya smart switches
- Manual ON/OFF/test controls for each device
- Show device activation state in real time

#### **C. Settings**
- Set global activation duration (ms)
- Set per-device activation duration (ms)
- Show current settings for each device

#### **D. Real-Time Feedback**
- WebSocket connection to backend
- Live updates for TikTok events and device activations
- Event log/feed for user transparency

#### **E. Error Handling & UX**
- Handle API/WebSocket errors gracefully
- Show clear, actionable error messages
- Indicate when backend is disconnected or unavailable

#### **F. Responsive Design**
- Mobile, tablet, and desktop support
- Touch-friendly controls

---

### 6. API & WebSocket Usage

#### **A. REST API**
- `/api/tiktok/connect` (POST) — Connect to TikTok live
- `/api/tiktok/disconnect` (POST) — Disconnect
- `/api/tiktok/status` (GET) — Get connection status
- `/api/devices` (GET) — List devices
- `/api/devices/:deviceId/on` (POST) — Switch ON (optionally with duration)
- `/api/devices/:deviceId/off` (POST) — Switch OFF
- `/api/settings/activation-duration` (GET/POST) — Global duration
- `/api/settings/activation-duration/:deviceId` (GET/POST) — Per-device duration

#### **B. WebSocket Events**
- `tiktok-event` — All TikTok events (payload: `{ type, data }`)
- `tuya-activation` — Device activations (payload: `{ deviceId, duration, triggeredBy }`)

---

### 7. Error Handling & Edge Cases
- If TikTok connection fails, show error and allow retry.
- If device activation fails, show error and allow manual retry.
- If WebSocket disconnects, show "Disconnected" and auto-reconnect if possible.
- Validate all user inputs (username, durations, etc.).
- Only allow one TikTok connection at a time (show warning if already connected).
- Show loading states for all async actions.

---

### 8. Creative/UX Suggestions
- Use color and animation to make device activations visually engaging (e.g., flash device card when ON).
- Use avatars or icons for TikTok users/events in the event feed.
- Allow users to filter the event feed by event type (likes, comments, etc.).
- Provide tooltips/help for all settings and controls.
- Use modals or confirmations for critical actions (e.g., disconnect, change settings).
- Make the dashboard themeable (light/dark mode).

---

### 9. Success Criteria
- User can connect/disconnect to TikTok and see live events.
- User can see and control all Tuya devices.
- Device activations are reflected in real time, both visually and in the event feed.
- User can configure activation durations and see them applied.
- All errors are handled gracefully and communicated clearly.
- The UI is responsive, modern, and easy to use.

---


**For questions, contact the backend team or refer to the integration guide.** 