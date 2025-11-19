// Timeout utilities for database operations and API calls

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(`${timeoutMessage} (${timeoutMs}ms)`, timeoutMs));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000,
  operationName: string = 'Database operation'
): Promise<T> {
  try {
    return await withTimeout(
      operation(),
      timeoutMs,
      `${operationName} timed out`
    );
  } catch (error) {
    if (error instanceof TimeoutError) {
      // Log timeout errors for monitoring
      console.error(`[${operationName}] Timeout after ${error.timeoutMs}ms`);
    }
    throw error;
  }
}

// Database-specific timeout wrapper
export async function executeDatabaseQuery<T>(
  queryFn: () => Promise<T>,
  operationName: string = 'Database query',
  timeoutMs: number = 8000 // Database queries should be faster
): Promise<T> {
  return executeWithTimeout(queryFn, timeoutMs, operationName);
}

// API-specific timeout wrapper
export async function executeAPIRequest<T>(
  requestFn: () => Promise<T>,
  endpoint: string,
  timeoutMs: number = 15000 // API calls can take longer
): Promise<T> {
  return executeWithTimeout(requestFn, timeoutMs, `API request to ${endpoint}`);
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  operationName: string = 'Operation'
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof TimeoutError ||
          error.message?.includes('authentication') ||
          error.message?.includes('authorization') ||
          error.message?.includes('validation')) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[${operationName}] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError!;
}

// Circuit breaker pattern for external services
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly name: string = 'CircuitBreaker'
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
        console.log(`[${this.name}] Entering half-open state`);
      } else {
        throw new Error(`[${this.name}] Circuit breaker is open`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      console.error(`[${this.name}] Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker for database operations
export const databaseCircuitBreaker = new CircuitBreaker(5, 30000, 'DatabaseCircuitBreaker');
