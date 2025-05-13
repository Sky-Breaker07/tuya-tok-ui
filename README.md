# TuyaTok

<div align="center">
  <img src="public/logo.svg" alt="TuyaTok Logo" width="200">
  <h3>Smart Home Automation with TikTok Integration</h3>
</div>

## Overview

TuyaTok is a modern web application that bridges the gap between TikTok engagement and Tuya-powered smart home devices. This integration allows for interactive control of your smart home based on TikTok events, creating a unique and engaging experience.

## Features

- 🔌 Control Tuya smart devices from TikTok interactions
- 🏠 Modern dashboard for device management
- 📊 Real-time status updates and monitoring
- ⚡ Configure activation durations per device
- 🔄 Seamless integration between TikTok events and smart home actions
- 🌙 Dark/light mode support

## Tech Stack

- Vue 3 with Composition API
- Vite for fast development and building
- Pinia for state management
- Tailwind CSS for styling
- Socket.IO for real-time communication

## Getting Started

### Prerequisites

- Node.js 16+ and pnpm
- Tuya IoT Platform account
- TikTok Developer account (for API access)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/tuyatok.git
cd tuyatok
```

2. Install dependencies:

```sh
pnpm install
```

3. Set up environment variables:

```sh
cp .env.example .env
```

Edit the `.env` file with your Tuya and TikTok API credentials.

### Development

Start the development server:

```sh
pnpm dev
```

### Building for Production

Compile and minify for production:

```sh
pnpm build
```

## Configuration

TuyaTok can be customized to handle different types of smart devices and TikTok events. See the documentation for advanced configuration options.

## License

[MIT License](LICENSE)

## Acknowledgements

- [Tuya IoT Platform](https://developer.tuya.com/)
- [TikTok for Developers](https://developers.tiktok.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
