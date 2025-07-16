import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/store/taskStore';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Circle,
  Brain,
  Sparkles,
  Timer,
  Settings
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'tasks' | 'filters' | 'navigation' | 'ai' | 'productivity';
  keywords: string[];
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const {
    addTask,
    setFilter,
    generateDailyPlan,
    getAIInsights,
    startFocusTimer,
    tasks,
    filter
  } = useTaskStore();

  const commands = useMemo<Command[]>(() => [
    // Task Management
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task with AI enhancement',
      icon: Plus,
      action: () => {
        const taskInput = prompt('Enter your task:');
        if (taskInput?.trim()) {
          addTask(taskInput.trim(), true);
          toast({ title: 'Task Created', description: 'New task added with AI enhancement' });
        }
      },
      category: 'tasks',
      keywords: ['new', 'create', 'add', 'task']
    },
    
    // Filters
    {
      id: 'filter-all',
      title: 'Show All Tasks',
      description: 'View all tasks',
      icon: Target,
      action: () => {
        setFilter('all');
        toast({ title: 'Filter: All Tasks' });
      },
      category: 'filters',
      keywords: ['all', 'tasks', 'filter', 'show']
    },
    {
      id: 'filter-pending',
      title: 'Show Pending Tasks',
      description: 'View only incomplete tasks',
      icon: Circle,
      action: () => {
        setFilter('pending');
        toast({ title: 'Filter: Pending Tasks' });
      },
      category: 'filters',
      keywords: ['pending', 'incomplete', 'todo', 'filter']
    },
    {
      id: 'filter-completed',
      title: 'Show Completed Tasks',
      description: 'View only completed tasks',
      icon: CheckCircle,
      action: () => {
        setFilter('completed');
        toast({ title: 'Filter: Completed Tasks' });
      },
      category: 'filters',
      keywords: ['completed', 'done', 'finished', 'filter']
    },
    {
      id: 'filter-today',
      title: 'Show Today\'s Tasks',
      description: 'View tasks due today',
      icon: Calendar,
      action: () => {
        setFilter('today');
        toast({ title: 'Filter: Today\'s Tasks' });
      },
      category: 'filters',
      keywords: ['today', 'due', 'filter', 'calendar']
    },
    
    // AI Features
    {
      id: 'daily-plan',
      title: 'Generate Daily Plan',
      description: 'Create an AI-optimized daily schedule',
      icon: Brain,
      action: () => {
        generateDailyPlan();
        toast({ title: 'Generating Daily Plan', description: 'AI is creating your optimized schedule' });
      },
      category: 'ai',
      keywords: ['daily', 'plan', 'schedule', 'ai', 'optimize']
    },
    {
      id: 'ai-insights',
      title: 'Get AI Insights',
      description: 'Analyze productivity patterns',
      icon: Sparkles,
      action: () => {
        getAIInsights();
        toast({ title: 'Getting AI Insights', description: 'Analyzing your productivity patterns' });
      },
      category: 'ai',
      keywords: ['insights', 'ai', 'analysis', 'patterns', 'productivity']
    },
    
    // Productivity
    {
      id: 'focus-timer',
      title: 'Start Focus Timer',
      description: 'Begin a focused work session',
      icon: Timer,
      action: () => {
        const firstPendingTask = tasks.find(t => !t.completed);
        if (firstPendingTask) {
          startFocusTimer(firstPendingTask.id);
          toast({ title: 'Focus Timer Started', description: `Focusing on: ${firstPendingTask.title}` });
        } else {
          toast({ title: 'No Tasks Available', description: 'Add a task to start focusing' });
        }
      },
      category: 'productivity',
      keywords: ['focus', 'timer', 'pomodoro', 'concentrate', 'work']
    },
    
    // Quick Actions for Recent Tasks
    ...tasks.slice(0, 5).map(task => ({
      id: `task-${task.id}`,
      title: `Toggle: ${task.title}`,
      description: task.completed ? 'Mark as incomplete' : 'Mark as complete',
      icon: task.completed ? Circle : CheckCircle,
      action: () => {
        // This would need toggleTask implementation
        toast({ 
          title: task.completed ? 'Task Reopened' : 'Task Completed',
          description: task.title 
        });
      },
      category: 'tasks' as const,
      keywords: ['toggle', 'complete', 'task', task.title.toLowerCase()]
    }))
  ], [addTask, setFilter, generateDailyPlan, getAIInsights, startFocusTimer, tasks]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter(command => 
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.includes(searchLower))
    );
  }, [commands, search]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onOpenChange(false);
          setSearch('');
          setSelectedIndex(0);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        setSearch('');
        setSelectedIndex(0);
        break;
    }
  }, [filteredCommands, selectedIndex, onOpenChange]);

  const categoryColors = {
    tasks: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    filters: 'bg-green-500/10 text-green-600 border-green-500/20',
    navigation: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    ai: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    productivity: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-xl border border-border/50">
        <div className="border-b border-border/30 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands... (try 'new task', 'filter', 'focus')"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 h-12 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-2">
          <AnimatePresence>
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-4 h-auto text-left transition-all duration-200 ${
                          index === selectedIndex
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          command.action();
                          onOpenChange(false);
                          setSearch('');
                          setSelectedIndex(0);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-lg ${
                            index === selectedIndex
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted/50'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{command.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {command.description}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${categoryColors[command.category]}`}
                          >
                            {command.category}
                          </Badge>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="border-t border-border/30 p-3 bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}