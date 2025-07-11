import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

export const PremiumStatsCard = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === today);
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const todayRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
    
    return {
      total,
      completed,
      urgent,
      high,
      completionRate,
      todayTasks: todayTasks.length,
      todayCompleted,
      todayRate
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Overall Progress</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.completionRate}%</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{stats.completed}/{stats.total} completed</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
          <Progress value={stats.completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Today's Progress</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.todayRate}%</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{stats.todayCompleted}/{stats.todayTasks} today</p>
            </div>
            <Target className="h-8 w-8 text-emerald-500" />
          </div>
          <Progress value={stats.todayRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Urgent Tasks</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.urgent}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Needs attention</p>
            </div>
            <Zap className="h-8 w-8 text-red-500" />
          </div>
          {stats.urgent > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">Action Required</Badge>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">High Priority</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.high}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Important items</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          {stats.high > 0 && (
            <Badge variant="secondary" className="mt-2 text-xs">Schedule Soon</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};