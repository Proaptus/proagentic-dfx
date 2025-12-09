/**
 * Notifications Component
 *
 * Renders the Sonner Toaster component with application-specific configuration.
 * This component should be included once in the root layout.
 *
 * @module components/ui/Notifications
 */

'use client';

import { Toaster } from 'sonner';

/**
 * Notifications component that renders the toast container
 *
 * Features:
 * - Bottom-right positioning for non-intrusive notifications
 * - Rich colors for better visual distinction between notification types
 * - Close button for manual dismissal
 * - 4-second default duration
 * - Custom font styling to match application theme
 *
 * @returns The Toaster component configured for the application
 */
export function Notifications() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      expand={false}
      toastOptions={{
        className: 'font-sans',
        style: {
          fontFamily: 'var(--font-geist-sans)',
        },
      }}
    />
  );
}
