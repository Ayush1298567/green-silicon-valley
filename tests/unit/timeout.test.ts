import { withTimeout, executeWithTimeout, TimeoutError, CircuitBreaker } from '../../lib/timeout';

describe('lib/timeout.ts', () => {
  describe('withTimeout', () => {
    it('resolves successful operations within timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 100));
      const result = await withTimeout(promise, 500, 'Test operation');

      expect(result).toBe('success');
    });

    it('rejects operations that exceed timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 300));
      const timeoutPromise = withTimeout(promise, 100, 'Test operation');

      await expect(timeoutPromise).rejects.toThrow(TimeoutError);
      await expect(timeoutPromise).rejects.toThrow('Test operation timed out (100ms)');
    });

    it('rejects with custom timeout message', async () => {
      const promise = new Promise(() => {}); // Never resolves
      const timeoutPromise = withTimeout(promise, 50, 'Custom operation timeout');

      await expect(timeoutPromise).rejects.toThrow('Custom operation timeout (50ms)');
    });
  });

  describe('executeWithTimeout', () => {
    it('executes successful operations', async () => {
      const result = await executeWithTimeout(
        () => Promise.resolve('success'),
        1000,
        'Test operation'
      );

      expect(result).toBe('success');
    });

    it('handles timeout errors', async () => {
      await expect(executeWithTimeout(
        () => new Promise(resolve => setTimeout(resolve, 200)),
        100,
        'Slow operation'
      )).rejects.toThrow('Slow operation timed out');
    });

    it('uses default timeout when not specified', async () => {
      const startTime = Date.now();

      await expect(executeWithTimeout(
        () => new Promise(resolve => setTimeout(resolve, 12000)), // 12 seconds
        undefined, // No timeout specified
        'Default timeout test'
      )).rejects.toThrow(TimeoutError);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should timeout at default 10 seconds (10000ms)
      expect(duration).toBeGreaterThanOrEqual(10000);
      expect(duration).toBeLessThan(15000); // Shouldn't take too much longer
    });
  });

  describe('TimeoutError', () => {
    it('includes timeout information', () => {
      const error = new TimeoutError('Operation timed out', 5000);

      expect(error.message).toBe('Operation timed out');
      expect(error.timeoutMs).toBe(5000);
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('CircuitBreaker', () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker(2, 100); // 2 failures, 100ms recovery
    });

    it('starts in closed state', () => {
      expect(breaker.getState()).toBe('closed');
    });

    it('opens after threshold failures', async () => {
      // First failure
      await expect(breaker.execute(() => Promise.reject('error 1'))).rejects.toThrow();

      expect(breaker.getState()).toBe('closed'); // Still closed after 1 failure

      // Second failure should open it
      await expect(breaker.execute(() => Promise.reject('error 2'))).rejects.toThrow();

      expect(breaker.getState()).toBe('open');
    });

    it('blocks requests when open', async () => {
      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Should now block requests
      await expect(breaker.execute(() => Promise.resolve('success'))).rejects.toThrow('Circuit breaker is open');
    });

    it('transitions to half-open after recovery timeout', async () => {
      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      expect(breaker.getState()).toBe('open');

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(breaker.getState()).toBe('half-open');
    });

    it('closes after successful request in half-open state', async () => {
      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Wait for half-open
      await new Promise(resolve => setTimeout(resolve, 150));

      // Successful request should close the circuit
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });

    it('re-opens after failure in half-open state', async () => {
      // Open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      // Wait for half-open
      await new Promise(resolve => setTimeout(resolve, 150));

      // Failed request should re-open the circuit
      await expect(breaker.execute(() => Promise.reject('error'))).rejects.toThrow();

      expect(breaker.getState()).toBe('open');
    });

    it('can be manually reset', () => {
      breaker.reset();
      expect(breaker.getState()).toBe('closed');
    });

    it('handles successful operations', async () => {
      const result = await breaker.execute(() => Promise.resolve('success'));
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
    });
  });
});
