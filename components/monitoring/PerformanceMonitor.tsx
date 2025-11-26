"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePerformanceMonitoring } from '@/lib/monitoring/performance';

export default function PerformanceMonitor() {
  const pathname = usePathname();
  const { trackMetric, trackPageView, trackInteraction, logError } = usePerformanceMonitoring();

  useEffect(() => {
    // Track page view
    trackPageView(pathname);

    // Track page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        trackMetric('page_load', loadTime, {
          pathname,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        });
      }
    }

    // Track largest contentful paint
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          trackMetric('largest_contentful_paint', lastEntry.startTime, {
            pathname,
            element: (lastEntry as any).element?.tagName || 'unknown'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        return () => lcpObserver.disconnect();
      } catch (error) {
        // Performance observer not supported
      }
    }

    // Track user interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button, a, [role="button"]');

      if (button) {
        const elementId = button.id || button.getAttribute('data-testid') || button.textContent?.slice(0, 50);
        trackInteraction('click', elementId, {
          tagName: button.tagName,
          pathname,
          href: button.getAttribute('href') || undefined
        });
      }
    };

    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      trackInteraction('form_submit', form.id || form.name || 'unknown_form', {
        pathname,
        action: form.action
      });
    };

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
      }
    };

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      trackMetric('page_scroll_depth', maxScrollDepth, { pathname });
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track JavaScript errors
    const handleError = (event: ErrorEvent) => {
      logError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        pathname
      }, 'high');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(event.reason, {
        type: 'unhandled_promise_rejection',
        pathname
      }, 'high');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);

      // Track final scroll depth
      trackMetric('page_scroll_depth', maxScrollDepth, { pathname });
    };
  }, [pathname]);

  // Track route changes
  useEffect(() => {
    trackMetric('route_change', 1, { from: pathname });
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
