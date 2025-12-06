import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * NOVAE Express Error Middleware Template
 *
 * Centralized error handling for Express applications.
 * Catches all errors and sends consistent error responses.
 *
 * Context7 Reference: Express 4 error handling best practices
 */

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response format
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
    stack?: string; // Only in development
  };
}

/**
 * Main error handler middleware
 * Must be the LAST middleware in the chain
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for monitoring
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // TODO: Send to error tracking service
  // trackError(err, { url: req.url, method: req.method });

  // Determine status code
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  // Build error response
  const errorResponse: ErrorResponse = {
    error: {
      message: err.message || 'Internal server error',
      code: err instanceof ApiError ? err.code : 'INTERNAL_ERROR',
      details: err instanceof ApiError ? err.details : undefined
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler (404)
 * Place before error handler, after all routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `Route ${req.method} ${req.url} not found`, 'NOT_FOUND'));
}

/**
 * Common error factories
 */
export const ErrorFactories = {
  badRequest: (message: string, details?: unknown) =>
    new ApiError(400, message, 'BAD_REQUEST', details),

  unauthorized: (message = 'Authentication required') =>
    new ApiError(401, message, 'UNAUTHORIZED'),

  forbidden: (message = 'Access denied') =>
    new ApiError(403, message, 'FORBIDDEN'),

  notFound: (resource: string) =>
    new ApiError(404, `${resource} not found`, 'NOT_FOUND'),

  conflict: (message: string) =>
    new ApiError(409, message, 'CONFLICT'),

  validationError: (details: unknown) =>
    new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details),

  tooManyRequests: (message = 'Rate limit exceeded') =>
    new ApiError(429, message, 'RATE_LIMIT_EXCEEDED'),

  internal: (message = 'Internal server error') =>
    new ApiError(500, message, 'INTERNAL_ERROR')
};

/**
 * Usage Example:
 *
 * import express from 'express';
 * import { errorHandler, notFoundHandler, asyncHandler, ErrorFactories } from './error-middleware';
 *
 * const app = express();
 *
 * // Routes
 * app.get('/api/users/:id', asyncHandler(async (req, res) => {
 *   const user = await findUser(req.params.id);
 *   if (!user) throw ErrorFactories.notFound('User');
 *   res.json(user);
 * }));
 *
 * // 404 handler (before error handler)
 * app.use(notFoundHandler);
 *
 * // Error handler (must be last)
 * app.use(errorHandler);
 *
 * Best Practices (Context7):
 * - Use asyncHandler for all async route handlers
 * - Throw ApiError instead of plain Error for API errors
 * - Use error factories for consistent error responses
 * - Place error handler LAST in middleware chain
 * - Log errors to monitoring service in production
 * - Don't expose sensitive information in error messages
 */
