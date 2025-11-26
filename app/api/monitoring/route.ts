import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'summary':
        const summary = performanceMonitor.getPerformanceSummary();
        return NextResponse.json({ summary });

      case 'metrics':
        const { metrics, errors, apiCalls } = performanceMonitor.exportData();
        return NextResponse.json({
          metrics: metrics.slice(-100), // Last 100 metrics
          errors: errors.slice(-50),    // Last 50 errors
          apiCalls: apiCalls.slice(-100) // Last 100 API calls
        });

      case 'health':
        const healthSummary = performanceMonitor.getPerformanceSummary();
        const isHealthy = healthSummary.errors.criticalErrors === 0 &&
                         healthSummary.api.successRate > 95 &&
                         healthSummary.performance.averageApiResponse < 3000;

        return NextResponse.json({
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          ...healthSummary
        });

      default:
        return NextResponse.json({
          error: 'Invalid action. Use ?action=summary, metrics, or health'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Monitoring data unavailable' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track_metric':
        performanceMonitor.trackMetric(
          data.name,
          data.value,
          data.metadata
        );
        break;

      case 'log_error':
        performanceMonitor.logError(
          data.error,
          data.context,
          data.severity
        );
        break;

      case 'clear_old_data':
        performanceMonitor.clearOldData(data.olderThanHours || 24);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Monitoring POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process monitoring data' },
      { status: 500 }
    );
  }
}
