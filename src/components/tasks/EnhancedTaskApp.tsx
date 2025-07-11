import React, { useState } from 'react';
import { Calendar, Plus, Zap, BarChart3, Target, Clock, AlertCircle, CheckCircle2, X, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore, Task } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TaskList } from './TaskList';
import { AIInsights } from './AIInsights';
import { DailyPlanModal } from './DailyPlanModal';
import { AnalyticsModal } from './AnalyticsModal';
import { FocusTimer } from './FocusTimer';
import { TaskEditModal } from './TaskEditModal';
import { CalendarView } from './CalendarView';
import { PremiumStatsCard } from './PremiumStatsCard';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import { toast } from '@/hooks/use-toast';

export const EnhancedTaskApp = () => {
  const [newTask, setNewTask] = useState('');
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    addTask,
    isLoading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    insights,
    focusTimer,
    addToGoogleCalendar,
    deleteTask,
    updateTask,
    syncStatus,
    syncError,
    forceSyncAllTasks,
    clearSyncError
  } = useTaskStore();

  const { syncAllTasks, isSyncing } = useGoogleCalendarSync();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await addTask(newTask, true); // Always use AI for premium experience
      setNewTask('');
      toast({
        title: "Task Added Successfully",
        description: "AI is enhancing your task with premium details...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Target },
    { value: 'pending', label: 'Active', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle2 },
    { value: 'today', label: 'Due Today', icon: Calendar }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                AI Task Manager Pro
              </h1>
              <p className="text-muted-foreground mt-2">
                Premium productivity powered by advanced AI
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDailyPlan(true)}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Daily Plan</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncAllTasks(false)}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isSyncing ? 'Syncing...' : 'Sync All'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sync Status Alert */}
        <AnimatePresence>
          {syncError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{syncError}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearSyncError}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Stats */}
        <PremiumStatsCard />

        {/* Task Input */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Add Premium Task with AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Describe your task naturally (e.g., 'Plan team meeting for next Friday')"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 h-12 text-base"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!newTask.trim() || isLoading}
                  className="h-12 px-6 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Add with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filters & Sort */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(option.value as any)}
                    className="gap-2"
                  >
                    <option.icon className="h-3 w-3" />
                    {option.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {showCalendar ? (
            <CalendarView />
          ) : (
            <>
              <TaskList />
              <AIInsights />
            </>
          )}
        </div>

        {/* Focus Timer */}
        {focusTimer.isActive && (
          <div className="fixed bottom-6 right-6 z-50">
            <FocusTimer />
          </div>
        )}

        {/* Modals */}
        <DailyPlanModal 
          open={showDailyPlan} 
          onOpenChange={setShowDailyPlan} 
        />
        
        <AnalyticsModal 
          open={showAnalytics} 
          onOpenChange={setShowAnalytics}
        />
        
        {editingTask && (
          <TaskEditModal task={editingTask}>
            <div></div>
          </TaskEditModal>
        )}
      </div>
    </div>
  );
};