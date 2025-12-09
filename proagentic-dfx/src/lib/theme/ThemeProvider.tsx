'use client';

/**
 * ThemeProvider Component - Dark Mode Support
 * Provides theme context and manages dark/light/system theme switching
 *
 * Features:
 * - Light, dark, and system theme modes
 * - Persists theme preference to localStorage
 * - Automatically syncs with system theme when in system mode
 * - Applies theme class to document root
 * - Provides theme context to all child components
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setTheme(saved);
    }
  }, []);

  // Handle theme changes and system preference sync
  useEffect(() => {
    if (!mounted) return;

    // Save theme to localStorage
    localStorage.setItem('theme', theme);

    // Get system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Resolve the actual theme to apply
    const resolved = theme === 'system'
      ? (mediaQuery.matches ? 'dark' : 'light')
      : theme;

    setResolvedTheme(resolved);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Update data attribute for potential CSS selectors
    root.setAttribute('data-theme', resolved);

    // Listen for system theme changes
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        root.classList.remove('light', 'dark');
        root.classList.add(newResolved);
        root.setAttribute('data-theme', newResolved);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  // Always provide context, even before mount (with default values)
  // This prevents "useTheme must be used within ThemeProvider" errors during SSR
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
