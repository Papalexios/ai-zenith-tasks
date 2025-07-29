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
    if (timeElapsed < 2) return `🧠 Analyzing your tasks${dots}`;
    if (timeElapsed < 4) return `⚡ Optimizing time blocks${dots}`;
    if (timeElapsed < 6) return `🎯 Balancing priorities${dots}`;
    return `✨ Finalizing your schedule${dots}`;
  };

  return (
    <div className="text-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground font-medium">
        {getMessage()}
      </p>
      {timeElapsed > 3 && (
        <p className="text-xs text-muted-foreground/60 mt-2">
          Using DeepSeek Chat V3 • Ultra-fast AI processing
        </p>
      )}
      {timeElapsed > 6 && (
        <p className="text-xs text-green-600/80 mt-1">
          Background optimization in progress...
        </p>
      )}
    </div>
  );
}