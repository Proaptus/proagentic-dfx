/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for API routes.
 * For production with multiple instances, consider Redis-based rate limiting.
 */

interface RateLimitConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of requests per window
   * @default 100
   */
  maxRequests?: number;

  /**
   * Custom error message
   * @default "Too many requests, please try again later."
   */
  message?: string;

  /**
   * Status code to return when rate limit is exceeded
   * @default 429
   */
  statusCode?: number;

  /**
   * Custom key generator function
   * @default Uses IP address
   */
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limit data
 * WARNING: This resets when the server restarts
 * For production, use Redis or similar persistent store
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
const CLEANUP_INTERVAL = 60000; // 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Create a rate limiter function
 *
 * @param config - Rate limit configuration
 * @returns Rate limit check function
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({
 *   windowMs: 60000, // 1 minute
 *   maxRequests: 10,  // 10 requests per minute
 * });
 *
 * // In API route:
 * const result = limiter.check(request.headers.get('x-forwarded-for') || 'unknown');
 * if (!result.success) {
 *   return new Response(result.error, {
 *     status: result.status,
 *     headers: result.headers,
 *   });
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig = {}) {
  const {
    windowMs = 60000,
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (id) => `ratelimit:${id}`,
  } = config;

  return {
    /**
     * Check if the request should be rate limited
     *
     * @param identifier - Unique identifier (usually IP address)
     * @returns Rate limit check result
     */
    check: (identifier: string) => {
      const now = Date.now();
      const key = keyGenerator(identifier);

      let entry = rateLimitStore.get(key);

      // Create new entry or reset if window expired
      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Increment counter
      entry.count++;

      // Check if limit exceeded
      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        return {
          success: false,
          error: message,
          status: statusCode,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': retryAfter.toString(),
          },
        };
      }

      // Request allowed
      const remaining = maxRequests - entry.count;
      return {
        success: true,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': entry.resetTime.toString(),
        },
      };
    },

    /**
     * Reset rate limit for a specific identifier
     *
     * @param identifier - Unique identifier to reset
     */
    reset: (identifier: string) => {
      const key = keyGenerator(identifier);
      rateLimitStore.delete(key);
    },

    /**
     * Get current rate limit status for an identifier
     *
     * @param identifier - Unique identifier to check
     * @returns Current rate limit status or null if not found
     */
    status: (identifier: string) => {
      const key = keyGenerator(identifier);
      const entry = rateLimitStore.get(key);

      if (!entry) {
        return null;
      }

      const now = Date.now();
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
        return null;
      }

      return {
        count: entry.count,
        remaining: Math.max(0, maxRequests - entry.count),
        resetTime: entry.resetTime,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
      };
    },
  };
}

/**
 * Default rate limiters for common use cases
 */

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/**
 * Standard rate limiter for API endpoints
 * 100 requests per minute
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'API rate limit exceeded. Please slow down your requests.',
});

/**
 * Relaxed rate limiter for public endpoints
 * 300 requests per minute
 */
export const publicRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 300,
  message: 'Too many requests. Please try again shortly.',
});

/**
 * Very strict rate limiter for expensive operations
 * 10 requests per hour
 */
export const expensiveOperationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Rate limit exceeded for this operation. Please try again later.',
});

/**
 * Helper function to get client identifier from request
 * Handles various proxy headers
 *
 * @param request - Request object (Next.js Request or Headers)
 * @returns Client identifier (IP address or 'unknown')
 */
export function getClientIdentifier(request: Request | Headers): string {
  const headers = request instanceof Request ? request.headers : request;

  // Try various proxy headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Middleware helper for Next.js API routes
 *
 * @example
 * ```typescript
 * import { withRateLimit, apiRateLimiter } from '@/lib/security/rate-limit';
 *
 * export async function GET(request: Request) {
 *   const rateLimitResult = withRateLimit(request, apiRateLimiter);
 *   if (!rateLimitResult.success) {
 *     return new Response(rateLimitResult.error, {
 *       status: rateLimitResult.status,
 *       headers: rateLimitResult.headers,
 *     });
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export function withRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>
) {
  const identifier = getClientIdentifier(request);
  return limiter.check(identifier);
}

/**
 * Type exports
 */
export type { RateLimitConfig, RateLimitEntry };
