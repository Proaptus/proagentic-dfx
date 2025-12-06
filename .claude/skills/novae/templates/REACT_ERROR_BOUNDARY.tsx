import { Component, ReactNode, ErrorInfo } from 'react';

/**
 * NOVAE React Error Boundary Template
 *
 * Use this to wrap components that may throw errors, providing
 * graceful degradation and user-friendly error messages.
 *
 * Context7 Reference: React 18 error boundaries best practices
 */

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error tracking service
    // trackError(error, { componentStack: errorInfo.componentStack });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback" role="alert">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error details (dev only)</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="error-reset-button"
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Usage Examples:
 *
 * 1. Basic usage:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * 2. Custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * 3. With error handler:
 * <ErrorBoundary onError={(error, info) => logToService(error, info)}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * Best Practices (Context7):
 * - Wrap route components in error boundaries
 * - Don't catch errors in event handlers (use try/catch)
 * - Provide user-friendly error messages
 * - Log errors to monitoring service in production
 * - Offer a way to recover (reset button, navigation link)
 */

// Utility hook for error handling in components
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    // TODO: Send to error tracking
    throw error; // Re-throw to be caught by ErrorBoundary
  };

  return { handleError };
}
