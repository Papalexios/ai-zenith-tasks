import React, { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Log slow renders (over 100ms)
    if (renderTime > 100) {
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        timestamp: Date.now(),
      };
      
      logger.warn('Slow render detected', metrics);
    }

    // Log excessive re-renders
    if (renderCount.current > 10) {
      logger.warn('Excessive re-renders detected', {
        componentName,
        renderCount: renderCount.current,
      });
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

export const withPerformanceMonitoring = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  const WrappedComponent = (props: T) => {
    usePerformanceMonitor(componentName);
    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
};