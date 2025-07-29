import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';
import { Brain, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardAIInsights() {
  const { insights, tasks, getAIInsights } = useTaskStore();
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Rotate insights every 8 seconds
  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [insights.length]);

  // Fetch insights on mount if tasks exist
  useEffect(() => {
    if (tasks.length > 0 && insights.length === 0) {
      getAIInsights();
    }
  }, [tasks.length, insights.length, getAIInsights]);

  const refreshInsights = async () => {
    setIsLoading(true);
    try {
      await getAIInsights();
    } finally {
      setIsLoading(false);
    }
  };

  // Quick insights based on task data
  const getQuickInsight = () => {
    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate < today && !task.completed;
    });
    
    const urgentTasks = tasks.filter(task => task.priority === 'urgent' && !task.completed);
    const completedToday = tasks.filter(task => {
      if (!task.completed) return false;
      const today = new Date().toDateString();
      return new Date(task.createdAt).toDateString() === today;
    });

    if (overdueTasks.length > 0) {
      return {
        type: 'warning',
        icon: AlertCircle,
        text: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Focus on these first!`,
        color: 'text-orange-600'
      };
    }
    
    if (urgentTasks.length > 0) {
      return {
        type: 'urgent',
        icon: Zap,
        text: `${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''} need${urgentTasks.length === 1 ? 's' : ''} your attention today.`,
        color: 'text-red-600'
      };
    }
    
    if (completedToday.length > 0) {
      return {
        type: 'success',
        icon: TrendingUp,
        text: `Great progress! You've completed ${completedToday.length} task${completedToday.length > 1 ? 's' : ''} today.`,
        color: 'text-green-600'
      };
    }
    
    return {
      type: 'default',
      icon: Brain,
      text: tasks.length > 0 ? "Your schedule looks balanced. Consider using AI Daily Plan for optimization!" : "Add some tasks to get AI-powered insights.",
      color: 'text-primary'
    };
  };

  const currentInsight = insights.length > 0 ? insights[currentInsightIndex] : null;
  const quickInsight = getQuickInsight();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity': return Brain;
      case 'optimization': return Zap;
      case 'warning': return AlertCircle;
      default: return Brain;
    }
  };

  const InsightIcon = currentInsight ? getInsightIcon(currentInsight.type) : quickInsight.icon;

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <InsightIcon className={`h-4 w-4 ${currentInsight?.type === 'warning' ? 'text-orange-600' : currentInsight ? 'text-primary' : quickInsight.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-foreground">
                  {currentInsight ? 'AI Insight' : 'Quick Insight'}
                </h3>
                {insights.length > 1 && (
                  <div className="flex gap-1">
                    {insights.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentInsightIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentInsight?.title || quickInsight.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {currentInsight?.description || quickInsight.text}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Brain className={`h-3.5 w-3.5 ${isLoading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
        
        {currentInsight && (
          <div className="mt-3 text-xs text-muted-foreground/60">
            Powered by AI • Updates automatically
          </div>
        )}
      </CardContent>
    </Card>
  );
}