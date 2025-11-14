/**
 * Performance monitoring utilities for tracking rendering and data fetch times
 */

export interface PerformanceMetrics {
  componentRenderTime: number;
  dataFetchTime: number;
  ttl: number; // Time to interactive
}

const metricsMap = new Map<string, number>();

export function startTimer(label: string): void {
  metricsMap.set(label, performance.now());
}

export function endTimer(label: string): number {
  const startTime = metricsMap.get(label);
  if (!startTime) {
    console.warn(`Timer "${label}" not started`);
    return 0;
  }
  const duration = performance.now() - startTime;
  metricsMap.delete(label);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
}

/**
 * Track Core Web Vitals: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
 */
export function reportWebVitals(): void {
  if ('web-vital' in window) {
    try {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('[Web Vital] LCP:', (entry as any).renderTime || (entry as any).loadTime);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    } catch (e) {
      console.warn('Web Vitals tracking unavailable');
    }
  }
}

/**
 * Lazy load images to improve initial page load
 */
export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach((img) => imageObserver.observe(img));
  }
}
