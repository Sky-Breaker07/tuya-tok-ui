import './assets/main.css'
import "vue-toastification/dist/index.css";

import Toast, { POSITION } from "vue-toastification";


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Toast, {
    position: POSITION.TOP, // Position of the toasts
    timeout: 3000, // Default timeout for toasts (in milliseconds)
    closeOnClick: true, // Close toast on click
    pauseOnFocusLoss: true, // Pause toast when window loses focus
    pauseOnHover: true, // Pause toast on hover
    draggable: true, // Make toasts draggable
    draggablePercent: 0.6, // Draggable percentage (0 - 1)
    showCloseButtonOnHover: false, // Show close button on hover
    hideProgressBar: true, // Hide the progress bar
    closeButton: "button", // Close button type ('button' or 'icon')
    icon: true, // Show icon for toasts
    rtl: false, // Enable right-to-left layout
    transition: "Vue-Toastification__fade", // Transition type
    maxToasts: 5, // Maximum number of toasts to display at once
    newestOnTop: true, // Add new toasts on top
  });

app.mount('#app')
