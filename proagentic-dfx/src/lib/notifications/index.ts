/**
 * Notification System using Sonner
 *
 * Provides a centralized API for displaying toast notifications
 * throughout the application.
 *
 * @module notifications
 */

import { toast } from 'sonner';

/**
 * Notification utility object with typed methods for different notification types
 */
export const notify = {
  /**
   * Display a success notification
   * @param message - Main message to display
   * @param description - Optional detailed description
   */
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  /**
   * Display an error notification
   * @param message - Main message to display
   * @param description - Optional detailed description
   */
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  /**
   * Display a warning notification
   * @param message - Main message to display
   * @param description - Optional detailed description
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },

  /**
   * Display an info notification
   * @param message - Main message to display
   * @param description - Optional detailed description
   */
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  /**
   * Display a loading notification
   * @param message - Loading message to display
   * @returns Toast ID that can be used to dismiss the notification later
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Dismiss a specific notification or all notifications
   * @param toastId - Optional ID of the toast to dismiss. If not provided, dismisses all toasts
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  /**
   * Display a notification that tracks a promise's lifecycle
   * @param promise - Promise to track
   * @param messages - Messages for loading, success, and error states
   * @returns Promise that resolves with the original promise's result
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

/**
 * Re-export the toast function for advanced use cases
 */
export { toast } from 'sonner';
