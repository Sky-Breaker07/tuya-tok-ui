import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const THEME_KEY = 'theme-preference';

export const useThemeStore = defineStore('theme', () => {
  // Default to system preference if available, else 'light'
  const getDefaultTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  };

  const theme = ref(getDefaultTheme());

  // Apply theme to <html> tag
  const applyTheme = (value) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
  };

  // Watch for changes and persist
  watch(theme, (val) => {
    localStorage.setItem(THEME_KEY, val);
    applyTheme(val);
  }, { immediate: true });

  // Toggle theme
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  // Set theme directly
  function setTheme(val) {
    if (val === 'dark' || val === 'light') {
      theme.value = val;
    }
  }

  return { theme, toggleTheme, setTheme };
}); 