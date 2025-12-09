import { useEffect, useCallback } from 'react';
import type { Screen } from '@/lib/types';

interface UseKeyboardShortcutsOptions {
  onToggleHelp?: () => void;
  onClose?: () => void;
  onNavigate?: (screen: Screen) => void;
}

const SCREEN_SHORTCUTS: Record<string, Screen> = {
  '1': 'requirements',
  '2': 'pareto',
  '3': 'viewer',
  '4': 'compare',
  '5': 'analysis',
  '6': 'compliance',
  '7': 'validation',
  '8': 'export',
  '9': 'sentry',
};

/**
 * Hook to handle global keyboard shortcuts for the application.
 *
 * Shortcuts:
 * - '?' or 'Shift+/': Toggle help panel
 * - 'Escape': Close any open panel
 * - '1-9': Navigate to different screens
 *
 * Shortcuts are disabled when user is typing in input/textarea elements.
 */
export function useKeyboardShortcuts({
  onToggleHelp,
  onClose,
  onNavigate,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) {
        return;
      }

      // Help toggle: '?' or 'Shift+/'
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        onToggleHelp?.();
        return;
      }

      // Close panel: Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      // Screen navigation: 1-9
      if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const screen = SCREEN_SHORTCUTS[event.key];
        if (screen && onNavigate) {
          event.preventDefault();
          onNavigate(screen);
        }
      }
    },
    [onToggleHelp, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
