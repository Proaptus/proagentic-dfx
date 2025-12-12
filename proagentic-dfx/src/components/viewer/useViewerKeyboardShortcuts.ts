'use client';

import { useEffect } from 'react';

interface ViewerShortcutsCallbacks {
  onToggleStress: () => void;
  onToggleWireframe: () => void;
  onToggleCrossSection: () => void;
  onToggleAutoRotate: () => void;
  onToggleLiner: () => void;
}

/**
 * ISSUE-020: Custom hook for 3D Viewer keyboard shortcuts
 *
 * Shortcuts:
 * - S: Toggle stress overlay
 * - W: Toggle wireframe view
 * - C: Toggle cross-section
 * - Shift+R: Toggle auto-rotate
 * - Shift+L: Toggle liner visibility
 */
export function useViewerKeyboardShortcuts(callbacks: ViewerShortcutsCallbacks) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          callbacks.onToggleStress();
          break;
        case 'w':
          e.preventDefault();
          callbacks.onToggleWireframe();
          break;
        case 'c':
          e.preventDefault();
          callbacks.onToggleCrossSection();
          break;
        case 'r':
          // Don't override camera 'r' key - only trigger if shift is held
          if (e.shiftKey) {
            e.preventDefault();
            callbacks.onToggleAutoRotate();
          }
          break;
        case 'l':
          // Don't override camera 'l' key - only trigger if shift is held
          if (e.shiftKey) {
            e.preventDefault();
            callbacks.onToggleLiner();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
