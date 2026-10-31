/**
 * Theme composable — manages light/dark mode with system preference detection.
 */

import { ref, watch, onMounted } from 'vue';
import type { ThemeMode } from '@/types';

const STORAGE_KEY = 'aegis-theme';

const theme = ref<ThemeMode>('dark');

let initialized = false;

function getSystemPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
}

export function useTheme() {
  function initTheme() {
    if (initialized) return;
    initialized = true;

    const stored = getStoredTheme();
    theme.value = stored ?? getSystemPreference();
    applyTheme(theme.value);

    // Listen for system preference changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't explicitly set a preference
        if (!getStoredTheme()) {
          theme.value = e.matches ? 'dark' : 'light';
          applyTheme(theme.value);
        }
      });
    }
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  onMounted(() => {
    initTheme();
  });

  // Watch for changes and apply
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
