import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskList } from './TaskList';
import { AIInsights } from './AIInsights';
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
  
  const { 
    addTask, 
    tasks, 
    isLoading, 
    filter, 
    setFilter, 
    getProductivityStats 
  } = useTaskStore();

  const stats = getProductivityStats();

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    await addTask(newTask, true); // Use AI by default
    setNewTask('');
    setShowAIDemo(false);
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Target },
    { value: 'pending', label: 'Pending', icon: Circle },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'today', label: 'Today', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-width py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Task Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Powered by 5 AI models working together
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.productivityScore}%</div>
                  <div className="text-xs text-muted-foreground">Productivity</div>
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
            <Card className="border-2 border-primary/20 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Add New Task with AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Describe your task naturally... (e.g., 'Plan team meeting for next week')"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleAddTask}
                    disabled={!newTask.trim() || isLoading}
                    variant="glow"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        AI Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add with AI
                      </>
                    )}
                  </Button>
                </div>
                
                {showAIDemo && (
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Magic</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Try typing something like "Plan a birthday party for mom next weekend" and watch AI break it down into actionable steps!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
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
            </div>

            {/* Task List */}
            <TaskList />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights />
            
            {/* Productivity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Your Productivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">{stats.productivityScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.productivityScore}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{stats.completedTasks}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary">{stats.aiEnhancedTasks}</div>
                    <div className="text-xs text-muted-foreground">AI Enhanced</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Generate Daily Plan
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Coaching Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}