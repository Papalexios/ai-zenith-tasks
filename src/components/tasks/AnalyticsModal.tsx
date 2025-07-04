import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface AnalyticsModalProps {
  children: React.ReactNode;
}

export function AnalyticsModal({ children }: AnalyticsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, getProductivityStats } = useTaskStore();
  const stats = getProductivityStats();

  const categoryBreakdown = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityBreakdown = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completionRate = tasks.length > 0 ? (stats.completedTasks / tasks.length) * 100 : 0;
  const aiEnhancementRate = tasks.length > 0 ? (stats.aiEnhancedTasks / tasks.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Productivity Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{stats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">{stats.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{stats.tasksThisWeek}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-semibold">{completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>
                <div className="pt-2 text-sm text-muted-foreground">
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Enhancement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI-Enhanced Tasks</span>
                    <span className="font-semibold">{aiEnhancementRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={aiEnhancementRate} className="h-3" />
                </div>
                <div className="pt-2 text-sm text-muted-foreground">
                  {stats.aiEnhancedTasks} of {stats.totalTasks} tasks enhanced by AI
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdowns */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / tasks.length) * 100}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(priorityBreakdown).map(([priority, count]) => {
                    const priorityColors = {
                      urgent: 'bg-red-500',
                      high: 'bg-orange-500',
                      medium: 'bg-yellow-500',
                      low: 'bg-green-500'
                    };
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{priority}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / tasks.length) * 100}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="text-sm">
                    <strong>Productivity Score:</strong> {stats.productivityScore}% 
                    {stats.productivityScore >= 80 ? ' - Excellent work!' : 
                     stats.productivityScore >= 60 ? ' - Good progress!' : 
                     ' - Room for improvement!'}
                  </div>
                </div>
                
                {stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <div className="text-sm">
                      <strong>Attention needed:</strong> You have {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="text-sm">
                    <strong>AI Enhancement:</strong> {aiEnhancementRate.toFixed(0)}% of your tasks are AI-enhanced for better organization
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Close Analytics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}