import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskList } from './TaskList';
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
  Eye
} from 'lucide-react';

export function TaskApp() {
  const [newTask, setNewTask] = useState('');
  const [showAIDemo, setShowAIDemo] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile Header */}
      <div className="glass-card border-b-0 rounded-none">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Mobile Layout */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    AI Task Manager
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    AI-powered productivity
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="h-10 w-10 p-0"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Stats Row */}
            <div className="grid grid-cols-3 gap-4 p-4 glass-card rounded-2xl">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-accent">{stats.productivityScore}%</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-secondary">{stats.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
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
                  Powered by 5 AI models working together
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{stats.productivityScore}%</div>
                <div className="text-sm text-muted-foreground">Productivity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* AI Task Input - Mobile Optimized */}
            <div className="minimal-card p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold">Add New Task with AI</h2>
                  </div>
                </div>
                
                <form onSubmit={handleAddTask} className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      placeholder="Describe your task naturally..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="h-12 sm:h-14 text-sm sm:text-base px-4 sm:px-6 flex-1 transition-all duration-300 focus:shadow-glow"
                    />
                    <Button 
                      type="submit"
                      disabled={!newTask.trim()}
                      variant="glow"
                      size="lg"
                      className="h-12 sm:h-14 px-6 sm:px-8 gap-2 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add with AI</span>
                      <span className="sm:hidden">Add Task</span>
                    </Button>
                  </div>
                </form>
                
                {showAIDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-3 sm:p-4 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium text-primary">AI Magic</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Try: "Plan birthday party" and watch AI create actionable steps!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Mobile-First Filters */}
            <div className="glass-card p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(option.value as any)}
                      className={`gap-1.5 sm:gap-2 transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 flex-shrink-0 ${
                        filter === option.value 
                          ? 'shadow-glow' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <option.icon className="h-3 w-3" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task List */}
            <TaskList />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block space-y-6">
            <AIInsights />
            
            <div className="minimal-card p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Your Productivity</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-bold text-lg">{stats.productivityScore}%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-accent h-3 rounded-full shadow-glow-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.productivityScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-primary">{stats.completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-secondary">{stats.aiEnhancedTasks}</div>
                      <div className="text-xs text-muted-foreground">AI Enhanced</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="minimal-card p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-secondary rounded-xl flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                
                <div className="space-y-3">
                  <DailyPlanModal>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-muted/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Generate Daily Plan</span>
                    </Button>
                  </DailyPlanModal>
                  
                  {dailyPlan && (
                    <DailyPlanModal>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-muted/50 transition-all duration-300 border border-primary/20">
                        <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">View Today's Plan</span>
                          <span className="text-xs text-muted-foreground">
                            {dailyPlan.timeBlocks?.length || 0} tasks scheduled
                          </span>
                        </div>
                      </Button>
                    </DailyPlanModal>
                  )}
                  
                  <AnalyticsModal>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-muted/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">View Analytics</span>
                    </Button>
                  </AnalyticsModal>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Panel */}
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowSidebar(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-background border-l shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(false)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <AIInsights />
                  
                  <div className="minimal-card p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <h3 className="font-semibold">Your Productivity</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Completion Rate</span>
                          <span className="font-bold">{stats.productivityScore}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className="bg-gradient-accent h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.productivityScore}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                        <div className="text-center space-y-1">
                          <div className="text-lg font-bold text-primary">{stats.completedTasks}</div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-lg font-bold text-secondary">{stats.aiEnhancedTasks}</div>
                          <div className="text-xs text-muted-foreground">AI Enhanced</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="minimal-card p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-secondary rounded-lg flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                        <h3 className="font-semibold">Quick Actions</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <DailyPlanModal>
                          <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm hover:bg-muted/50 transition-all duration-300">
                            <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
                              <Calendar className="h-3 w-3 text-white" />
                            </div>
                            <span>Generate Daily Plan</span>
                          </Button>
                        </DailyPlanModal>
                        
                        {dailyPlan && (
                          <DailyPlanModal>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm hover:bg-muted/50 transition-all duration-300 border border-primary/20">
                              <div className="w-6 h-6 bg-gradient-accent rounded-md flex items-center justify-center">
                                <Eye className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span>View Today's Plan</span>
                                <span className="text-xs text-muted-foreground">
                                  {dailyPlan.timeBlocks?.length || 0} tasks scheduled
                                </span>
                              </div>
                            </Button>
                          </DailyPlanModal>
                        )}
                        
                        <AnalyticsModal>
                          <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm hover:bg-muted/50 transition-all duration-300">
                            <div className="w-6 h-6 bg-gradient-accent rounded-md flex items-center justify-center">
                              <BarChart3 className="h-3 w-3 text-white" />
                            </div>
                            <span>View Analytics</span>
                          </Button>
                        </AnalyticsModal>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Focus Timer */}
      <FocusTimer />
    </div>
  );
}