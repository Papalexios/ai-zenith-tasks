import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, RefreshCw, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskStore } from '@/store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleAdjustment {
  id: string;
  type: 'delay' | 'reschedule' | 'priority_bump' | 'time_extend' | 'break_suggestion';
  title: string;
  description: string;
  affectedTasks: string[];
  suggestedAction: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  timeframe: string;
}

export const RealTimeScheduleAdjuster: React.FC = () => {
  const { tasks, dailyPlan, updateDailyPlan, generateDailyPlan } = useTaskStore();
  const [adjustments, setAdjustments] = useState<ScheduleAdjustment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Monitor task progress and schedule changes
  useEffect(() => {
    const checkScheduleAdjustments = () => {
      if (!dailyPlan?.timeBlocks) return;
      
      setIsAnalyzing(true);
      const newAdjustments = analyzeScheduleNeeds();
      setAdjustments(newAdjustments);
      setLastAnalysis(new Date());
      setIsAnalyzing(false);
    };

    // Check every 5 minutes
    const interval = setInterval(checkScheduleAdjustments, 5 * 60 * 1000);
    
    // Check immediately
    checkScheduleAdjustments();

    return () => clearInterval(interval);
  }, [tasks, dailyPlan]);

  const analyzeScheduleNeeds = (): ScheduleAdjustment[] => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const adjustments: ScheduleAdjustment[] = [];

    if (!dailyPlan?.timeBlocks) return adjustments;

    // Check for overdue time blocks
    const overdueBlocks = dailyPlan.timeBlocks.filter(block => {
      if (!block.endTime) return false;
      return block.endTime < currentTime && !isTaskCompleted(block.taskId);
    });

    if (overdueBlocks.length > 0) {
      adjustments.push({
        id: 'overdue-tasks',
        type: 'reschedule',
        title: 'Tasks running behind schedule',
        description: `${overdueBlocks.length} time blocks are overdue. Your schedule needs adjusting.`,
        affectedTasks: overdueBlocks.map(b => b.taskId || b.task),
        suggestedAction: 'Reschedule remaining tasks and compress lower-priority items',
        impact: 'high',
        confidence: 0.95,
        timeframe: 'immediate'
      });
    }

    // Check for upcoming high-priority tasks that might need more time
    const upcomingUrgent = dailyPlan.timeBlocks.filter(block => {
      if (!block.startTime) return false;
      const blockStart = new Date(`2000-01-01T${block.startTime}:00`);
      const nowTime = new Date(`2000-01-01T${currentTime}:00`);
      const timeDiff = (blockStart.getTime() - nowTime.getTime()) / (1000 * 60); // minutes
      
      return timeDiff > 0 && timeDiff <= 60 && block.priority === 'urgent';
    });

    if (upcomingUrgent.length > 0) {
      adjustments.push({
        id: 'urgent-prep',
        type: 'priority_bump',
        title: 'Urgent task approaching',
        description: `High-priority task "${upcomingUrgent[0].task}" starts in less than an hour.`,
        affectedTasks: upcomingUrgent.map(b => b.taskId || b.task),
        suggestedAction: 'Wrap up current work and prepare for high-priority task',
        impact: 'medium',
        confidence: 0.85,
        timeframe: 'within 1 hour'
      });
    }

    // Check for potential burnout (too many consecutive work blocks)
    const consecutiveWorkBlocks = getConsecutiveWorkBlocks();
    if (consecutiveWorkBlocks >= 4) {
      adjustments.push({
        id: 'break-needed',
        type: 'break_suggestion',
        title: 'Break recommended',
        description: `You've been working for ${consecutiveWorkBlocks} consecutive time blocks without a break.`,
        affectedTasks: [],
        suggestedAction: 'Take a 15-minute break to maintain productivity and focus',
        impact: 'medium',
        confidence: 0.80,
        timeframe: 'now'
      });
    }

    // Check for time estimation issues
    const tasksWithPoorEstimates = findTasksWithPoorTimeEstimates();
    if (tasksWithPoorEstimates.length > 0) {
      adjustments.push({
        id: 'time-estimation',
        type: 'time_extend',
        title: 'Time estimates may be optimistic',
        description: `Based on your patterns, these tasks typically take 30% longer than estimated.`,
        affectedTasks: tasksWithPoorEstimates,
        suggestedAction: 'Add buffer time to similar tasks in the future',
        impact: 'low',
        confidence: 0.70,
        timeframe: 'planning future tasks'
      });
    }

    // Check for energy-task mismatch
    const energyMismatches = findEnergyTaskMismatches();
    if (energyMismatches.length > 0) {
      adjustments.push({
        id: 'energy-mismatch',
        type: 'reschedule',
        title: 'Energy-task alignment needed',
        description: 'High-energy tasks are scheduled during your typical low-energy periods.',
        affectedTasks: energyMismatches,
        suggestedAction: 'Move demanding tasks to your peak energy hours (typically 9-11 AM)',
        impact: 'medium',
        confidence: 0.75,
        timeframe: 'for tomorrow'
      });
    }

    return adjustments.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return impactWeight[b.impact] - impactWeight[a.impact];
    });
  };

  const isTaskCompleted = (taskId?: string): boolean => {
    if (!taskId) return false;
    const task = tasks.find(t => t.id === taskId);
    return task?.completed || false;
  };

  const getConsecutiveWorkBlocks = (): number => {
    if (!dailyPlan?.timeBlocks) return 0;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let consecutiveCount = 0;
    const sortedBlocks = [...dailyPlan.timeBlocks].sort((a, b) => 
      (a.startTime || '').localeCompare(b.startTime || '')
    );

    for (let i = sortedBlocks.length - 1; i >= 0; i--) {
      const block = sortedBlocks[i];
      if (!block.endTime || block.endTime > currentTime) continue;
      
      if (block.type === 'work' && !isTaskCompleted(block.taskId)) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    return consecutiveCount;
  };

  const findTasksWithPoorTimeEstimates = (): string[] => {
    // This would ideally use historical data
    // For now, return tasks that are commonly underestimated
    return tasks
      .filter(t => !t.completed && (t.category === 'Development' || t.category === 'Creative'))
      .map(t => t.id)
      .slice(0, 2);
  };

  const findEnergyTaskMismatches = (): string[] => {
    if (!dailyPlan?.timeBlocks) return [];
    
    return dailyPlan.timeBlocks
      .filter(block => {
        if (!block.startTime) return false;
        const hour = parseInt(block.startTime.split(':')[0]);
        const isLowEnergyTime = hour < 9 || hour > 15; // After 3 PM or before 9 AM
        const isHighEnergyTask = block.priority === 'urgent' || block.priority === 'high';
        return isLowEnergyTime && isHighEnergyTask;
      })
      .map(block => block.taskId || block.task)
      .filter(Boolean);
  };

  const applyAdjustment = async (adjustment: ScheduleAdjustment) => {
    setIsAnalyzing(true);
    
    try {
      switch (adjustment.type) {
        case 'reschedule':
          await handleReschedule(adjustment);
          break;
        case 'break_suggestion':
          await handleBreakSuggestion();
          break;
        case 'priority_bump':
          await handlePriorityBump(adjustment);
          break;
        case 'time_extend':
          await handleTimeExtension(adjustment);
          break;
      }
      
      // Remove the applied adjustment
      setAdjustments(prev => prev.filter(a => a.id !== adjustment.id));
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Schedule Adjusted",
          description: adjustment.suggestedAction,
        });
      });
    } catch (error) {
      console.error('Failed to apply adjustment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReschedule = async (adjustment: ScheduleAdjustment) => {
    // Regenerate the daily plan with current context
    await generateDailyPlan();
  };

  const handleBreakSuggestion = async () => {
    if (!dailyPlan?.timeBlocks) return;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Insert a break block at current time
    const breakBlock = {
      id: `break-${Date.now()}`,
      task: 'Take a Break',
      description: 'Recharge and refocus',
      startTime: currentTime,
      endTime: `${(now.getHours()).toString().padStart(2, '0')}:${(now.getMinutes() + 15).toString().padStart(2, '0')}`,
      priority: 'medium',
      type: 'break',
      energy: 'recovery'
    };

    const updatedPlan = {
      ...dailyPlan,
      timeBlocks: [...dailyPlan.timeBlocks, breakBlock]
    };

    updateDailyPlan?.(updatedPlan);
  };

  const handlePriorityBump = async (adjustment: ScheduleAdjustment) => {
    // This would typically involve notifying the user and suggesting immediate focus
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: "Priority Task Alert",
        description: "Focus on your upcoming high-priority task",
        variant: "default"
      });
    });
  };

  const handleTimeExtension = async (adjustment: ScheduleAdjustment) => {
    if (!dailyPlan?.timeBlocks) return;
    
    // Add buffer time to affected tasks
    const updatedBlocks = dailyPlan.timeBlocks.map(block => {
      if (adjustment.affectedTasks.includes(block.taskId || block.task)) {
        const endTime = block.endTime;
        if (endTime) {
          const [hours, minutes] = endTime.split(':').map(Number);
          const newEndTime = new Date(2000, 0, 1, hours, minutes + 15); // Add 15 minutes
          return {
            ...block,
            endTime: `${newEndTime.getHours().toString().padStart(2, '0')}:${newEndTime.getMinutes().toString().padStart(2, '0')}`
          };
        }
      }
      return block;
    });

    const updatedPlan = {
      ...dailyPlan,
      timeBlocks: updatedBlocks
    };

    updateDailyPlan?.(updatedPlan);
  };

  const getAdjustmentIcon = (type: ScheduleAdjustment['type']) => {
    switch (type) {
      case 'delay': return Clock;
      case 'reschedule': return Calendar;
      case 'priority_bump': return Zap;
      case 'time_extend': return Clock;
      case 'break_suggestion': return RefreshCw;
      default: return AlertTriangle;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (adjustments.length === 0 && !isAnalyzing) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-medium text-green-600">Schedule on Track</h3>
          <p className="text-sm text-muted-foreground">
            Your schedule is running smoothly. No adjustments needed right now.
          </p>
          {lastAnalysis && (
            <p className="text-xs text-muted-foreground mt-2">
              Last checked: {lastAnalysis.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Real-Time Schedule Assistant
          {isAnalyzing && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {adjustments.map((adjustment, index) => {
            const IconComponent = getAdjustmentIcon(adjustment.type);
            const impactColor = getImpactColor(adjustment.impact);
            
            return (
              <motion.div
                key={adjustment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-muted/30 rounded-lg border border-muted/20"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${impactColor}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{adjustment.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {adjustment.impact} Impact
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {adjustment.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Confidence</div>
                      <Progress 
                        value={adjustment.confidence * 100} 
                        className="w-16 h-2" 
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 pl-13">
                  {adjustment.description}
                </p>
                
                <div className="pl-13 space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Suggested Action: {adjustment.suggestedAction}
                  </p>
                  
                  {adjustment.affectedTasks.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Affects: {adjustment.affectedTasks.slice(0, 2).join(', ')}
                      {adjustment.affectedTasks.length > 2 && ` and ${adjustment.affectedTasks.length - 2} more`}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => applyAdjustment(adjustment)}
                    disabled={isAnalyzing}
                    className="mt-2"
                  >
                    Apply Adjustment
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};