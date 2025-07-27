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
    if (timeElapsed < 3) return `Analyzing your tasks${dots}`;
    if (timeElapsed < 8) return `Creating optimal schedule${dots}`;
    if (timeElapsed < 15) return `AI is working hard${dots}`;
    return `Almost ready${dots}`;
  };

  return (
    <div className="text-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground font-medium">
        {getMessage()}
      </p>
      {timeElapsed > 5 && (
        <p className="text-xs text-muted-foreground/60 mt-2">
          Using fastest AI models for quick response...
        </p>
      )}
    </div>
  );
}