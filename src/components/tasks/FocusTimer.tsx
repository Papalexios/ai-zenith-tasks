import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, Clock } from 'lucide-react';

export function FocusTimer() {
  const { focusTimer, startFocusTimer, pauseFocusTimer, stopFocusTimer, tickTimer, tasks } = useTaskStore();
  
  const currentTask = tasks.find(t => t.id === focusTimer.taskId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (focusTimer.isActive && focusTimer.timeLeft > 0) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimer.isActive, focusTimer.timeLeft, tickTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60) - focusTimer.timeLeft) / (25 * 60) * 100;

  if (!focusTimer.taskId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="w-80 shadow-glow border-2 border-primary/20 bg-background/95 backdrop-blur">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">Focus Session</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopFocusTimer}
                className="p-1 h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Task */}
            {currentTask && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium truncate">{currentTask.title}</p>
                {currentTask.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {currentTask.description}
                  </p>
                )}
              </div>
            )}

            {/* Timer Display */}
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-primary">
                {formatTime(focusTimer.timeLeft)}
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant={focusTimer.isActive ? "outline" : "default"}
                size="sm"
                onClick={focusTimer.isActive ? pauseFocusTimer : () => startFocusTimer(focusTimer.taskId!)}
                className="gap-2"
              >
                {focusTimer.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {focusTimer.isActive ? "Pause" : "Resume"}
              </Button>
            </div>

            {/* Session complete */}
            {focusTimer.timeLeft === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-accent/10 border border-accent/20 rounded-lg"
              >
                <p className="font-semibold text-accent mb-2">🎉 Focus session complete!</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Great work! Time for a 5-minute break.
                </p>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={stopFocusTimer}
                  className="w-full"
                >
                  Finish Session
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}