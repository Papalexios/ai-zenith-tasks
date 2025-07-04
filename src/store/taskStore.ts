import { create } from 'zustand';
import { openRouterService, TaskEnhancement, AIInsight } from '@/lib/openrouter';

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
  
  // Task management
  addTask: (taskInput: string, useAI?: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // AI features
  enhanceTaskWithAI: (id: string) => Promise<void>;
  generateDailyPlan: () => Promise<any>;
  getAIInsights: () => Promise<void>;
  applyInsightAction: (insightType: string) => void;
  
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

  addTask: async (taskInput: string, useAI = true) => {
    set({ isLoading: true });
    
    try {
      let taskData: Partial<Task> = {
        id: generateId(),
        title: taskInput,
        completed: false,
        priority: 'medium',
        category: 'general',
        estimatedTime: '30 minutes',
        subtasks: [],
        aiEnhanced: false,
        tags: [],
        createdAt: new Date().toISOString(),
      };

      if (useAI) {
        // Use natural language parsing first
        const nlpResult = await openRouterService.parseNaturalLanguage(taskInput);
        
        // Then enhance with AI
        const enhancement = await openRouterService.enhanceTask(taskInput);
        
        // Set proper due date - default to today if none specified
        const today = new Date().toISOString().split('T')[0];
        let finalDueDate = nlpResult.dueDate || enhancement.deadline;
        
        // If no due date found, set to today for urgent tasks, tomorrow for others
        if (!finalDueDate) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          finalDueDate = enhancement.priority === 'urgent' ? today : tomorrow.toISOString().split('T')[0];
        }
        
        // Ensure the date is actually in the correct format and not in the past
        if (finalDueDate && finalDueDate < today) {
          finalDueDate = today;
        }
        
        taskData = {
          ...taskData,
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
        };
      }

      set(state => ({
        tasks: [...state.tasks, taskData as Task],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding task:', error);
      // Fallback to simple task creation
      set(state => ({
        tasks: [...state.tasks, {
          id: generateId(),
          title: taskInput,
          completed: false,
          priority: 'medium',
          category: 'general',
          estimatedTime: '30 minutes',
          subtasks: [],
          aiEnhanced: false,
          tags: [],
          createdAt: new Date().toISOString(),
        } as Task],
        isLoading: false
      }));
    }
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));
  },

  deleteTask: (id: string) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }));
  },

  toggleTask: (id: string) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
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
      
      set({ dailyPlan: plan });
      return plan;
    } catch (error) {
      console.error('Error generating daily plan:', error);
      const fallbackPlan = { timeBlocks: [], insights: [], recommendations: [] };
      set({ dailyPlan: fallbackPlan });
      return fallbackPlan;
    }
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
  }
}));