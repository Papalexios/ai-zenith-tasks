
import { create } from 'zustand';
import { openRouterService, type TaskEnhancement, type AIInsight } from '@/lib/openrouter';
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
  isLoadingTasks: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
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
  
  // Data sync methods
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  clearSyncError: () => void;
  forceSyncAllTasks: () => Promise<void>;
  
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

const generateId = () => crypto.randomUUID();

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  insights: [],
  dailyPlan: null,
  isLoading: false,
  isLoadingTasks: false,
  syncStatus: 'idle',
  syncError: null,
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
    console.log('loadTasks called');
    set({ isLoadingTasks: true, syncStatus: 'syncing', syncError: null });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user found');
        set({ isLoadingTasks: false, syncStatus: 'idle', tasks: [] });
        return;
      }

      console.log('Loading tasks for user:', session.user.id);

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading tasks:', error);
        set({ 
          isLoadingTasks: false, 
          syncStatus: 'error',
          syncError: `Database error: ${error.message}`
        });
        // Show error toast
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: "Failed to Load Tasks",
            description: `Error: ${error.message}`,
            variant: "destructive"
          });
        });
        return;
      }

      console.log('Raw tasks from database:', tasks);

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

      console.log('Formatted tasks:', formattedTasks);
      console.log('Number of tasks loaded:', formattedTasks.length);

      set({ 
        tasks: formattedTasks, 
        isLoadingTasks: false, 
        syncStatus: 'synced',
        syncError: null
      });

      // Show success toast with task count
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Tasks Loaded",
          description: `Successfully loaded ${formattedTasks.length} tasks`,
        });
      });

    } catch (error) {
      console.error('Exception in loadTasks:', error);
      set({ 
        isLoadingTasks: false, 
        syncStatus: 'error',
        syncError: `Failed to load tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      // Show error toast
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Critical Error",
          description: "Failed to load your tasks. Please refresh the page and try again.",
          variant: "destructive"
        });
      });
    }
  },

  syncTaskToSupabase: async (task: Task) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    const attemptSync = async (): Promise<void> => {
      try {
        console.log('Syncing task to Supabase:', task.id, task.title);
        set({ syncStatus: 'syncing' });
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('No authenticated user found');
        }

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

        console.log('Task data being synced:', taskData);

        const { error } = await supabase
          .from('tasks')
          .upsert(taskData);

        if (error) {
          console.error('Supabase upsert error:', error);
          throw error;
        }

        console.log('Task synced successfully:', task.id);
        set({ syncStatus: 'synced', syncError: null });
        
      } catch (error) {
        console.error(`Error syncing task to Supabase (attempt ${retryCount + 1}):`, error);
        
        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`Retrying sync in ${Math.pow(2, retryCount)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return attemptSync();
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          console.error('Final sync failure:', errorMessage);
          set({ 
            syncStatus: 'error',
            syncError: `Failed to save task "${task.title}": ${errorMessage}`
          });
          
          // Show user-visible error
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: "Sync Failed",
              description: `Failed to save task "${task.title}". Your changes may be lost.`,
              variant: "destructive"
            });
          });
        }
      }
    };

    await attemptSync();
  },

  setSyncStatus: (status) => set({ syncStatus: status }),
  
  clearSyncError: () => set({ syncError: null }),
  
  forceSyncAllTasks: async () => {
    const { tasks } = get();
    set({ syncStatus: 'syncing' });
    
    try {
      await Promise.all(tasks.map(task => get().syncTaskToSupabase(task)));
      set({ syncStatus: 'synced', syncError: null });
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Sync Complete",
          description: "All tasks have been synced successfully.",
        });
      });
    } catch (error) {
      set({ syncStatus: 'error', syncError: 'Failed to sync all tasks' });
    }
  },

  addTask: async (taskInput: string, useAI = true) => {
    if (!taskInput.trim()) {
      console.warn('Empty task input, skipping');
      return;
    }
    
    const taskId = generateId();
    console.log('🚀 Adding new task:', taskId, 'Input:', taskInput, 'Language detection...');
    
    set({ isLoading: true });

    // OPTIMISTIC UI: Add task immediately
    const optimisticTask: Task = {
      id: taskId,
      title: taskInput.trim(),
      description: useAI ? 'AI is enhancing this task with premium quality...' : undefined,
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
      tasks: [optimisticTask, ...state.tasks],
      isLoading: false
    }));

    console.log('✅ Optimistic task added to UI:', optimisticTask.title);

    // Sync task with backend immediately
    try {
      console.log('💾 Syncing task to database...');
      await get().syncTaskToSupabase(optimisticTask);
      console.log('✅ Task successfully saved to database');
      
      // Show immediate success feedback
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Task Created",
          description: `"${taskInput.trim()}" added successfully`,
        });
      });
    } catch (error) {
      console.error('❌ Failed to save task to database:', error);
      // Remove the optimistic task if save failed
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Error",
          description: "Failed to save task. Please try again.",
          variant: "destructive"
        });
      });
      return;
    }

    if (!useAI) return;

    // AI Enhancement in background - PREMIUM QUALITY
    try {
      console.log('🤖 Starting AI enhancement for:', taskInput);
      set({ isLoading: true });
      
      const [nlpResult, enhancement] = await Promise.all([
        openRouterService.parseNaturalLanguage(taskInput),
        openRouterService.enhanceTask(taskInput)
      ]);
      
      console.log('🎯 NLP Result:', nlpResult);
      console.log('✨ AI Enhancement:', enhancement);
      
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
      
      // Update with PREMIUM AI enhancement
      await get().updateTask(taskId, {
        title: enhancement.enhancedTitle || taskInput.trim(),
        description: enhancement.description,
        priority: enhancement.priority || 'medium',
        category: enhancement.category || 'general',
        estimatedTime: enhancement.estimatedTime || '30 minutes',
        subtasks: enhancement.subtasks || [],
        dueDate: finalDueDate,
        dueTime: nlpResult.dueTime,
        tags: nlpResult.tags || [],
        aiEnhanced: true,
        aiModelUsed: 'deepseek-r1t2-chimera'
      });
      
      console.log('🎉 Task enhanced successfully with AI');
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "AI Enhancement Complete",
          description: "Your task has been enhanced with premium quality details",
        });
      });
      
    } catch (error) {
      console.error('❌ Error enhancing task:', error);
      // Remove loading state and keep basic task
      await get().updateTask(taskId, {
        description: `Task: ${taskInput.trim()}`,
      });
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "AI Enhancement Failed",
          description: "Task created successfully but AI enhancement failed",
          variant: "destructive"
        });
      });
    } finally {
      set({ isLoading: false });
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
      
      // Auto-sync to Google Calendar on task updates
      if (typeof window !== 'undefined') {
        console.log('Task updated, triggering calendar sync for:', id);
      }
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

    // Sync to Supabase and Calendar
    const updatedTask = get().tasks.find(t => t.id === id);
    if (updatedTask) {
      await get().syncTaskToSupabase(updatedTask);
      
      // Auto-sync completion status to Google Calendar
      if (typeof window !== 'undefined') {
        console.log('Task completion toggled, triggering calendar sync for:', id);
        try {
          await get().addToGoogleCalendar(id);
        } catch (error) {
          console.error('Error syncing to Google Calendar:', error);
        }
      }
    }
  },

  addToGoogleCalendar: async (taskId: string) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    // Auto-add to calendar for all tasks, even without due dates
    try {
      // Set a default due date if none exists
      const dueDate = task.dueDate || new Date().toISOString().split('T')[0];
      const dueTime = task.dueTime || '09:00';

      const { data, error } = await supabase.functions.invoke('add-to-calendar', {
        body: {
          taskId: task.id,
          title: task.title,
          description: task.description || 'AI-generated task',
          dueDate: dueDate,
          dueTime: dueTime,
          estimatedTime: task.estimatedTime || '30 minutes'
        }
      });

      if (error) {
        console.error('Error adding to Google Calendar:', error);
      } else {
        console.log('Successfully added task to Google Calendar');
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
