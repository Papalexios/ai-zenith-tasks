import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, Square, Eye, EyeOff, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskStore } from '@/store/taskStore';

interface FocusModeProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ isEnabled, onToggle }) => {
  const { tasks, focusTimer } = useTaskStore();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);

  // Handle ESC key to exit focus mode
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isEnabled) {
      onToggle();
    }
  }, [isEnabled, onToggle]);

  // Handle click outside to exit focus mode
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onToggle();
    }
  }, [onToggle]);

  // Add ESC key listener
  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isEnabled, handleEscapeKey]);

  const pendingTasks = tasks.filter(t => !t.completed);
  const currentTask = pendingTasks[currentTaskIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            // Timer finished
            setIsPomodoroActive(false);
            if (soundEnabled) {
              // Play notification sound
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsFJX/D8N2QQAoUXrTp66hVFApGn+DyvmkfCjOHzO/EfSsF');
              audio.play().catch(() => {});
            }
            
            if (isBreak) {
              // Break finished, back to work
              setIsBreak(false);
              setPomodoroTime(25 * 60);
              setSessionCount(prev => prev + 1);
            } else {
              // Work session finished, start break
              setIsBreak(true);
              const breakTime = sessionCount % 4 === 3 ? 15 * 60 : 5 * 60; // Long break every 4 sessions
              setPomodoroTime(breakTime);
              setIsPomodoroActive(true); // Auto-start break
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroTime, isBreak, sessionCount, soundEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    setIsPomodoroActive(true);
  };

  const pausePomodoro = () => {
    setIsPomodoroActive(false);
  };

  const resetPomodoro = () => {
    setIsPomodoroActive(false);
    setPomodoroTime(isBreak ? (sessionCount % 4 === 3 ? 15 * 60 : 5 * 60) : 25 * 60);
  };

  const nextTask = () => {
    if (currentTaskIndex < pendingTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const prevTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const progress = ((isBreak ? (sessionCount % 4 === 3 ? 15 * 60 : 5 * 60) : 25 * 60) - pomodoroTime) / (isBreak ? (sessionCount % 4 === 3 ? 15 * 60 : 5 * 60) : 25 * 60) * 100;

  if (!isEnabled) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Timer className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Focus Mode</h3>
            <p className="text-sm text-muted-foreground">
              Stay focused with Pomodoro timer and distraction-free task view
            </p>
          </div>
          <Button onClick={onToggle} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Timer className="h-4 w-4 mr-2" />
            Enter Focus Mode
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div 
        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={handleOverlayClick}
      >
        <div className="w-full max-w-2xl mx-4">
          <Card className="shadow-2xl border-2">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Timer className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Focus Mode: Today's AI-Generated Plan</h2>
                  <Badge variant={isBreak ? "secondary" : "default"} className="text-sm">
                    {isBreak ? 'Break Time' : 'Work Session'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                      >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {soundEnabled ? 'Disable sound' : 'Enable sound'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onToggle}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Exit Focus Mode (ESC)
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

            {/* Current Task */}
            {currentTask && !isBreak && (
              <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Current Task</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={prevTask}
                      disabled={currentTaskIndex === 0}
                    >
                      ←
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentTaskIndex + 1} of {pendingTasks.length}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={nextTask}
                      disabled={currentTaskIndex === pendingTasks.length - 1}
                    >
                      →
                    </Button>
                  </div>
                </div>
                <p className="text-lg mb-2">{currentTask.title}</p>
                {currentTask.description && (
                  <p className="text-muted-foreground mb-3">{currentTask.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {currentTask.priority} Priority
                  </Badge>
                  <Badge variant="secondary">
                    {currentTask.category}
                  </Badge>
                  {currentTask.estimatedTime && (
                    <Badge variant="outline">
                      {currentTask.estimatedTime}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Break Message */}
            {isBreak && (
              <div className="mb-8 p-6 bg-secondary/20 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {sessionCount % 4 === 3 ? 'Long Break' : 'Short Break'}
                </h3>
                <p className="text-muted-foreground">
                  Take a break! Stretch, hydrate, or take a walk.
                </p>
              </div>
            )}

            {/* Pomodoro Timer */}
            <div className="text-center mb-8">
              <div className="text-6xl font-mono font-bold mb-4 text-primary">
                {formatTime(pomodoroTime)}
              </div>
              <Progress value={progress} className="h-3 mb-6" />
              
              <div className="flex items-center justify-center gap-4">
                {!isPomodoroActive ? (
                  <Button onClick={startPomodoro} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pausePomodoro} size="lg" variant="secondary" className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetPomodoro} size="lg" variant="outline" className="gap-2">
                  <Square className="h-5 w-5" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{sessionCount}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
                <div className="text-sm text-muted-foreground">Tasks Left</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor((sessionCount * 25) / 60)}h {(sessionCount * 25) % 60}m
                </div>
                <div className="text-sm text-muted-foreground">Focus Time</div>
              </div>
            </div>
            
            {/* Exit Focus Mode Button */}
            <div className="text-center">
              <Button variant="outline" onClick={onToggle} className="gap-2">
                <X className="h-4 w-4" />
                Exit Focus Mode
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Press ESC or click outside to exit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
};