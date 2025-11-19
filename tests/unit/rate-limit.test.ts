import { checkRateLimit, RATE_LIMITS, rateLimitStore } from '../../lib/rate-limit';
import { CircuitBreaker } from '../../lib/timeout';

describe('lib/rate-limit.ts', () => {
  beforeEach(() => {
    // Reset rate limit store before each test
    jest.clearAllMocks();
    // Clear the rate limit store
    rateLimitStore.clear();
  });

  describe('checkRateLimit', () => {
    it('allows requests under the limit', () => {
      const identifier = 'user1';

      // First request should be allowed
      const result1 = checkRateLimit(identifier, RATE_LIMITS.MATERIAL_REQUEST);
      expect(result1.allowed).toBe(true);
      expect(result1.remainingRequests).toBe(4); // 5 total - 1 used = 4 remaining

      // Second request should still be allowed
      const result2 = checkRateLimit(identifier, RATE_LIMITS.MATERIAL_REQUEST);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingRequests).toBe(3); // 5 total - 2 used = 3 remaining
    });

    it('blocks requests over the limit', () => {
      const identifier = 'user2';

      // Use up all requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, RATE_LIMITS.MATERIAL_REQUEST);
        expect(result.allowed).toBe(true);
      }

      // Sixth request should be blocked
      const result = checkRateLimit(identifier, RATE_LIMITS.MATERIAL_REQUEST);
      expect(result.allowed).toBe(false);
      expect(result.remainingRequests).toBe(0);
    });

    it('returns correct reset time', () => {
      const identifier = 'user3';
      const beforeTime = Date.now();

      const result = checkRateLimit(identifier, RATE_LIMITS.MATERIAL_REQUEST);

      expect(result.allowed).toBe(true);
      expect(result.resetTime).toBeGreaterThanOrEqual(beforeTime + RATE_LIMITS.MATERIAL_REQUEST.windowMs);
    });
  });

  describe('RATE_LIMITS constants', () => {
    it('has correct material request limits', () => {
      expect(RATE_LIMITS.MATERIAL_REQUEST).toEqual({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      });
    });

    it('has correct material approve limits', () => {
      expect(RATE_LIMITS.MATERIAL_APPROVE).toEqual({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50,
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      });
    });

    it('has correct general API limits', () => {
      expect(RATE_LIMITS.GENERAL_API).toEqual({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30,
        skipSuccessfulRequests: true,
        skipFailedRequests: false
      });
    });
  });

  describe('withRateLimit HOF', () => {
    it('allows requests under limit', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const rateLimitedHandler = require('../../lib/rate-limit').withRateLimit(
        mockHandler,
        RATE_LIMITS.MATERIAL_REQUEST
      );

      const request = new Request('http://localhost/api/test');
      const result = await rateLimitedHandler(request);

      expect(result.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(request, undefined);
    });

    it('blocks requests over limit', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const rateLimitedHandler = require('../../lib/rate-limit').withRateLimit(
        mockHandler,
        { windowMs: 1000, maxRequests: 1, skipSuccessfulRequests: false, skipFailedRequests: false }
      );

      const request = new Request('http://localhost/api/test');

      // First request should succeed
      const result1 = await rateLimitedHandler(request);
      expect(result1.status).toBe(200);

      // Second request should be rate limited
      const result2 = await rateLimitedHandler(request);
      expect(result2.status).toBe(429);

      // Should include proper headers
      expect(result2.headers.get('Retry-After')).toBeTruthy();
      expect(result2.headers.get('X-RateLimit-Remaining')).toBe('0');
    }, 10000); // Increase timeout

    it('includes rate limit headers on successful requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const rateLimitedHandler = require('../../lib/rate-limit').withRateLimit(
        mockHandler,
        RATE_LIMITS.MATERIAL_REQUEST
      );

      const request = new Request('http://localhost/api/test');
      const result = await rateLimitedHandler(request);

      expect(result.headers.get('X-RateLimit-Remaining')).toBe('4'); // 5 - 1 = 4 remaining
      expect(result.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });
  });

  describe('Circuit Breaker', () => {

    it('starts in closed state', () => {
      const breaker = new CircuitBreaker();
      expect(breaker.getState()).toBe('closed');
    });

    it('opens after failures', async () => {
      const breaker = new CircuitBreaker(2, 1000); // 2 failures, 1 second timeout

      // Two failures should open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      expect(breaker.getState()).toBe('open');
    });

    it('allows requests when closed', async () => {
      const breaker = new CircuitBreaker();

      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });

    it('blocks requests when open', async () => {
      const breaker = new CircuitBreaker(1, 1000);

      // One failure opens the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Subsequent requests should be blocked
      await expect(breaker.execute(() => Promise.resolve('success'))).rejects.toThrow('Circuit breaker is open');
    });

    it('transitions to half-open after timeout', async () => {
      const breaker = new CircuitBreaker(1, 100); // Short timeout for testing

      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should now be in half-open state (allowing one test request)
      expect(breaker.getState()).toBe('half-open');
    });

    it('resets to closed after successful request in half-open state', async () => {
      const breaker = new CircuitBreaker(1, 100);

      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Wait for timeout to enter half-open
      await new Promise(resolve => setTimeout(resolve, 150));

      // Successful request should close the circuit
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });
  });
});
