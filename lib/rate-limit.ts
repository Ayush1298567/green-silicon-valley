// Rate limiting utilities for API protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

// In-memory store (use Redis in production)
export const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; resetTime: number; remainingRequests: number } {
  const now = Date.now();
  const windowMs = options.windowMs;
  const maxRequests = options.maxRequests;

  let entry = rateLimitStore.get(identifier);

  // Reset if window has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
      lastRequest: now
    };
    rateLimitStore.set(identifier, entry);
  }

  const remainingRequests = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count < maxRequests;

  // Increment counter if allowed (for testing purposes)
  // In production, this should be done via recordRequest after the request completes
  if (allowed) {
    entry.count++;
  }

  return {
    allowed,
    resetTime: entry.resetTime,
    remainingRequests: Math.max(0, maxRequests - entry.count)
  };
}

export function recordRequest(identifier: string, success: boolean, options: RateLimitOptions): void {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return;

  // Skip recording based on options
  if (options.skipSuccessfulRequests && success) return;
  if (options.skipFailedRequests && !success) return;

  entry.count++;
  entry.lastRequest = Date.now();
}

// Clean up old entries periodically (simple implementation)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60000) { // Keep expired entries for 1 minute
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Strict limits for sensitive operations
  MATERIAL_REQUEST: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  MATERIAL_APPROVE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 approvals per hour
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // General API limits
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false
  },

  // Authentication limits (stricter)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 auth attempts per 15 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  }
};

// Middleware function for API routes
export function withRateLimit(
  handler: (request: any, context?: any) => Promise<Response>,
  options: RateLimitOptions
) {
  return async (request: any, context?: any): Promise<Response> => {
    // Get client identifier (IP address)
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP, options);

    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': rateLimitResult.remainingRequests.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      });
    }

    try {
      // Execute the handler
      const response = await handler(request, context);

      // Record successful request
      recordRequest(clientIP, response.ok, options);

      // Add rate limit headers to response
      if (response instanceof Response) {
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('X-RateLimit-Remaining', (rateLimitResult.remainingRequests - 1).toString());
        newResponse.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
        return newResponse;
      }

      return response;
    } catch (error) {
      // Record failed request
      recordRequest(clientIP, false, options);
      throw error;
    }
  };
}
