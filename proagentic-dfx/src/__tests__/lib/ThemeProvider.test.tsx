/**
 * ThemeProvider Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Provider rendering (3 tests)
 * - Theme switching (4 tests)
 * - System preference detection (3 tests)
 * - localStorage persistence (4 tests)
 * - useTheme hook (3 tests)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';
import { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
let mockMatchMediaMatches = false;
let mockMatchMediaListeners: ((e: MediaQueryListEvent) => void)[] = [];

const createMockMatchMedia = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
    if (event === 'change') {
      mockMatchMediaListeners.push(callback);
    }
  }),
  removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
    if (event === 'change') {
      mockMatchMediaListeners = mockMatchMediaListeners.filter(l => l !== callback);
    }
  }),
  dispatchEvent: vi.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn(() => createMockMatchMedia(mockMatchMediaMatches)),
});

// Helper to trigger media query change
function triggerMediaQueryChange(matches: boolean) {
  mockMatchMediaMatches = matches;
  mockMatchMediaListeners.forEach(listener => {
    listener({ matches } as MediaQueryListEvent);
  });
}

// Test component to consume theme
function ThemeConsumer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')} data-testid="set-light">Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Dark</button>
      <button onClick={() => setTheme('system')} data-testid="set-system">System</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockMatchMediaMatches = false;
    mockMatchMediaListeners = [];
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Provider Rendering', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Child Content</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide theme context', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });

    it('should default to system theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });

  describe('Theme Switching', () => {
    it('should switch to light theme', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-light').click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    it('should switch to dark theme', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    it('should switch to system theme', async () => {
      mockMatchMediaMatches = true;
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(createMockMatchMedia(true));

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-light').click();
      });

      await act(async () => {
        screen.getByTestId('set-system').click();
      });

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('should apply theme class to document', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('System Preference Detection', () => {
    it('should resolve to light when system prefers light', async () => {
      mockMatchMediaMatches = false;
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(createMockMatchMedia(false));

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Wait for mount effect
      await act(async () => {});

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    });

    it('should resolve to dark when system prefers dark', async () => {
      mockMatchMediaMatches = true;
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(createMockMatchMedia(true));

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Wait for mount effect
      await act(async () => {});

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    it('should react to system preference changes', async () => {
      mockMatchMediaMatches = false;
      (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue(createMockMatchMedia(false));

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {});

      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

      // Simulate system theme change
      await act(async () => {
        triggerMediaQueryChange(true);
      });

      // When in system mode, should update
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });
  });

  describe('localStorage Persistence', () => {
    it('should save theme to localStorage', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should load theme from localStorage', async () => {
      localStorageMock.store['theme'] = 'dark';

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {});

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should handle invalid localStorage value', async () => {
      localStorageMock.store['theme'] = 'invalid-theme';

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      // Should fall back to system
      await act(async () => {});

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('should handle missing localStorage value', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {});

      expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      consoleError.mockRestore();
    });

    it('should return theme context', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBeDefined();
      expect(result.current.setTheme).toBeDefined();
      expect(result.current.resolvedTheme).toBeDefined();
    });

    it('should update theme via setTheme', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('Document Attribute Updates', () => {
    it('should set data-theme attribute', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should remove old theme class when switching', async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      await act(async () => {
        screen.getByTestId('set-light').click();
      });

      expect(document.documentElement.classList.contains('light')).toBe(true);

      await act(async () => {
        screen.getByTestId('set-dark').click();
      });

      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
