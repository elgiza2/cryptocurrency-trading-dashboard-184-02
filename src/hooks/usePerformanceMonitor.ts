import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(performance.now());
  const renderStartRef = useRef<number>(performance.now());

  useEffect(() => {
    const loadTime = performance.now() - startTimeRef.current;
    
    // Log performance metrics
    console.log(`[Performance] ${componentName}:`, {
      loadTime: `${loadTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`[Memory] ${componentName}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Cleanup function
    return () => {
      const totalTime = performance.now() - startTimeRef.current;
      console.log(`[Cleanup] ${componentName}: ${totalTime.toFixed(2)}ms`);
    };
  }, [componentName]);

  const markRenderStart = () => {
    renderStartRef.current = performance.now();
  };

  const markRenderEnd = () => {
    const renderTime = performance.now() - renderStartRef.current;
    console.log(`[Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
  };

  return { markRenderStart, markRenderEnd };
};