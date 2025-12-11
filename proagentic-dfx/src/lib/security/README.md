---
id: REF-security-utilities
doc_type: reference
title: "Security Utilities"
status: accepted
last_verified_at: 2025-12-11
owner: "@ProAgentic/security-team"
code_refs:
  - path: "src/lib/security/rate-limit.ts"
keywords: ["security", "rate-limit", "api", "protection"]
---

# Security Utilities

This directory contains security-related utilities for the ProAgentic DfX application.

## Rate Limiting

The `rate-limit.ts` module provides in-memory rate limiting for API routes.

### Basic Usage

```typescript
import { apiRateLimiter, getClientIdentifier } from '@/lib/security/rate-limit';

export async function GET(request: Request) {
  const identifier = getClientIdentifier(request);
  const result = apiRateLimiter.check(identifier);

  if (!result.success) {
    return new Response(result.error, {
      status: result.status,
      headers: result.headers,
    });
  }

  // Process request...
  return Response.json({ data: 'success' });
}
```

### Pre-configured Rate Limiters

```typescript
import {
  authRateLimiter,           // 5 requests per 15 minutes
  apiRateLimiter,            // 100 requests per minute
  publicRateLimiter,         // 300 requests per minute
  expensiveOperationLimiter, // 10 requests per hour
} from '@/lib/security/rate-limit';
```

### Custom Rate Limiter

```typescript
import { createRateLimiter } from '@/lib/security/rate-limit';

const customLimiter = createRateLimiter({
  windowMs: 60000,        // 1 minute window
  maxRequests: 50,        // 50 requests per window
  message: 'Custom rate limit message',
  statusCode: 429,
});
```

### Helper Functions

```typescript
import {
  withRateLimit,
  getClientIdentifier,
} from '@/lib/security/rate-limit';

// Simplified middleware-style usage
export async function POST(request: Request) {
  const result = withRateLimit(request, apiRateLimiter);
  if (!result.success) {
    return new Response(result.error, {
      status: result.status,
      headers: result.headers,
    });
  }

  // Process request...
}
```

### Response Headers

Rate limit responses include standard headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds until the rate limit resets (when exceeded)

## Important Notes

### Production Considerations

The current rate limiter uses **in-memory storage**, which:

- ✅ Works great for single-instance deployments
- ✅ Zero external dependencies
- ✅ Fast and simple
- ❌ Resets when the server restarts
- ❌ Doesn't work across multiple server instances

For production with multiple instances, consider:

1. **Redis-based rate limiting** (recommended)
   ```typescript
   // Use a library like rate-limit-redis
   import rateLimit from 'express-rate-limit';
   import RedisStore from 'rate-limit-redis';
   ```

2. **Edge middleware rate limiting**
   - Use your CDN/edge provider's built-in rate limiting
   - Examples: Cloudflare Rate Limiting, AWS WAF, Fastly Rate Limiting

3. **Distributed in-memory cache**
   - Use a distributed cache like Memcached or Redis

## Security Best Practices

1. **Different limits for different endpoints**
   - Auth endpoints: Strictest (prevent brute force)
   - Expensive operations: Moderate (prevent resource exhaustion)
   - Public endpoints: Relaxed (good user experience)

2. **Monitor rate limit hits**
   - Log when users hit rate limits
   - Alert on unusual patterns (potential attacks)

3. **IP-based vs Token-based**
   - IP-based: Good for unauthenticated endpoints
   - Token-based: Better for authenticated users
   - Consider combining both

4. **Graceful degradation**
   - Provide clear error messages
   - Include Retry-After header
   - Consider exponential backoff for retries

## Examples

### Authentication Endpoint

```typescript
import { authRateLimiter } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const result = authRateLimiter.check(identifier);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: result.error,
        retryAfter: result.headers['Retry-After'],
      }),
      {
        status: result.status,
        headers: {
          'Content-Type': 'application/json',
          ...result.headers,
        },
      }
    );
  }

  // Process authentication...
}
```

### Expensive Operation

```typescript
import { expensiveOperationLimiter } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  const result = withRateLimit(request, expensiveOperationLimiter);

  if (!result.success) {
    return new Response(result.error, {
      status: result.status,
      headers: result.headers,
    });
  }

  // Perform expensive operation (e.g., CAD export, stress analysis)
  // ...
}
```

### Token-based Rate Limiting

```typescript
import { createRateLimiter } from '@/lib/security/rate-limit';

const userRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (userId) => `user:${userId}`, // Rate limit by user ID
});

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id'); // From auth middleware
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = userRateLimiter.check(userId);
  if (!result.success) {
    return new Response(result.error, {
      status: result.status,
      headers: result.headers,
    });
  }

  // Process request...
}
```

## Testing

```typescript
import { createRateLimiter } from '@/lib/security/rate-limit';

describe('Rate Limiter', () => {
  it('should allow requests under limit', () => {
    const limiter = createRateLimiter({ maxRequests: 5 });

    for (let i = 0; i < 5; i++) {
      const result = limiter.check('test-user');
      expect(result.success).toBe(true);
    }
  });

  it('should block requests over limit', () => {
    const limiter = createRateLimiter({ maxRequests: 5 });

    for (let i = 0; i < 5; i++) {
      limiter.check('test-user');
    }

    const result = limiter.check('test-user');
    expect(result.success).toBe(false);
    expect(result.status).toBe(429);
  });

  it('should reset after window expires', async () => {
    const limiter = createRateLimiter({
      windowMs: 100,
      maxRequests: 1,
    });

    limiter.check('test-user'); // Use up the limit
    await new Promise((resolve) => setTimeout(resolve, 150));

    const result = limiter.check('test-user');
    expect(result.success).toBe(true); // Should be reset
  });
});
```
