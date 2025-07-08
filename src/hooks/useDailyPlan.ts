import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';

export function useDailyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimeBlocks, setEditedTimeBlocks] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { generateDailyPlan, dailyPlan, updateDailyPlan, tasks, addToGoogleCalendar } = useTaskStore();

  // Use existing plan from store if available
  const currentPlan = plan || dailyPlan;

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateDailyPlan();
      setPlan(generatedPlan);
      setEditedTimeBlocks(generatedPlan?.timeBlocks || []);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editedTimeBlocks.findIndex((block, index) => 
        (block.id || `block-${index}`) === active.id
      );
      const newIndex = editedTimeBlocks.findIndex((block, index) => 
        (block.id || `block-${index}`) === over.id
      );

      setEditedTimeBlocks(arrayMove(editedTimeBlocks, oldIndex, newIndex));
    }
  };

  const handleSaveChanges = () => {
    const updatedPlan = {
      ...currentPlan,
      timeBlocks: editedTimeBlocks
    };
    
    if (updateDailyPlan) {
      updateDailyPlan(updatedPlan);
    }
    setPlan(updatedPlan);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTimeBlocks(currentPlan?.timeBlocks || []);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedTimeBlocks(currentPlan?.timeBlocks || []);
    setIsEditing(true);
  };

  const handleSyncToCalendar = async () => {
    setIsSyncing(true);
    try {
      const googleCalendarUrls: string[] = [];
      
      // Find matching tasks for each time block and get Google Calendar URLs
      for (const block of currentPlan?.timeBlocks || []) {
        const matchingTask = tasks.find(task => 
          task.title === block.task || 
          task.title.toLowerCase().includes(block.task.toLowerCase()) ||
          block.task.toLowerCase().includes(task.title.toLowerCase())
        );
        
        if (matchingTask) {
          // Get the Google Calendar URL from the edge function
          const { data } = await supabase.functions.invoke('add-to-calendar', {
            body: {
              taskId: matchingTask.id,
              title: matchingTask.title,
              description: matchingTask.description || 'AI-generated task',
              dueDate: matchingTask.dueDate || new Date().toISOString().split('T')[0],
              dueTime: block.startTime || '09:00',
              estimatedTime: matchingTask.estimatedTime || '1 hour'
            }
          });
          
          if (data?.googleCalendarUrl) {
            googleCalendarUrls.push(data.googleCalendarUrl);
          }
        }
      }
      
      // Open the first Google Calendar URL to start the process
      if (googleCalendarUrls.length > 0) {
        window.open(googleCalendarUrls[0], '_blank');
        
        // Show instructions to user
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: "Calendar Sync Started",
            description: `Google Calendar opened with ${googleCalendarUrls.length} event${googleCalendarUrls.length > 1 ? 's' : ''}. Click "Save" to add each event to your calendar.`,
          });
        });
      } else {
        throw new Error('No events to sync');
      }
      
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: "Sync Failed",
          description: "Failed to sync to Google Calendar. Please try again.",
          variant: "destructive"
        });
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return {
    currentPlan,
    isGenerating,
    isEditing,
    editedTimeBlocks,
    isSyncing,
    handleGeneratePlan,
    handleDragEnd,
    handleSaveChanges,
    handleCancelEdit,
    startEditing,
    handleSyncToCalendar,
    getPriorityColor
  };
}