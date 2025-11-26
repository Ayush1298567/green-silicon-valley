interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

interface ApiCallMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  error?: string;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorLog[] = [];
  private apiCalls: ApiCallMetric[] = [];
  private readonly maxStoredItems = 1000;

  /**
   * Track performance metric
   */
  trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      name,
      value,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxStoredItems) {
      this.metrics = this.metrics.slice(-this.maxStoredItems);
    }

    // Log significant performance issues
    if (name === 'page_load' && value > 3000) {
      console.warn(`Slow page load: ${value}ms`, metadata);
    }

    if (name === 'api_response_time' && value > 5000) {
      console.warn(`Slow API call: ${value}ms`, metadata);
    }
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, element?: string, metadata?: Record<string, any>) {
    this.trackMetric(`interaction_${action}`, 1, {
      element,
      ...metadata
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, loadTime?: number) {
    this.trackMetric('page_view', 1, { page, loadTime });
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, method: string, statusCode: number, responseTime: number, error?: string) {
    const apiCall: ApiCallMetric = {
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      error
    };

    this.apiCalls.push(apiCall);

    // Keep only recent API calls
    if (this.apiCalls.length > this.maxStoredItems) {
      this.apiCalls = this.apiCalls.slice(-this.maxStoredItems);
    }

    // Track as metric
    this.trackMetric('api_response_time', responseTime, {
      endpoint,
      method,
      statusCode,
      error: !!error
    });
  }

  /**
   * Log error
   */
  logError(error: Error | string, context?: Record<string, any>, severity: ErrorLog['severity'] = 'medium') {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const errorLog: ErrorLog = {
      id: this.generateId(),
      message: errorMessage,
      stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      severity,
      context
    };

    this.errors.push(errorLog);

    // Keep only recent errors
    if (this.errors.length > this.maxStoredItems) {
      this.errors = this.errors.slice(-this.maxStoredItems);
    }

    // Log to console based on severity
    const logMethod = severity === 'critical' ? 'error' :
                     severity === 'high' ? 'error' :
                     severity === 'medium' ? 'warn' : 'info';

    console[logMethod](`[${severity.toUpperCase()}] ${errorMessage}`, context);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > last24h);
    const recentErrors = this.errors.filter(e => new Date(e.timestamp).getTime() > last24h);
    const recentApiCalls = this.apiCalls.filter(a => new Date(a.timestamp).getTime() > last24h);

    // Calculate averages
    const avgPageLoad = this.calculateAverage(recentMetrics.filter(m => m.name === 'page_load'));
    const avgApiResponse = this.calculateAverage(recentMetrics.filter(m => m.name === 'api_response_time'));

    // Error breakdown
    const errorBreakdown = recentErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // API call success rate
    const totalApiCalls = recentApiCalls.length;
    const successfulApiCalls = recentApiCalls.filter(call => call.statusCode >= 200 && call.statusCode < 300).length;
    const apiSuccessRate = totalApiCalls > 0 ? (successfulApiCalls / totalApiCalls) * 100 : 100;

    return {
      summary: {
        period: 'last 24 hours',
        totalMetrics: recentMetrics.length,
        totalErrors: recentErrors.length,
        totalApiCalls,
        apiSuccessRate: Math.round(apiSuccessRate * 100) / 100
      },
      performance: {
        averagePageLoad: Math.round(avgPageLoad),
        averageApiResponse: Math.round(avgApiResponse),
        slowestApiCall: Math.max(...recentApiCalls.map(c => c.responseTime), 0)
      },
      errors: {
        breakdown: errorBreakdown,
        criticalErrors: recentErrors.filter(e => e.severity === 'critical').length,
        recentErrors: recentErrors.slice(-5).map(e => ({
          message: e.message,
          severity: e.severity,
          timestamp: e.timestamp,
          url: e.url
        }))
      },
      api: {
        totalCalls: totalApiCalls,
        successRate: apiSuccessRate,
        errorRate: 100 - apiSuccessRate,
        slowestEndpoint: this.getSlowestEndpoint(recentApiCalls)
      }
    };
  }

  /**
   * Export data for external monitoring
   */
  exportData() {
    return {
      metrics: this.metrics,
      errors: this.errors,
      apiCalls: this.apiCalls,
      summary: this.getPerformanceSummary()
    };
  }

  /**
   * Clear old data
   */
  clearOldData(olderThanHours: number = 24) {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

    this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoffTime);
    this.errors = this.errors.filter(e => new Date(e.timestamp).getTime() > cutoffTime);
    this.apiCalls = this.apiCalls.filter(a => new Date(a.timestamp).getTime() > cutoffTime);
  }

  /**
   * Helper methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  private getSlowestEndpoint(apiCalls: ApiCallMetric[]): string {
    if (apiCalls.length === 0) return 'N/A';

    let slowest = apiCalls[0];
    for (const call of apiCalls) {
      if (call.responseTime > slowest.responseTime) {
        slowest = call;
      }
    }

    return `${slowest.method} ${slowest.endpoint}`;
  }
}

// Global performance monitoring instance
export const performanceMonitor = new PerformanceMonitoringService();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  return {
    trackMetric: (name: string, value: number, metadata?: Record<string, any>) => {
      performanceMonitor.trackMetric(name, value, metadata);
    },

    trackInteraction: (action: string, element?: string, metadata?: Record<string, any>) => {
      performanceMonitor.trackInteraction(action, element, metadata);
    },

    logError: (error: Error | string, context?: Record<string, any>, severity?: ErrorLog['severity']) => {
      performanceMonitor.logError(error, context, severity);
    },

    getSummary: () => performanceMonitor.getPerformanceSummary()
  };
}

// API middleware for tracking API calls
export function withApiMonitoring(handler: any) {
  return async (request: Request, context?: any) => {
    const startTime = Date.now();
    let statusCode = 200;
    let error: string | undefined;

    try {
      const response = await handler(request, context);
      statusCode = response.status || 200;
      return response;
    } catch (err: any) {
      statusCode = 500;
      error = err.message;
      throw err;
    } finally {
      const responseTime = Date.now() - startTime;
      const url = new URL(request.url);
      const endpoint = url.pathname;

      performanceMonitor.trackApiCall(
        endpoint,
        request.method,
        statusCode,
        responseTime,
        error
      );
    }
  };
}
