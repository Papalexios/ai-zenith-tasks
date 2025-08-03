import { useState, useEffect } from 'react';

export function LoadingState() {
  const [dots, setDots] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const getMessage = () => {
    if (timeElapsed < 1) return `⚡ Lightning AI processing${dots}`;
    if (timeElapsed < 2) return `🧠 Analyzing task priorities${dots}`;
    if (timeElapsed < 3) return `⚡ Optimizing time blocks${dots}`;
    if (timeElapsed < 4) return `🎯 Balancing workload${dots}`;
    if (timeElapsed < 6) return `✨ Finalizing schedule${dots}`;
    return `🔄 Background optimization${dots}`;
  };

  return (
    <div className="text-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground font-medium">
        {getMessage()}
      </p>
      {timeElapsed > 1 && (
        <p className="text-xs text-muted-foreground/60 mt-2">
          {timeElapsed < 3 ? 'Horizon Beta • Ultra-premium speed' : 'DeepSeek R1 • Advanced reasoning'}
        </p>
      )}
      {timeElapsed > 2 && (
        <p className="text-xs text-blue-600/80 mt-1">
          Premium AI models optimizing your schedule...
        </p>
      )}
      {timeElapsed > 4 && (
        <p className="text-xs text-green-600/80 mt-1">
          Background enhancement for perfect results...
        </p>
      )}
    </div>
  );
}