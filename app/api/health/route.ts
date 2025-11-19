import { NextResponse } from "next/server";
import { performHealthCheck, healthMonitor } from "@/lib/health-check";

// GET /api/health - System health check endpoint
export async function GET() {
  const result = await performHealthCheck();

  return NextResponse.json(result.body, { status: result.status });
}

// Startup health monitoring (this would be called from a startup script)
export async function startHealthMonitoring() {
  // Start periodic health checks every 5 minutes
  healthMonitor.startPeriodicChecks(5 * 60 * 1000);

  console.log('🏥 Health monitoring started');

  // Initial health check
  const health = await healthMonitor.checkSystemHealth();
  console.log(`🏥 Initial health check: ${health.overall.toUpperCase()}`);

  if (health.overall === 'unhealthy') {
    console.error('🚨 System started in unhealthy state:', health);
  }
}