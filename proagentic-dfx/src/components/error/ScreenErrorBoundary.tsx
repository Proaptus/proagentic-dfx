'use client';

/**
 * ScreenErrorBoundary Component - Screen-Specific Error Handling
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 *
 * Features:
 * - Specialized error boundary for screen components
 * - Screen name logging for debugging
 * - Navigation to home screen on error
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Dark mode support
 * - Professional error display with recovery options
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { useAppStore } from '@/lib/stores/app-store';

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
  onError?: (error: Error, errorInfo: ErrorInfo, screenName: string) => void;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ScreenErrorBoundary extends Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ScreenErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with screen context
    console.error(
      `ScreenErrorBoundary caught an error in ${this.props.screenName}:`,
      error,
      errorInfo
    );

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo, this.props.screenName);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    // Navigate to home screen
    useAppStore.getState().setScreen('requirements');
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[500px] p-8 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <div className="text-red-600 dark:text-red-400 mb-4" aria-hidden="true">
            <svg
              className="w-20 h-20"
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

          {/* Error Title with Screen Context */}
          <h2 className="text-2xl font-semibold text-red-800 dark:text-red-200 mb-2">
            {this.props.screenName} Error
          </h2>

          {/* Error Message */}
          <p className="text-red-600 dark:text-red-400 mb-6 text-center max-w-md">
            {this.state.error?.message ||
              `An error occurred while loading the ${this.props.screenName} screen.`}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              aria-label="Try loading the screen again"
            >
              Try Again
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
              aria-label="Go to home screen"
            >
              Go to Home
            </button>
          </div>

          {/* Technical Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 max-w-2xl w-full">
              <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-900 dark:text-red-100 overflow-auto max-h-64">
                <strong>Screen:</strong> {this.props.screenName}
                {'\n\n'}
                <strong>Error:</strong> {this.state.error.message}
                {'\n\n'}
                <strong>Stack Trace:</strong>
                {'\n'}
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

export default ScreenErrorBoundary;
