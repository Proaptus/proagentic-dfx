/**
 * useAnnounce Hook
 * REQ-277: Screen reader support with ARIA labels
 *
 * Provides a way to announce messages to screen readers using ARIA live regions.
 * This is critical for communicating dynamic changes to users who rely on assistive technology.
 */

import { useCallback } from 'react';

export type AnnounceFunction = (message: string, priority?: 'polite' | 'assertive') => void;

export function useAnnounce(): AnnounceFunction {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return announce;
}
