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
      const tasksToSync = includeCompleted ? tasks : tasks.filter(t => !t.completed);
      const syncPromises = tasksToSync.map(task => syncTaskToCalendar(task.id));
      
      await Promise.all(syncPromises);
      
      toast({
        title: "Calendar Sync Complete",
        description: `${tasksToSync.length} tasks synced to Google Calendar with full details and subtasks.`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Some tasks failed to sync. Please try again.",
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

  return {
    syncTaskToCalendar,
    syncAllTasks,
    autoSyncTask,
    isSyncing
  };
};