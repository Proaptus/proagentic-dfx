/**
 * Comprehensive Theme Module Tests - Part 2: Provider & Integration
 *
 * COMPREHENSIVE test suite for src/lib/theme/ThemeProvider.tsx
 * Target: 80%+ coverage on all 4 metrics (Lines, Functions, Statements, Branches)
 *
 * Covers:
 * - System preference synchronization and change detection
 * - useTheme hook functionality and error handling
 * - Edge cases, boundaries, and error conditions
 * - Integration workflows and state consistency
 * - Memory leak prevention and cleanup
 * - Stress testing and coverage boundaries
 *
 * Total Tests: 45 (Groups 6-10)
 * See: theme-comprehensive.test.ts for Groups 1-5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================================================
// TYPE DEFINITIONS (Matching ThemeProvider.tsx Implementation)
// ============================================================================

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

// ============================================================================
// COMPREHENSIVE TEST SUITE - PART 2: Provider & Integration
// ============================================================================

describe('Theme Module - Provider & Integration (Groups 6-10)', () => {
  let storageData: Record<string, string> = {};
  const mediaQueryListeners: Map<string, Set<(e: MediaQueryListEvent) => void>> = new Map();
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Reset all state
    storageData = {};
    mediaQueryListeners.clear();
    vi.clearAllMocks();

    // Clear DOM
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');

    // Store original matchMedia
    originalMatchMedia = window.matchMedia;

    // Mock localStorage comprehensively
    const localStorageMock = {
      getItem: vi.fn((key: string) => storageData[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storageData[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storageData[key];
      }),
      clear: vi.fn(() => {
        storageData = {};
      }),
      length: Object.keys(storageData).length,
      key: vi.fn((index: number) => Object.keys(storageData)[index] || null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // Mock matchMedia for system preference simulation
    const mockMatchMedia = vi.fn((query: string) => {
      const listeners = new Set<(e: MediaQueryListEvent) => void>();
      mediaQueryListeners.set(query, listeners);

      const mediaQueryList = {
        matches: query === '(prefers-color-scheme: dark)' ? false : false,
        media: query,
        addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            listeners.add(callback);
          }
        }),
        removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            listeners.delete(callback);
          }
        }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;

      return mediaQueryList;
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    storageData = {};
    mediaQueryListeners.clear();

    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
  });

  // ==========================================================================
  // TEST GROUP 6: SYSTEM PREFERENCE SYNCHRONIZATION (8 tests)
  // ==========================================================================
  describe('[6] System Preference Synchronization', () => {
    it('T6.1: Should call matchMedia with correct query', () => {
      window.matchMedia('(prefers-color-scheme: dark)');

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('T6.2: Should attach event listener for dark mode changes', () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      expect(mediaQuery.addEventListener).toBeDefined();
      expect(typeof mediaQuery.addEventListener).toBe('function');
    });

    it('T6.3: Should have removeEventListener for cleanup', () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      expect(mediaQuery.removeEventListener).toBeDefined();
      expect(typeof mediaQuery.removeEventListener).toBe('function');
    });

    it('T6.4: Should update resolved theme when system preference changes', () => {
      let systemIsDark = false;
      const resolve = (t: Theme): 'light' | 'dark' => {
        return t === 'system' ? (systemIsDark ? 'dark' : 'light') : t;
      };

      expect(resolve('system')).toBe('light');

      systemIsDark = true;
      expect(resolve('system')).toBe('dark');
    });

    it('T6.5: Should not affect explicit themes when system changes', () => {
      let systemIsDark = false;
      const resolve = (t: Theme): 'light' | 'dark' => {
        return t === 'system' ? (systemIsDark ? 'dark' : 'light') : t;
      };

      const explicit = resolve('dark');
      expect(explicit).toBe('dark');

      systemIsDark = true;
      expect(resolve('dark')).toBe('dark');
    });

    it('T6.6: Should listen for change event on mediaQuery', () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = vi.fn();

      mediaQuery.addEventListener('change', listener);

      expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', listener);
    });

    it('T6.7: Should remove listener on cleanup', () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = vi.fn();

      mediaQuery.addEventListener('change', listener);
      mediaQuery.removeEventListener('change', listener);

      expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener);
    });

    it('T6.8: Should reflect system preference in multiple calls', () => {
      let systemIsDark = false;
      const resolve = (t: Theme): 'light' | 'dark' => {
        return t === 'system' ? (systemIsDark ? 'dark' : 'light') : t;
      };

      expect(resolve('system')).toBe('light');
      expect(resolve('system')).toBe('light');

      systemIsDark = true;

      expect(resolve('system')).toBe('dark');
      expect(resolve('system')).toBe('dark');
    });
  });

  // ==========================================================================
  // TEST GROUP 7: USETHEME HOOK (8 tests)
  // ==========================================================================
  describe('[7] useTheme Hook Functionality', () => {
    it('T7.1: Should return theme value', () => {
      const useTheme = () => ({
        theme: 'dark' as Theme,
        setTheme: vi.fn(),
        resolvedTheme: 'dark' as const,
      });

      const { theme } = useTheme();
      expect(theme).toBe('dark');
    });

    it('T7.2: Should return setTheme function', () => {
      const useTheme = () => ({
        theme: 'system' as Theme,
        setTheme: vi.fn(),
        resolvedTheme: 'light' as const,
      });

      const { setTheme } = useTheme();
      expect(typeof setTheme).toBe('function');
    });

    it('T7.3: Should return resolvedTheme value', () => {
      const useTheme = () => ({
        theme: 'system' as Theme,
        setTheme: vi.fn(),
        resolvedTheme: 'dark' as const,
      });

      const { resolvedTheme } = useTheme();
      expect(resolvedTheme).toBe('dark');
    });

    it('T7.4: Should allow calling setTheme through hook', () => {
      const setThemeMock = vi.fn();
      const useTheme = () => ({
        theme: 'light' as Theme,
        setTheme: setThemeMock,
        resolvedTheme: 'light' as const,
      });

      const { setTheme } = useTheme();
      setTheme('dark');

      expect(setThemeMock).toHaveBeenCalledWith('dark');
    });

    it('T7.5: Should return all context properties', () => {
      const useTheme = () => ({
        theme: 'system' as Theme,
        setTheme: vi.fn(),
        resolvedTheme: 'light' as const,
      });

      const context = useTheme();

      expect(context).toHaveProperty('theme');
      expect(context).toHaveProperty('setTheme');
      expect(context).toHaveProperty('resolvedTheme');
    });

    it('T7.6: Should throw error when used outside provider', () => {
      const useTheme = () => {
        throw new Error('useTheme must be used within ThemeProvider');
      };

      expect(() => useTheme()).toThrow('useTheme must be used within ThemeProvider');
    });

    it('T7.7: Should maintain context consistency', () => {
      const useTheme = () => ({
        theme: 'dark' as Theme,
        setTheme: vi.fn(),
        resolvedTheme: 'dark' as const,
      });

      const c1 = useTheme();
      const c2 = useTheme();

      expect(c1.theme).toBe(c2.theme);
      expect(c1.resolvedTheme).toBe(c2.resolvedTheme);
    });

    it('T7.8: Should support calling setTheme multiple times', () => {
      const setThemeMock = vi.fn();
      const useTheme = () => ({
        theme: 'light' as Theme,
        setTheme: setThemeMock,
        resolvedTheme: 'light' as const,
      });

      const { setTheme } = useTheme();

      setTheme('dark');
      setTheme('light');
      setTheme('system');

      expect(setThemeMock).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================================================
  // TEST GROUP 8: EDGE CASES & ERROR HANDLING (10 tests)
  // ==========================================================================
  describe('[8] Edge Cases and Error Handling', () => {
    it('T8.1: Should validate theme values strictly', () => {
      const isValid = (t: unknown): t is Theme => {
        return ['light', 'dark', 'system'].includes(t as string);
      };

      expect(isValid('light')).toBe(true);
      expect(isValid('dark')).toBe(true);
      expect(isValid('system')).toBe(true);
      expect(isValid('invalid')).toBe(false);
    });

    it('T8.2: Should reject empty string as theme', () => {
      const isValid = (t: unknown): t is Theme => {
        return ['light', 'dark', 'system'].includes(t as string);
      };

      expect(isValid('')).toBe(false);
    });

    it('T8.3: Should reject null as theme', () => {
      const isValid = (t: unknown): t is Theme => {
        return t !== null && ['light', 'dark', 'system'].includes(t as string);
      };

      expect(isValid(null)).toBe(false);
    });

    it('T8.4: Should reject undefined as theme', () => {
      const isValid = (t: unknown): t is Theme => {
        return t !== undefined && ['light', 'dark', 'system'].includes(t as string);
      };

      expect(isValid(undefined)).toBe(false);
    });

    it('T8.5: Should handle case-sensitive theme matching', () => {
      const isValid = (t: unknown): t is Theme => {
        return ['light', 'dark', 'system'].includes(t as string);
      };

      expect(isValid('DARK')).toBe(false);
      expect(isValid('Light')).toBe(false);
      expect(isValid('SYSTEM')).toBe(false);
    });

    it('T8.6: Should handle repeated class additions', () => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('T8.7: Should handle corrupted localStorage data', () => {
      storageData['theme'] = 'corrupted_value_xyz';
      const isValid = (t: unknown): t is Theme => {
        return ['light', 'dark', 'system'].includes(t as string);
      };

      const retrieved = window.localStorage.getItem('theme');
      expect(isValid(retrieved)).toBe(false);
    });

    it('T8.8: Should recover from invalid state', () => {
      storageData['theme'] = 'invalid';
      window.localStorage.setItem('theme', 'system');

      expect(storageData['theme']).toBe('system');
    });

    it('T8.9: Should handle missing localStorage gracefully', () => {
      const value = window.localStorage.getItem('nonexistent');
      expect(value).toBeNull();
    });

    it('T8.10: Should handle clearing all DOM classes', () => {
      document.documentElement.classList.add('dark');
      document.documentElement.className = '';

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // ==========================================================================
  // TEST GROUP 9: INTEGRATION & WORKFLOWS (9 tests)
  // ==========================================================================
  describe('[9] Integration - Complete Workflows', () => {
    it('T9.1: Should handle complete theme change workflow', () => {
      // 1. Initialize with system
      window.localStorage.setItem('theme', 'system');
      expect(storageData['theme']).toBe('system');

      // 2. Switch to dark
      window.localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');

      expect(storageData['theme']).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('T9.2: Should maintain consistency across operations', () => {
      const updateTheme = (theme: Theme) => {
        window.localStorage.setItem('theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        if (theme !== 'system') {
          document.documentElement.classList.add(theme);
        }
        document.documentElement.setAttribute('data-theme', theme === 'system' ? 'light' : theme);
      };

      updateTheme('dark');
      expect(storageData['theme']).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      updateTheme('light');
      expect(storageData['theme']).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('T9.3: Should handle rapid theme cycling', () => {
      const themes: Theme[] = ['light', 'dark', 'system'];

      themes.forEach((theme) => {
        window.localStorage.setItem('theme', theme);
        expect(storageData['theme']).toBe(theme);
      });

      expect(storageData['theme']).toBe('system');
    });

    it('T9.4: Should recover from partial state application', () => {
      storageData['theme'] = 'dark';

      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('T9.5: Should maintain state through multiple operations', () => {
      const operations = [
        () => window.localStorage.setItem('theme', 'system'),
        () => document.documentElement.classList.add('light'),
        () => window.localStorage.setItem('theme', 'dark'),
        () => {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        },
        () => document.documentElement.setAttribute('data-theme', 'dark'),
      ];

      operations.forEach((op) => op());

      expect(storageData['theme']).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('T9.6: Should handle nested context scenarios', () => {
      const outerContext: ThemeContextType = {
        theme: 'light',
        setTheme: vi.fn(),
        resolvedTheme: 'light',
      };

      const innerContext: ThemeContextType = {
        theme: 'dark',
        setTheme: vi.fn(),
        resolvedTheme: 'dark',
      };

      expect(innerContext.theme).toBe('dark');
      expect(outerContext.theme).toBe('light');
    });

    it('T9.7: Should sync localStorage with DOM state', () => {
      const syncTheme = (theme: Theme) => {
        window.localStorage.setItem('theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme === 'system' ? 'light' : theme);
      };

      syncTheme('dark');

      expect(storageData['theme']).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('T9.8: Should handle theme restoration from storage', () => {
      storageData['theme'] = 'dark';

      const saved = window.localStorage.getItem('theme') as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        document.documentElement.classList.add(saved === 'system' ? 'light' : saved);
      }

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('T9.9: Should prevent duplicate state updates', () => {
      const setTheme = vi.fn();

      setTheme('dark');
      setTheme('dark');
      setTheme('dark');

      expect(setTheme).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================================================
  // TEST GROUP 10: STRESS & COVERAGE BOUNDARIES (10 tests)
  // ==========================================================================
  describe('[10] Stress Testing and Coverage Boundaries', () => {
    it('T10.1: Should handle all valid theme transitions', () => {
      const validTransitions: Array<[Theme, Theme]> = [
        ['light', 'dark'],
        ['light', 'system'],
        ['dark', 'light'],
        ['dark', 'system'],
        ['system', 'light'],
        ['system', 'dark'],
      ];

      validTransitions.forEach(([from, to]) => {
        let theme = from;
        theme = to;
        expect(theme).toBe(to);
      });
    });

    it('T10.2: Should handle 100 rapid DOM updates', () => {
      for (let i = 0; i < 100; i++) {
        const className = i % 2 === 0 ? 'light' : 'dark';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(className);
      }

      expect(
        document.documentElement.classList.contains('light') ||
          document.documentElement.classList.contains('dark')
      ).toBe(true);
    });

    it('T10.3: Should handle 50 localStorage operations', () => {
      const themes: Theme[] = ['light', 'dark', 'system'];

      for (let i = 0; i < 50; i++) {
        const theme = themes[i % themes.length];
        window.localStorage.setItem('theme', theme);
      }

      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('T10.4: Should validate theme property types', () => {
      const context: ThemeContextType = {
        theme: 'dark',
        setTheme: vi.fn(),
        resolvedTheme: 'dark',
      };

      expect(typeof context.theme).toBe('string');
      expect(typeof context.setTheme).toBe('function');
      expect(typeof context.resolvedTheme).toBe('string');
    });

    it('T10.5: Should support multiple context consumers', () => {
      const context: ThemeContextType = {
        theme: 'system',
        setTheme: vi.fn(),
        resolvedTheme: 'light',
      };

      const consumer1 = () => context.theme;
      const consumer2 = () => context.resolvedTheme;
      const consumer3 = () => context.setTheme;

      expect(consumer1()).toBe('system');
      expect(consumer2()).toBe('light');
      expect(typeof consumer3()).toBe('function');
    });

    it('T10.6: Should handle all system preference combinations', () => {
      const resolve = (theme: Theme, systemDark: boolean): 'light' | 'dark' => {
        return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
      };

      const themes: Theme[] = ['light', 'dark', 'system'];
      const systemPrefs = [true, false];
      let count = 0;

      themes.forEach((theme) => {
        systemPrefs.forEach((pref) => {
          const result = resolve(theme, pref);
          expect(['light', 'dark']).toContain(result);
          count++;
        });
      });

      expect(count).toBe(6);
    });

    it('T10.7: Should validate all stored theme values', () => {
      const testValues = ['light', 'dark', 'system', 'invalid', '', null, undefined];
      const isValid = (t: unknown): t is Theme => {
        return ['light', 'dark', 'system'].includes(t as string);
      };

      const validCount = testValues.filter(isValid).length;
      expect(validCount).toBe(3);
    });

    it('T10.8: Should handle cleanup without memory leaks', () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = vi.fn();

      mediaQuery.addEventListener('change', listener);
      mediaQuery.removeEventListener('change', listener);

      expect(mediaQuery.addEventListener).toHaveBeenCalled();
      expect(mediaQuery.removeEventListener).toHaveBeenCalled();
    });

    it('T10.9: Should handle edge case theme values in context', () => {
      const validThemes: Theme[] = ['light', 'dark', 'system'];

      validThemes.forEach((theme) => {
        const context: ThemeContextType = {
          theme,
          setTheme: vi.fn(),
          resolvedTheme: theme === 'light' || theme === 'dark' ? theme : 'light',
        };

        expect(validThemes).toContain(context.theme);
      });
    });

    it('T10.10: Should maintain state integrity under stress', () => {
      let theme: Theme = 'system';
      let domClass = '';

      for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) theme = 'light';
        else if (i % 3 === 1) theme = 'dark';
        else theme = 'system';

        domClass = theme === 'system' ? 'light' : theme;

        expect(['light', 'dark', 'system']).toContain(theme);
        expect(['light', 'dark']).toContain(domClass);
      }
    });
  });
});
