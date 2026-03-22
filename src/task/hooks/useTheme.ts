import { useEffect } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'taskDashboard.theme'

// Detect system preference for dark mode
function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  return prefersDark ? 'dark' : 'light'
}

// Hook to manage dark/light theme switching with localStorage sync
export function useTheme() {
  const [theme, setTheme] = useLocalStorageState<ThemeMode>(THEME_STORAGE_KEY, getPreferredTheme())

  useEffect(() => {
    // Use a data-attribute so CSS can reliably switch themes.
    document.documentElement.dataset.theme = theme
  }, [theme])

  return { theme, setTheme }
}

