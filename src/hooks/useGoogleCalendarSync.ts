import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTaskStore } from '@/store/taskStore';
import { toast } from '@/hooks/use-toast';

export const useGoogleCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const tasks = useTaskStore(state => state.tasks);

  const syncTaskToCalendar = async (taskId: string, isUpdate = false) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Prepare comprehensive description with subtasks
      const subtasksText = task.subtasks?.length 
        ? `\n\nSubtasks:\n${task.subtasks.map((sub, i) => `${i + 1}. ${sub}`).join('\n')}`
        : '';
      
      const tagsText = task.tags?.length 
        ? `\n\nTags: ${task.tags.join(', ')}`
        : '';

      const fullDescription = `${task.description || ''}${subtasksText}${tagsText}\n\nPriority: ${task.priority.toUpperCase()}\nCategory: ${task.category}\nEstimated Time: ${task.estimatedTime}`;

      const { data, error } = await supabase.functions.invoke('add-to-calendar', {
        body: {
          taskId: task.id,
          title: task.completed ? `✅ ${task.title}` : task.title,
          description: fullDescription,
          dueDate: task.dueDate || new Date().toISOString().split('T')[0],
          dueTime: task.dueTime || '09:00',
          estimatedTime: task.estimatedTime,
          completed: task.completed,
          priority: task.priority,
          category: task.category,
          isUpdate
        }
      });

      if (error) throw error;

      if (data?.googleCalendarUrl) {
        window.open(data.googleCalendarUrl, '_blank');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Calendar sync error:', error);
      throw error;
    }
  };

  const syncAllTasks = async (includeCompleted = false) => {
    setIsSyncing(true);
    try {
      // Filter tasks that have a specific date (not just incomplete ones)
      const tasksToSync = tasks.filter(task => {
        const hasDate = task.dueDate && task.dueDate !== '';
        const shouldInclude = includeCompleted ? true : !task.completed;
        return hasDate && shouldInclude;
      });

      if (tasksToSync.length === 0) {
        toast({
          title: "No Tasks to Sync",
          description: "No tasks found with specific dates to sync.",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      // Process tasks individually to handle failures gracefully
      for (const task of tasksToSync) {
        try {
          await syncTaskToCalendar(task.id);
          successCount++;
          
          // Add small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          failureCount++;
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Calendar Sync Complete! 🎉",
          description: `${successCount} tasks synced successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}.`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: "All tasks failed to sync. Please check your internet connection and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sync all tasks error:', error);
      toast({
        title: "Sync Failed",
        description: "An unexpected error occurred during sync. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const autoSyncTask = async (taskId: string) => {
    try {
      await syncTaskToCalendar(taskId, true);
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  // Get tasks that can be synced (have dates)
  const getSyncableTasks = (includeCompleted = false) => {
    return tasks.filter(task => {
      const hasDate = task.dueDate && task.dueDate !== '';
      const shouldInclude = includeCompleted ? true : !task.completed;
      return hasDate && shouldInclude;
    });
  };

  return {
    syncTaskToCalendar,
    syncAllTasks,
    autoSyncTask,
    getSyncableTasks,
    isSyncing
  };
};