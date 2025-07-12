import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskList } from './TaskList';
import { KanbanBoard } from './KanbanBoard';
import { MobileBottomNav } from './MobileBottomNav';
import { AIInsights } from './AIInsights';
import { DailyPlanModal } from './DailyPlanModal';
import { AnalyticsModal } from './AnalyticsModal';
import { FocusTimer } from './FocusTimer';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Sparkles, 
  Filter, 
  Calendar,
  BarChart3,
  Brain,
  Target,
  CheckCircle,
  Circle,
  Eye,
  Layout
} from 'lucide-react';

export function TaskApp() {
  const [newTask, setNewTask] = useState('');
  const [showAIDemo, setShowAIDemo] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar' | 'analytics'>('kanban');
  const [showAddTask, setShowAddTask] = useState(false);
  const { toast } = useToast();
  
  const { 
    addTask, 
    tasks, 
    isLoading, 
    filter, 
    setFilter, 
    getProductivityStats,
    getAIInsights,
    dailyPlan 
  } = useTaskStore();

  const stats = getProductivityStats();

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newTask.trim()) return;
    
    await addTask(newTask, true); // Use AI by default
    setNewTask('');
    setShowAIDemo(false);
  };

  const filterOptions = [
    { value: 'all', label: 'All', icon: Target },
    { value: 'pending', label: 'Pending', icon: Circle },
    { value: 'completed', label: 'Done', icon: CheckCircle },
    { value: 'today', label: 'Today', icon: Calendar }
  ];

  const viewOptions = [
    { value: 'kanban', label: 'Board', icon: Layout },
    { value: 'list', label: 'List', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/60 to-muted/30 overflow-x-hidden pb-28 lg:pb-0">
      {/* Mobile-First Header */}
      <div className="glass-card border-b-0 rounded-none backdrop-blur-xl bg-background/90 sticky top-0 z-40 safe-area-top">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout - Ultra Clean */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-hero rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow-primary">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black bg-gradient-hero bg-clip-text text-transparent leading-tight">
                    AI Zenith
                  </h1>
                  <div className="text-xs text-muted-foreground font-medium">
                    {tasks.filter(t => !t.completed).length} active tasks
                  </div>
                </div>
              </div>
              
              {/* Minimal View Toggle */}
              <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                {viewOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView(option.value as any)}
                    className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                      activeView === option.value 
                        ? 'bg-background text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <option.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Clean Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-glow">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  AI Task Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                  Premium productivity workspace
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Quick Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.productivityScore}%</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                {viewOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={activeView === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView(option.value as any)}
                    className={`gap-2 ${
                      activeView === option.value 
                        ? 'bg-gradient-primary text-white shadow-glow-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Mobile-First Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last space-y-3 sm:space-y-4">
            {/* Mobile Stats - Horizontal scroll on small screens */}
            <div className="lg:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex-shrink-0 minimal-card p-3 w-24">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{stats.totalTasks}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
                <div className="flex-shrink-0 minimal-card p-3 w-24">
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">{stats.productivityScore}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
                <div className="flex-shrink-0 minimal-card p-3 w-24">
                  <div className="text-center">
                    <div className="text-lg font-bold text-secondary">{stats.completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                </div>
                <div className="flex-shrink-0 minimal-card p-3 w-24">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{stats.aiEnhancedTasks}</div>
                    <div className="text-xs text-muted-foreground">AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights - Mobile Optimized */}
            <div className="block lg:block">
              <AIInsights />
            </div>
            
            {/* Desktop Productivity Card */}
            <div className="hidden lg:block minimal-card p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-semibold">Productivity</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <span className="font-bold">{stats.productivityScore}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-accent h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.productivityScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{stats.completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">{stats.aiEnhancedTasks}</div>
                      <div className="text-xs text-muted-foreground">AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Mobile Compact */}
            <div className="minimal-card p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">Actions</h3>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <DailyPlanModal>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 sm:h-10 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Daily Plan</span>
                    </Button>
                  </DailyPlanModal>
                  
                  <AnalyticsModal>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 sm:h-10 text-xs sm:text-sm">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Analytics</span>
                    </Button>
                  </AnalyticsModal>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Mobile Optimized */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Mobile AI Task Input - Slide-up modal style */}
            {(showAddTask || !('ontouchstart' in window)) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="minimal-card p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">Add Task with AI</h2>
                    {showAddTask && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddTask(false)}
                        className="ml-auto lg:hidden w-8 h-8 p-0 rounded-full"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  
                  <form onSubmit={handleAddTask} className="space-y-3 sm:space-y-4">
                    <Input
                      placeholder="Describe your task naturally..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="h-12 sm:h-14 text-sm sm:text-base px-4 sm:px-6 bg-background/50 border-2 border-muted/50 rounded-xl transition-all duration-300 focus:border-primary/50 focus:shadow-glow-primary"
                    />
                    <Button 
                      type="submit"
                      disabled={!newTask.trim()}
                      variant="glow"
                      size="lg"
                      className="h-12 sm:h-12 px-6 sm:px-8 gap-2 font-bold transition-all duration-300 hover:scale-[1.02] w-full rounded-xl text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      Create with AI
                    </Button>
                  </form>
                  
                  {showAIDemo && (
                    <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 p-3 sm:p-4 rounded-xl">
                      <strong className="text-primary">Try:</strong> "Plan birthday party" or "Review project docs"
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Filters - Desktop only */}
            <div className="hidden lg:block glass-card p-4 border border-muted/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Filter:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(option.value as any)}
                      className={`gap-2 transition-all duration-300 ${
                        filter === option.value 
                          ? 'bg-gradient-primary text-white shadow-glow-primary border-0' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Views */}
            {activeView === 'list' && <TaskList />}
            {activeView === 'kanban' && <KanbanBoard />}
          </div>
        </div>

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