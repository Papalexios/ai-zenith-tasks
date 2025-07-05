import { create } from 'zustand';
import { openRouterService, TaskEnhancement, AIInsight } from '@/lib/openrouter';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  category: string;
  estimatedTime?: string;
  subtasks: string[];
  aiEnhanced: boolean;
  aiModelUsed?: string;
  tags: string[];
  createdAt: string;
}

export interface TaskStore {
  tasks: Task[];
  insights: AIInsight[];
  dailyPlan: any;
  isLoading: boolean;
  focusTimer: {
    taskId: string | null;
    isActive: boolean;
    timeLeft: number;
    type: 'focus' | 'break';
  };
  
  // Data persistence
  loadTasks: () => Promise<void>;
  syncTaskToSupabase: (task: Task) => Promise<void>;
  
  // Task management
  addTask: (taskInput: string, useAI?: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  
  // Google Calendar integration
  addToGoogleCalendar: (taskId: string) => Promise<void>;
  
  // AI features
  enhanceTaskWithAI: (id: string) => Promise<void>;
  generateDailyPlan: () => Promise<any>;
  updateDailyPlan: (plan: any) => void;
  getAIInsights: () => Promise<void>;
  applyInsightAction: (insightType: string) => void;
  
  // Focus timer
  startFocusTimer: (taskId: string) => void;
  pauseFocusTimer: () => void;
  stopFocusTimer: () => void;
  tickTimer: () => void;
  
  // Filters and sorting
  filter: 'all' | 'pending' | 'completed' | 'today' | 'overdue';
  setFilter: (filter: TaskStore['filter']) => void;
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'category';
  setSortBy: (sortBy: TaskStore['sortBy']) => void;
  
  // Analytics
  getProductivityStats: () => {
    totalTasks: number;
    completedTasks: number;
    aiEnhancedTasks: number;
    overdueTasks: number;
    averageCompletionTime: string;
    productivityScore: number;
    tasksThisWeek: number;
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  insights: [],
  dailyPlan: null,
  isLoading: false,
  filter: 'all',
  sortBy: 'priority',
  focusTimer: {
    taskId: null,
    isActive: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    type: 'focus'
  },

  // Data persistence methods
  loadTasks: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    const formattedTasks: Task[] = tasks?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      dueDate: task.due_date || undefined,
      dueTime: task.due_time || undefined,
      category: task.category,
      estimatedTime: task.estimated_time || undefined,
      subtasks: task.subtasks || [],
      aiEnhanced: task.ai_enhanced,
      aiModelUsed: task.ai_model_used || undefined,
      tags: task.tags || [],
      createdAt: task.created_at,
    })) || [];

    set({ tasks: formattedTasks });
  },

  syncTaskToSupabase: async (task: Task) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const taskData = {
      id: task.id,
      user_id: session.user.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      due_date: task.dueDate,
      due_time: task.dueTime,
      category: task.category,
      estimated_time: task.estimatedTime,
      subtasks: task.subtasks,
      ai_enhanced: task.aiEnhanced,
      ai_model_used: task.aiModelUsed,
      tags: task.tags,
    };

    const { error } = await supabase
      .from('tasks')
      .upsert(taskData);

    if (error) {
      console.error('Error syncing task to Supabase:', error);
    }
  },

  addTask: async (taskInput: string, useAI = true) => {
    const taskId = generateId();
    
    // OPTIMISTIC UI: Add task immediately
    const optimisticTask: Task = {
      id: taskId,
      title: taskInput,
      description: useAI ? 'AI is enhancing...' : undefined,
      completed: false,
      priority: 'medium',
      category: 'general',
      estimatedTime: '30 minutes',
      subtasks: [],
      aiEnhanced: false,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      tasks: [...state.tasks, optimisticTask],
    }));

    // Sync task with backend after optimistic update
    await get().syncTaskToSupabase(optimisticTask);

    if (!useAI) return;

    // AI Enhancement in background
    try {
      const nlpResult = await openRouterService.parseNaturalLanguage(taskInput);
      const enhancement = await openRouterService.enhanceTask(taskInput);
      
      const today = new Date().toISOString().split('T')[0];
      let finalDueDate = nlpResult.dueDate || enhancement.deadline;
      
      if (!finalDueDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        finalDueDate = enhancement.priority === 'urgent' ? today : tomorrow.toISOString().split('T')[0];
      }
      
      if (finalDueDate && finalDueDate < today) {
        finalDueDate = today;
      }
      
      // Update with AI enhancement
      await get().updateTask(taskId, {
        title: enhancement.enhancedTitle,
        description: enhancement.description,
        priority: enhancement.priority,
        category: enhancement.category,
        estimatedTime: enhancement.estimatedTime,
        subtasks: enhancement.subtasks,
        dueDate: finalDueDate,
        dueTime: nlpResult.dueTime,
        tags: nlpResult.tags || [],
        aiEnhanced: true,
        aiModelUsed: 'cypher-alpha'
      });
    } catch (error) {
      console.error('Error enhancing task:', error);
      // Remove loading state on error
      await get().updateTask(taskId, {
        description: undefined,
      });
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));

    // Sync to Supabase
    const updatedTask = get().tasks.find(t => t.id === id);
    if (updatedTask) {
      await get().syncTaskToSupabase(updatedTask);
    }
  },

  deleteTask: async (id: string) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }));

    // Delete from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error deleting task from Supabase:', error);
      }
    }
  },

  toggleTask: async (id: string) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));

    // Sync to Supabase
    const updatedTask = get().tasks.find(t => t.id === id);
    if (updatedTask) {
      await get().syncTaskToSupabase(updatedTask);
      // Auto-add to Google Calendar when task is created or updated
      if (updatedTask.dueDate) {
        try {
          await get().addToGoogleCalendar(id);
        } catch (error) {
          console.error('Error adding to Google Calendar:', error);
        }
      }
    }
  },

  addToGoogleCalendar: async (taskId: string) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task || !task.dueDate) return;

    try {
      const { data, error } = await supabase.functions.invoke('add-to-calendar', {
        body: {
          taskId: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          estimatedTime: task.estimatedTime
        }
      });

      if (error) {
        console.error('Error adding to Google Calendar:', error);
      }
    } catch (error) {
      console.error('Error calling calendar function:', error);
    }
  },

  enhanceTaskWithAI: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    set({ isLoading: true });

    try {
      const enhancement = await openRouterService.enhanceTask(task.title);
      
      get().updateTask(id, {
        title: enhancement.enhancedTitle,
        description: enhancement.description,
        priority: enhancement.priority,
        category: enhancement.category,
        estimatedTime: enhancement.estimatedTime,
        subtasks: enhancement.subtasks,
        aiEnhanced: true,
        aiModelUsed: 'cypher-alpha'
      });
    } catch (error) {
      console.error('Error enhancing task:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateDailyPlan: async () => {
    const tasks = get().tasks.filter(t => !t.completed);
    
    try {
      const plan = await openRouterService.generateDailyPlan(tasks, {
        workingHours: { start: '09:00', end: '17:00' },
        energyLevels: { morning: 'high', afternoon: 'medium', evening: 'low' }
      });
      
      // Ensure the plan includes ALL tasks, not just a subset
      const planWithAllTasks = {
        ...plan,
        timeBlocks: plan.timeBlocks || tasks.map((task, index) => ({
          id: `block-${index}`,
          startTime: `${9 + Math.floor(index * 1.5)}:00`,
          endTime: `${9 + Math.floor(index * 1.5) + 1}:00`,
          task: task.title,
          priority: task.priority,
          energy: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
          type: 'work_block'
        })),
        totalFocusTime: `${Math.ceil(tasks.length * 1.5)} hours`,
        productivityScore: 85
      };
      
      set({ dailyPlan: planWithAllTasks });
      return planWithAllTasks;
    } catch (error) {
      console.error('Error generating daily plan:', error);
      // Create a fallback plan that includes ALL tasks
      const fallbackPlan = { 
        timeBlocks: tasks.map((task, index) => ({
          id: `block-${index}`,
          startTime: `${9 + Math.floor(index * 1.5)}:00`,
          endTime: `${9 + Math.floor(index * 1.5) + 1}:00`,
          task: task.title,
          priority: task.priority,
          energy: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
          type: 'work_block'
        })),
        insights: ['AI scheduling optimized for your productivity patterns'],
        recommendations: ['Focus on high-priority tasks during morning hours'],
        totalFocusTime: `${Math.ceil(tasks.length * 1.5)} hours`,
        productivityScore: 85
      };
      set({ dailyPlan: fallbackPlan });
      return fallbackPlan;
    }
  },

  updateDailyPlan: (plan: any) => {
    set({ dailyPlan: plan });
  },

  getAIInsights: async () => {
    const { tasks } = get();
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    const userContext = {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      aiEnhancedTasks: tasks.filter(t => t.aiEnhanced).length,
      categories: [...new Set(tasks.map(t => t.category))],
      recentActivity: tasks.slice(-10)
    };

    try {
      const insights = await openRouterService.provideCoaching(userContext);
      set({ insights });
    } catch (error) {
      console.error('Error getting AI insights:', error);
    }
  },

  setFilter: (filter) => set({ filter }),
  
  setSortBy: (sortBy) => set({ sortBy }),

  applyInsightAction: (insightType: string) => {
    const { tasks, setFilter, setSortBy } = get();
    
    if (insightType === 'productivity') {
      // Sort by priority and focus on high-impact tasks
      setSortBy('priority');
      setFilter('pending');
    } else if (insightType === 'pattern') {
      // Group similar tasks - sort by category
      setSortBy('category');
    } else if (insightType === 'suggestion') {
      // Focus on today's tasks
      setFilter('today');
    }
  },

  getProductivityStats: () => {
    const { tasks } = get();
    const completed = tasks.filter(t => t.completed);
    const aiEnhanced = tasks.filter(t => t.aiEnhanced);
    const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
    
    const productivityScore = Math.round(
      (completed.length / Math.max(tasks.length, 1)) * 100
    );

    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      aiEnhancedTasks: aiEnhanced.length,
      overdueTasks: overdue.length,
      averageCompletionTime: '2.5 hours',
      productivityScore,
      tasksThisWeek: tasks.filter(t => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(t.createdAt) > weekAgo;
      }).length
    };
  },

  // Focus Timer Methods
  startFocusTimer: (taskId: string) => {
    set({
      focusTimer: {
        taskId,
        isActive: true,
        timeLeft: 25 * 60,
        type: 'focus'
      }
    });
  },

  pauseFocusTimer: () => {
    set(state => ({
      focusTimer: {
        ...state.focusTimer,
        isActive: false
      }
    }));
  },

  stopFocusTimer: () => {
    set({
      focusTimer: {
        taskId: null,
        isActive: false,
        timeLeft: 25 * 60,
        type: 'focus'
      }
    });
  },

  tickTimer: () => {
    set(state => {
      if (!state.focusTimer.isActive || state.focusTimer.timeLeft <= 0) {
        return state;
      }
      
      const newTimeLeft = state.focusTimer.timeLeft - 1;
      
      if (newTimeLeft === 0) {
        // Timer finished
        return {
          focusTimer: {
            ...state.focusTimer,
            isActive: false,
            timeLeft: 0
          }
        };
      }
      
      return {
        focusTimer: {
          ...state.focusTimer,
          timeLeft: newTimeLeft
        }
      };
    });
  }
}));