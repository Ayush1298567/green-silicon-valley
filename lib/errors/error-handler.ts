import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
  context?: Record<string, any>;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  code: string;
  isOperational: boolean;
  context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource', context?: Record<string, any>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, context);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, 'CONFLICT_ERROR', true, context);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded', context?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, context);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 500, 'DATABASE_ERROR', false, context);
  }
}

export class ExternalServiceError extends CustomError {
  constructor(service: string, message: string, context?: Record<string, any>) {
    super(`External service error (${service}): ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', false, {
      service,
      ...context
    });
  }
}

/**
 * Error handler middleware for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  performanceMonitor.logError(
    error instanceof Error ? error : new Error(errorMessage),
    {
      type: 'api_error',
      ...(error instanceof CustomError ? error.context : {})
    },
    error instanceof CustomError && error.statusCode >= 500 ? 'critical' : 'high'
  );

  // Handle known error types
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            context: error.context
          })
        }
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack
          })
        }
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      }
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API route handlers
 */
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validate request body against schema
 */
export function validateRequestBody<T>(
  body: any,
  schema: {
    required?: string[];
    types?: Record<string, string>;
    validators?: Record<string, (value: any) => boolean>;
  }
): T {
  const errors: string[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (body[field] === undefined || body[field] === null) {
        errors.push(`Field '${field}' is required`);
      }
    }
  }

  // Check types
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (body[field] !== undefined) {
        const actualType = typeof body[field];
        if (actualType !== expectedType) {
          errors.push(`Field '${field}' must be of type ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  // Run custom validators
  if (schema.validators) {
    for (const [field, validator] of Object.entries(schema.validators)) {
      if (body[field] !== undefined && !validator(body[field])) {
        errors.push(`Field '${field}' failed validation`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Request validation failed', { errors });
  }

  return body as T;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  errorHandler?: (error: Error) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.error('Safe async operation failed:', err);
    }

    return fallback !== undefined ? fallback : null;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Retry operation failed');
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof CustomError && error.isOperational) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose internal error details to users
    return 'An error occurred. Please try again or contact support if the problem persists.';
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof CustomError) {
    return error.statusCode;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) return 401;
    if (error.message.includes('permission') || error.message.includes('forbidden')) return 403;
    if (error.message.includes('validation') || error.message.includes('invalid')) return 400;
  }

  return 500;
}
