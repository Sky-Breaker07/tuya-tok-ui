# TikTok–Tuya Smart Switch Integration Frontend

## Project Overview
A Vue 3 frontend for connecting TikTok livestream events to Tuya smart switches, enabling real-time device control and visualization of TikTok engagement.

---

## Quickstart

1. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env` file in the project root with:
     ```env
     VITE_API_BASE_URL=http://localhost:8800
     # VITE_WS_URL=ws://localhost:8800 (optional)
     ```
3. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```
4. **Build for production:**
   ```sh
   pnpm build
   # or
   npm run build
   ```

---

## Tech Stack
- **Vue 3** (Composition API)
- **Pinia** (state management)
- **Vue Router** (routing)
- **TailwindCSS** (utility-first styling, dark/light mode)
- **Axios** (API requests)
- **WebSocket (socket.io-client)** (real-time events)
- **Vue Toastification** (toasts/notifications)
- **Icon Library** (e.g., Iconify or Heroicons)

---

## Folder Structure
```
src/
  assets/         # Images, icons, styles
  components/     # Reusable UI components (Header, DeviceCard, etc.)
  router/         # Vue Router setup
  stores/         # Pinia stores (theme, user, devices, etc.)
  utils/          # API and WebSocket helpers
  views/          # Page-level components (HomePage, Dashboard)
apiConfig.js      # Centralized Axios instance
main.js           # App entry point
App.vue           # Root component
```
Other files:
- `.env` — Environment variables (e.g., `VITE_API_BASE_URL`)
- `docs/Frontend_PRD.md` — Product requirements
- `docs/Frontend-Developer-Guide.md` — API/backend integration guide

---

## Key API Endpoints
| Endpoint                                 | Method | Description                                 |
|------------------------------------------|--------|---------------------------------------------|
| `/api/tiktok/connect`                    | POST   | Connect to TikTok live (body: `{ username }`)|
| `/api/tiktok/disconnect`                 | POST   | Disconnect from TikTok live                 |
| `/api/tiktok/status`                     | GET    | Get TikTok connection status                |
| `/api/devices`                           | GET    | List all Tuya devices                       |
| `/api/devices/:deviceId/on`              | POST   | Switch device ON (optionally with duration) |
| `/api/devices/:deviceId/off`             | POST   | Switch device OFF                          |
| `/api/settings/activation-duration`      | GET/POST| Get/set global activation duration         |
| `/api/settings/activation-duration/:id`  | GET/POST| Get/set per-device activation duration     |

---

## Main UI Components & Responsibilities
| Component         | Responsibility                                                                 |
|-------------------|-------------------------------------------------------------------------------|
| `Header.vue`      | App logo, theme switch, connection status, disconnect button                  |
| `ThemeSwitch.vue` | Toggle between dark and light mode                                            |
| `DeviceCard.vue`  | Display Tuya device info, ON/OFF/Test controls, activation animation          |
| `StatsPanel.vue`  | Show real-time TikTok stats (likes, comments, gifts)                          |
| `SettingsPanel.vue`| Configure global/per-device activation durations                              |
| `EventFeed.vue`   | Real-time feed of TikTok and device events, filterable by event type          |
| `HomePage.vue`    | Landing page for TikTok connect                                               |
| `Dashboard.vue`   | Main dashboard (stats, devices, settings, event feed)                         |

---

## Design & UX Principles
- **Responsiveness:** Mobile, tablet, and desktop support using Tailwind's responsive utilities.
- **Accessibility:** Semantic HTML, ARIA attributes, keyboard navigation, and sufficient color contrast.
- **Feedback:** Use toasts for all async actions, errors, and successes.
- **Consistency:** Consistent spacing, colors, typography, and button styles.
- **Animations:** Animate device cards on activation, counters for stats, and transitions for modals.
- **Color/Theme:**
  - Light and dark mode supported via Tailwind's `dark:` variant.
  - Theme is user-toggleable and persisted in localStorage.
  - Color palette should ensure good contrast and visual clarity in both modes.
- **User Guidance:**
  - Tooltips/help for all settings and controls.
  - Modals or confirmations for critical actions (e.g., disconnect, change settings).

---

## Key Tasks & Progress

### **Setup & Foundation**
- [x] Vue 3 project initialized
- [x] Pinia, Vue Router, TailwindCSS, Axios installed
- [x] Centralized Axios config (`apiConfig.js`)
- [x] Install and configure Vue Toastification
- [x] Install and configure socket.io-client
- [x] Install icon library
- [x] Set up Tailwind dark mode
- [x] Create theme store and toggle

### **Routing & Layout**
- [x] Router initialized
- [x] HomePage.vue (Home: connect, stats, event feed)
- [x] SettingsPage.vue (Settings: device list, manual controls, durations)
- [x] Router configuration (Home, Settings)
- [x] App.vue (root, router-view)
- [x] Header component with theme switch, connection status, and navigation

### **State Management (Pinia Stores)**
- [x] Example store (`counter.js`)
- [x] theme.js (dark/light mode)
- [x] user.js (TikTok connection)
- [x] devices.js (Tuya devices)
- [x] settings.js (activation durations)
- [x] events.js (real-time events)
- [x] ws.js (WebSocket state)

### **API & WebSocket Integration**
- [x] Centralized API client
- [ ] Utility functions for all endpoints
- [ ] WebSocket composable/store
- [ ] Error handling with toasts

### **UI Components**
- [x] Header.vue (with navigation)
- [x] ThemeSwitch.vue
- [x] DeviceCard.vue
- [x] EventFeed.vue
- [x] SettingsPanel.vue
- [x] StatsPanel.vue

### **Features**
- [ ] Connect/disconnect TikTok
- [ ] List and control Tuya devices
- [ ] Configure activation durations
- [ ] Real-time event feed
- [ ] Responsive, accessible UI
- [ ] Error and status notifications

---

## Known Issues, TODOs, and Future Ideas
- [ ] Add unit and integration tests for stores and components
- [ ] Add 404/NotFound page for unknown routes
- [ ] Add loading spinners and skeletons for async data
- [ ] Add user onboarding/help popovers
- [ ] Add support for more device types (future)
- [ ] Add analytics or usage tracking (future)
- [ ] Improve error boundary handling
- [ ] Add i18n (internationalization) support

---

## Contributing Guidelines
- **Code Style:**
  - Use consistent indentation and naming conventions (camelCase for JS, kebab-case for components)
  - Use Composition API for new components
  - Use TailwindCSS for all styling
- **Commits:**
  - Write clear, descriptive commit messages
- **Pull Requests:**
  - Reference related issues or tasks
  - Request review from at least one other contributor
- **Documentation:**
  - Update this file and relevant docs as features are added or changed

---

## Environment Variables
- `VITE_API_BASE_URL` — Backend API base URL (required)
- `VITE_WS_URL` — WebSocket URL (optional, if different from API)

---

## References
- [docs/Frontend_PRD.md](Frontend_PRD.md)
- [docs/Frontend-Developer-Guide.md](Frontend-Developer-Guide.md)

---

**This file is a living document. Update as the project evolves!**

### Changelog
- [2024-06-09] Refactored to two-page structure: Home (connection, stats, event feed) and Settings (device list, manual controls, durations). Updated router and Header navigation. Moved device list and settings to SettingsPage.vue.
- [2024-06-09] Added Header.vue (with theme switch, connection status, disconnect) and ThemeSwitch.vue. Integrated Header into HomePage.vue. All dashboard features are now on the homepage.
- [2024-06-09] Added devices Pinia store and DeviceCard.vue. HomePage now fetches and displays device list with ON/OFF/Test controls and feedback.
- [2024-06-09] Added real-time event feed: events and ws Pinia stores, EventFeed.vue, and WebSocket integration. HomePage now shows live TikTok and device events.
- [2024-06-09] Added settings Pinia store and SettingsPanel.vue for global and per-device activation durations. Integrated into HomePage.vue.
- [2024-06-09] Added StatsPanel.vue for real-time TikTok stats and integrated into HomePage.vue above the event feed.
- [2024-06-09] Added loading skeletons for device list, settings, stats, and event feed for a polished loading experience in Home and Settings pages.
- [2024-06-09] Added confirmation modals for disconnect and settings changes. Added error fallback UI and retry buttons for device list and WebSocket errors.
- [2024-06-09] Added device activation animation and a friendly 404/NotFound page for unknown routes.
- [2024-06-09] Added onboarding/help popovers for first-time users on connect, theme switch, and settings panel. 