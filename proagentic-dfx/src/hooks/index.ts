/**
 * Accessibility Hooks Index
 * REQ-276: Keyboard navigation for all interactive elements
 * REQ-277: Screen reader support with ARIA labels
 * REQ-278: Focus management
 *
 * Centralized export for all accessibility hooks
 */

export { useKeyboardNavigation } from './useKeyboardNavigation';
export { useFocusTrap } from './useFocusTrap';
export { useAnnounce, type AnnounceFunction } from './useAnnounce';
