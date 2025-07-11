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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/60 to-muted/30 overflow-x-hidden">
      {/* Ultra Modern Mobile Header */}
      <div className="glass-card border-b-0 rounded-none backdrop-blur-xl bg-background/80 sticky top-0 z-40">
        <div className="px-6 py-6">
          {/* Mobile Layout */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-glow-primary relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl animate-pulse-slow"></div>
                  <Brain className="h-7 w-7 text-white relative z-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-hero bg-clip-text text-transparent tracking-tight">
                    AI Zenith
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    Premium AI Workspace
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="h-12 w-12 p-0 rounded-xl hover:bg-muted/50 transition-all duration-300"
              >
                <BarChart3 className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Ultra Modern Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300 group">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-black text-primary group-hover:scale-105 transition-transform duration-300">{stats.totalTasks}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</div>
                </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-accent/10 hover:border-accent/20 transition-all duration-300 group">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-black text-accent group-hover:scale-105 transition-transform duration-300">{stats.productivityScore}%</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</div>
                </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-secondary/10 hover:border-secondary/20 transition-all duration-300 group">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-black text-secondary group-hover:scale-105 transition-transform duration-300">{stats.completedTasks}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Done</div>
                </div>
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

      <div className="px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ultra Modern AI Task Input */}
            <div className="minimal-card p-8 border border-primary/10 hover:border-primary/20 transition-all duration-500 group">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl animate-pulse-slow"></div>
                      <Sparkles className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black bg-gradient-hero bg-clip-text text-transparent">Add New Task with AI</h2>
                  </div>
                </div>
                
                <form onSubmit={handleAddTask} className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <Input
                      placeholder="Describe your task naturally... (any language)"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="h-16 text-lg px-8 bg-background/50 border-2 border-muted/50 rounded-2xl transition-all duration-300 focus:border-primary/50 focus:shadow-glow-primary focus:bg-background/80 placeholder:text-muted-foreground/70"
                    />
                    <Button 
                      type="submit"
                      disabled={!newTask.trim()}
                      variant="glow"
                      size="lg"
                      className="h-16 px-10 gap-3 text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full rounded-2xl shadow-glow-primary"
                    >
                      <Plus className="h-6 w-6" />
                      <span>Create with AI Magic</span>
                    </Button>
                  </div>
                </form>
                
                {showAIDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border border-primary/20 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                      <span className="text-base font-bold text-primary">AI Magic Demo</span>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Try: "Plan birthday party" or "Αφαίρεση των cherries από το σώμα μου" - AI works in any language!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Ultra Modern Filters */}
            <div className="glass-card p-6 border border-muted/20 rounded-2xl">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">Filter Tasks</span>
                </div>
                <div className="flex gap-3 flex-wrap overflow-x-auto">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? "default" : "ghost"}
                      size="lg"
                      onClick={() => setFilter(option.value as any)}
                      className={`gap-3 transition-all duration-300 text-base font-semibold px-6 h-12 rounded-xl ${
                        filter === option.value 
                          ? 'shadow-glow-primary bg-gradient-primary text-white border-0' 
                          : 'hover:bg-muted/50 hover:scale-105'
                      }`}
                    >
                      <option.icon className="h-5 w-5" />
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