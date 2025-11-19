// Database health monitoring and diagnostics

import { createClient } from '@supabase/supabase-js';

export interface HealthStatus {
  database: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
  };
  lastChecked: string;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  database: HealthStatus;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  timestamp: string;
}

class HealthMonitor {
  private supabase: any;
  private lastHealthCheck: SystemHealth | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Use provided credentials or get from environment
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      this.supabase = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
  }

  async checkDatabaseHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const { data, error } = await Promise.race([
        this.supabase.from('users').select('count').limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          database: 'unhealthy',
          responseTime,
          connectionPool: { active: 0, idle: 0, waiting: 0 },
          lastChecked: new Date().toISOString(),
          error: error.message
        };
      }

      // Determine health status based on response time
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (responseTime < 100) {
        status = 'healthy';
      } else if (responseTime < 1000) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        database: status,
        responseTime,
        connectionPool: { active: 1, idle: 0, waiting: 0 }, // Simplified for now
        lastChecked: new Date().toISOString()
      };

    } catch (error: any) {
      return {
        database: 'unhealthy',
        responseTime: Date.now() - startTime,
        connectionPool: { active: 0, idle: 0, waiting: 0 },
        lastChecked: new Date().toISOString(),
        error: error.message
      };
    }
  }

  async checkSystemHealth(): Promise<SystemHealth> {
    const [dbHealth] = await Promise.all([
      this.checkDatabaseHealth()
    ]);

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };

    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbHealth.database === 'unhealthy' || memory.percentage > 90) {
      overall = 'unhealthy';
    } else if (dbHealth.database === 'degraded' || memory.percentage > 75) {
      overall = 'degraded';
    }

    const health: SystemHealth = {
      overall,
      database: dbHealth,
      memory,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    this.lastHealthCheck = health;
    return health;
  }

  getLastHealthCheck(): SystemHealth | null {
    return this.lastHealthCheck;
  }

  startPeriodicChecks(intervalMs: number = 300000) { // 5 minutes default
    this.checkInterval = setInterval(async () => {
      try {
        const health = await this.checkSystemHealth();

        // Log issues
        if (health.overall === 'unhealthy') {
          console.error('🚨 SYSTEM HEALTH: UNHEALTHY', health);
        } else if (health.overall === 'degraded') {
          console.warn('⚠️ SYSTEM HEALTH: DEGRADED', health);
        }

        // Could send alerts here in production
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, intervalMs);
  }

  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Emergency circuit breaker
  async emergencyShutdown(reason: string) {
    console.error(`🚨 EMERGENCY SHUTDOWN: ${reason}`);

    // Stop accepting new requests
    this.stopPeriodicChecks();

    // Could implement graceful shutdown logic here
    process.exit(1);
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();

// Helper functions for API routes
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const health = await healthMonitor.checkDatabaseHealth();
    return health.database === 'healthy';
  } catch {
    return false;
  }
}

export async function requireHealthyDatabase(operationName: string = 'Database operation') {
  const isHealthy = await checkDatabaseHealth();
  if (!isHealthy) {
    throw new Error(`${operationName} failed: Database is unhealthy`);
  }
}

// Middleware for health checks
export async function performHealthCheck(): Promise<{ status: number; body: any }> {
  try {
    const health = await healthMonitor.checkSystemHealth();

    const status = health.overall === 'healthy' ? 200 :
                   health.overall === 'degraded' ? 200 : 503; // Service Unavailable

    return {
      status,
      body: {
        status: health.overall,
        timestamp: health.timestamp,
        checks: {
          database: {
            status: health.database.database,
            responseTime: `${health.database.responseTime}ms`,
            lastChecked: health.database.lastChecked
          },
          memory: {
            used: `${health.memory.used}MB`,
            total: `${health.memory.total}MB`,
            percentage: `${health.memory.percentage}%`
          },
          uptime: `${Math.round(health.uptime)}s`
        }
      }
    };
  } catch (error: any) {
    return {
      status: 503,
      body: {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}
