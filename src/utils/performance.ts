import { logger } from './logger';

// Performance monitoring utilities for production

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startTiming(key: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(key)) {
        this.metrics.set(key, []);
      }
      
      this.metrics.get(key)!.push(duration);
      
      // Log slow operations
      if (duration > 1000) {
        logger.warn('Slow operation detected', { key, duration });
      }
    };
  }

  getMetrics(key: string) {
    const values = this.metrics.get(key) || [];
    if (values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { avg, max, min, count: values.length };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [key] of this.metrics) {
      result[key] = this.getMetrics(key);
    }
    return result;
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

// Utility functions
export const measureAsync = async <T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> => {
  const stopTiming = performanceTracker.startTiming(label);
  try {
    const result = await fn();
    return result;
  } finally {
    stopTiming();
  }
};

export const measureSync = <T>(fn: () => T, label: string): T => {
  const stopTiming = performanceTracker.startTiming(label);
  try {
    return fn();
  } finally {
    stopTiming();
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
};

// Bundle size analysis
export const analyzeChunkSizes = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const chunks = scripts
    .map(script => ({
      src: (script as HTMLScriptElement).src,
      size: 'Unknown', // Would need actual size monitoring
    }))
    .filter(chunk => chunk.src.includes('assets'));
  
  logger.info('Chunk analysis', { chunks });
  return chunks;
};