'use client';

/**
 * ErrorBoundary Component - Enterprise Grade Error Handling
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 *
 * Features:
 * - React Error Boundary implementation
 * - Custom fallback UI support
 * - Error logging callback
 * - Reset functionality
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Dark mode support
 * - Professional error display with helpful messaging
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with accessibility and dark mode support
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <div className="text-red-600 dark:text-red-400 mb-4" aria-hidden="true">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Something went wrong
          </h2>

          {/* Error Message */}
          <p className="text-red-600 dark:text-red-400 mb-6 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Reset Button */}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            aria-label="Reset error and try again"
          >
            Try Again
          </button>

          {/* Technical Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 max-w-2xl w-full">
              <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-900 dark:text-red-100 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
