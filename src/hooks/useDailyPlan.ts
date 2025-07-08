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
      console.log('Starting calendar sync with plan:', currentPlan);
      const googleCalendarUrls: string[] = [];
      
      // Process each time block individually
      for (const block of currentPlan?.timeBlocks || []) {
        console.log('Processing time block:', block);
        
        // Calculate duration from start and end times
        const startTime = block.startTime;
        const endTime = block.endTime;
        let durationMinutes = 90; // Default
        
        if (startTime && endTime) {
          const start = new Date(`2000-01-01T${startTime}:00`);
          const end = new Date(`2000-01-01T${endTime}:00`);
          durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        }
        
        const durationText = `${Math.floor(durationMinutes / 60)} hours ${durationMinutes % 60} minutes`;
        
        // Create a calendar event for each time block with correct data
        const { data, error } = await supabase.functions.invoke('add-to-calendar', {
          body: {
            taskId: block.taskId || `block-${Math.random()}`,
            title: block.task,
            description: `${block.description || ''}\n\nPriority: ${block.priority}\nEnergy Level: ${block.energy}\nType: ${block.type}\nDuration: ${durationText}`,
            dueDate: new Date().toISOString().split('T')[0], // Today's date
            dueTime: startTime,
            estimatedTime: durationText
          }
        });
        
        if (error) {
          console.error('Error creating calendar event:', error);
          continue;
        }
        
        console.log('Calendar event created:', data);
        
        if (data?.googleCalendarUrl) {
          googleCalendarUrls.push(data.googleCalendarUrl);
        }
      }
      
      console.log(`Created ${googleCalendarUrls.length} calendar URLs`);
      
      // Open each Google Calendar URL in a new tab with delays
      if (googleCalendarUrls.length > 0) {
        googleCalendarUrls.forEach((url, index) => {
          setTimeout(() => {
            console.log(`Opening calendar event ${index + 1}:`, url);
            window.open(url, '_blank');
          }, index * 1000); // 1 second delay between each URL
        });
        
        // Show instructions to user
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: "Calendar Sync Started",
            description: `Opening ${googleCalendarUrls.length} separate calendar events with exact times and details. Save each one individually.`,
          });
        });
      } else {
        throw new Error('No events could be created');
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