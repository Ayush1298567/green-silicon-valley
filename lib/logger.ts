// Structured logging utilities for production debugging and monitoring

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  userId?: string;
  email?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {}
    };

    return JSON.stringify(logEntry, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  static info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  static error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    } : context;

    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
  }

  static fatal(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    } : context;

    console.error(this.formatMessage(LogLevel.FATAL, message, errorContext));
  }
}

// Specialized loggers for different parts of the application
export class APILogger {
  static logRequest(req: any, context?: LogContext) {
    Logger.info('API Request', {
      method: req.method,
      url: req.url,
      ipAddress: req.headers?.get('x-forwarded-for') || req.headers?.get('x-real-ip'),
      userAgent: req.headers?.get('user-agent'),
      ...context
    });
  }

  static logResponse(req: any, res: any, duration: number, context?: LogContext) {
    Logger.info('API Response', {
      method: req.method,
      url: req.url,
      statusCode: res.status || res.statusCode,
      duration,
      ...context
    });
  }

  static logError(req: any, error: Error, context?: LogContext) {
    Logger.error('API Error', error, {
      method: req.method,
      url: req.url,
      ipAddress: req.headers?.get('x-forwarded-for') || req.headers?.get('x-real-ip'),
      ...context
    });
  }
}

export class DatabaseLogger {
  static logQuery(operation: string, table: string, success: boolean, duration?: number, context?: LogContext) {
    Logger.info('Database Query', {
      operation,
      table,
      success,
      duration,
      ...context
    });
  }

  static logError(operation: string, table: string, error: Error, context?: LogContext) {
    Logger.error('Database Error', error, {
      operation,
      table,
      ...context
    });
  }
}

export class AuthLogger {
  static logLogin(email: string, success: boolean, context?: LogContext) {
    Logger.info('Authentication Attempt', {
      email,
      success,
      ...context
    });
  }

  static logLogout(email: string, context?: LogContext) {
    Logger.info('User Logout', {
      email,
      ...context
    });
  }

  static logAuthorizationFailure(resource: string, action: string, context?: LogContext) {
    Logger.warn('Authorization Failure', {
      resource,
      action,
      ...context
    });
  }
}

export class BusinessLogicLogger {
  static logMaterialRequest(requestId: string, action: string, context?: LogContext) {
    Logger.info('Material Request Action', {
      requestId,
      action,
      ...context
    });
  }

  static logPermissionChange(internId: string, permission: string, action: 'granted' | 'revoked', context?: LogContext) {
    Logger.info('Permission Change', {
      internId,
      permission,
      action,
      ...context
    });
  }

  static logNotificationSent(type: string, recipient: string, context?: LogContext) {
    Logger.debug('Notification Sent', {
      type,
      recipient,
      ...context
    });
  }
}

// Performance monitoring
export class PerformanceLogger {
  static logSlowQuery(query: string, duration: number, context?: LogContext) {
    if (duration > 1000) { // Log queries taking more than 1 second
      Logger.warn('Slow Database Query', {
        query: query.substring(0, 200), // Truncate long queries
        duration,
        ...context
      });
    }
  }

  static logMemoryUsage(context?: LogContext) {
    const usage = process.memoryUsage();
    Logger.debug('Memory Usage', {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB',
      ...context
    });
  }
}

// Helper function to extract context from Next.js requests
export function extractRequestContext(req: any, session?: any): LogContext {
  return {
    ipAddress: req.headers?.get('x-forwarded-for') || req.headers?.get('x-real-ip'),
    userAgent: req.headers?.get('user-agent'),
    url: req.url,
    method: req.method,
    userId: session?.user?.id,
    email: session?.user?.email,
  };
}
