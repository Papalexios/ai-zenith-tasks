import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { performanceTracker, getMemoryUsage } from '@/utils/performance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, HardDrive, Zap } from 'lucide-react';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceTracker.getAllMetrics());
      setMemoryUsage(getMemoryUsage());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50 bg-background/90 backdrop-blur-sm"
      >
        <Activity className="h-4 w-4 mr-2" />
        Perf
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="timing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timing" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Timing
              </TabsTrigger>
              <TabsTrigger value="memory" className="text-xs">
                <HardDrive className="h-3 w-3 mr-1" />
                Memory
              </TabsTrigger>
              <TabsTrigger value="bundle" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Bundle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timing" className="mt-2">
              <div className="space-y-2">
                {Object.entries(metrics).map(([key, data]: [string, any]) => (
                  <div key={key} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{key}</span>
                      <Badge 
                        variant={data?.avg > 100 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {data?.avg?.toFixed(1)}ms
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      Min: {data?.min?.toFixed(1)}ms | Max: {data?.max?.toFixed(1)}ms | Count: {data?.count}
                    </div>
                  </div>
                ))}
                {Object.keys(metrics).length === 0 && (
                  <div className="text-xs text-muted-foreground">No timing data available</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="memory" className="mt-2">
              {memoryUsage ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Used Heap:</span>
                    <span className="font-medium">{memoryUsage.usedJSHeapSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Heap:</span>
                    <span className="font-medium">{memoryUsage.totalJSHeapSize}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Limit:</span>
                    <span className="font-medium">{memoryUsage.jsHeapSizeLimit}MB</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Memory info not available</div>
              )}
            </TabsContent>

            <TabsContent value="bundle" className="mt-2">
              <div className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Bundle analysis would be available with build tools integration
                </div>
                <Button
                  onClick={() => performanceTracker.clearMetrics()}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  Clear Metrics
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};