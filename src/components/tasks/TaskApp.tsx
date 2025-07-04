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
  Circle
} from 'lucide-react';

export function TaskApp() {
  const [newTask, setNewTask] = useState('');
  const [showAIDemo, setShowAIDemo] = useState(true);
  const { toast } = useToast();
  
  const { 
    addTask, 
    tasks, 
    isLoading, 
    filter, 
    setFilter, 
    getProductivityStats,
    getAIInsights 
  } = useTaskStore();

  const stats = getProductivityStats();

  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newTask.trim()) return;
    
    try {
      await addTask(newTask, true); // Use AI by default
      setNewTask('');
      setShowAIDemo(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Target },
    { value: 'pending', label: 'Pending', icon: Circle },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'today', label: 'Today', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="glass-card border-b-0 rounded-none">
        <div className="container-width py-8">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-8">
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
      </div>

      <div className="container-width py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Task Input */}
            <div className="minimal-card p-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold">Add New Task with AI</h2>
                  </div>
                </div>
                
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Describe your task naturally... (e.g., 'Plan team meeting for tomorrow')"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="modern-input h-14 text-base pl-6 pr-32"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit"
                      disabled={!newTask.trim() || isLoading}
                      variant="glow"
                      size="lg"
                      className="absolute right-2 top-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add with AI
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {showAIDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">AI Magic</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Try: "Plan birthday party for mom next weekend" and watch AI break it into actionable steps!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(option.value as any)}
                      className={`gap-2 transition-all duration-300 ${
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights />
            
            {/* Productivity Stats */}
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

            {/* Quick Actions */}
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
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-12 hover:bg-muted/50 transition-all duration-300"
                    onClick={() => {
                      toast({
                        title: "Analytics Coming Soon",
                        description: "Advanced analytics dashboard is being developed.",
                      });
                    }}
                  >
                    <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">View Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-12 hover:bg-muted/50 transition-all duration-300"
                    onClick={() => {
                      getAIInsights();
                      toast({
                        title: "AI Insights Updated",
                        description: "Check the AI Insights panel for new recommendations.",
                      });
                    }}
                  >
                    <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">AI Coaching Session</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}