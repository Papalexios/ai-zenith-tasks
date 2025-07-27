import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { TaskItem } from './TaskItem';
import { MobileBottomNav } from './MobileBottomNav';
import { AIInsights } from './AIInsights';
import { ProductivityOracle } from './ProductivityOracle';
import { DailyPlanModal } from './DailyPlanModal';
import { AnalyticsModal } from './AnalyticsModal';
import { FocusTimer } from './FocusTimer';
import { 
  Plus, 
  Sparkles, 
  Brain,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  X,
  Filter,
  Search
} from 'lucide-react';

export function UltraMobileTaskApp() {
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar' | 'analytics'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { 
    addTask, 
    tasks, 
    filter, 
    setFilter, 
    getProductivityStats
  } = useTaskStore();

  const stats = getProductivityStats();
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    
    const matchesFilter = (() => {
      switch (filter) {
        case 'completed':
          return task.completed;
        case 'pending':
          return !task.completed;
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          return task.dueDate === today && !task.completed;
        case 'all':
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  });

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      await addTask(newTask, true);
      setNewTask('');
      setShowAddTask(false);
      toast({
        title: "Task Added",
        description: "AI is enhancing your task...",
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
    { value: 'all', label: 'All Tasks', icon: Target, count: tasks.length },
    { value: 'pending', label: 'Active', icon: Clock, count: tasks.filter(t => !t.completed).length },
    { value: 'completed', label: 'Done', icon: CheckCircle, count: tasks.filter(t => t.completed).length },
    { value: 'today', label: 'Today', icon: Calendar, count: tasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate === today && !t.completed;
    }).length }
  ];

  // Auto-hide add task panel on mobile after inactivity
  useEffect(() => {
    if (showAddTask && isMobile && !newTask) {
      const timer = setTimeout(() => {
        setShowAddTask(false);
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [showAddTask, isMobile, newTask]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 overflow-x-hidden">
      {/* Ultra-Mobile Header */}
      <div className="sticky top-0 z-50 safe-area-top">
        <div className="glass-card border-b-0 rounded-none backdrop-blur-xl bg-background/95">
          <div className="p-3 sm:p-4">
            {/* Top Row - Logo & Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black bg-gradient-primary bg-clip-text text-transparent">
                    AI Zenith
                  </h1>
                  <div className="text-xs text-muted-foreground">
                    {stats.totalTasks} tasks
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-2">
                <div className="text-center">
                  <div className="text-sm sm:text-base font-bold text-primary">{stats.productivityScore}%</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base font-bold text-accent">{stats.completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-muted/50 rounded-xl"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(option.value as any)}
                  className={`flex-shrink-0 h-8 px-3 gap-1.5 text-xs rounded-full transition-all duration-200 ${
                    filter === option.value 
                      ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <option.icon className="h-3 w-3" />
                  <span>{option.label}</span>
                  {option.count > 0 && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 text-xs bg-background/50 text-foreground">
                      {option.count > 9 ? '9+' : option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-4 pb-24 space-y-4">
        {/* AI Add Task Panel */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mobile-card border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold">Add Task with AI</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddTask(false)}
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Describe your task naturally..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    className="h-10 text-sm bg-background/50 border-muted/50 rounded-lg"
                    autoFocus
                  />
                  <Button 
                    onClick={handleAddTask}
                    disabled={!newTask.trim()}
                    size="sm"
                    className="w-full h-8 gap-1.5 text-xs rounded-lg bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="h-3 w-3" />
                    Create with AI
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Insights - Mobile Optimized */}
        <div className="grid gap-3">
          <AIInsights />
          
          {/* Productivity Oracle - Compact */}
          <div className="lg:hidden">
            <ProductivityOracle />
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="mobile-card text-center py-8">
              {searchQuery ? (
                <div className="space-y-3">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-sm">No tasks found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search or filter
                    </p>
                  </div>
                </div>
              ) : filter === 'completed' ? (
                <div className="space-y-3">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-sm">No completed tasks</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Complete some tasks to see them here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-sm">No tasks yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tap the + button to add your first task
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskItem task={task} compact={isMobile} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Modals */}
        <DailyPlanModal />
        <AnalyticsModal />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeView={activeView}
        onViewChange={setActiveView}
        onAddTask={() => setShowAddTask(true)}
        taskCount={tasks.filter(t => !t.completed).length}
      />
      
      {/* Focus Timer */}
      <FocusTimer />
    </div>
  );
}