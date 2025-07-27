import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Mail, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasksToSync: any[];
  onSyncComplete: () => void;
}

type SyncDestination = 'google' | 'outlook' | 'sheets';

export const SyncDestinationModal = ({ 
  isOpen, 
  onClose, 
  tasksToSync, 
  onSyncComplete 
}: SyncDestinationModalProps) => {
  const [selectedDestination, setSelectedDestination] = useState<SyncDestination>('google');
  const [isProcessing, setIsProcessing] = useState(false);

  const destinations = [
    {
      id: 'google' as const,
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Sync directly to Google Calendar with automatic scheduling',
      color: 'bg-blue-500'
    },
    {
      id: 'outlook' as const,
      name: 'Microsoft Outlook',
      icon: Mail,
      description: 'Export as .ics file compatible with Outlook',
      color: 'bg-orange-500'
    },
    {
      id: 'sheets' as const,
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Export as formatted calendar spreadsheet',
      color: 'bg-green-500'
    }
  ];

  const handleSync = async () => {
    setIsProcessing(true);
    
    try {
      switch (selectedDestination) {
        case 'google':
          await syncToGoogleCalendar();
          break;
        case 'outlook':
          await exportToOutlook();
          break;
        case 'sheets':
          await exportToSheets();
          break;
      }
      
      toast({
        title: "Sync Complete! 🎉",
        description: `Successfully processed ${tasksToSync.length} tasks to ${destinations.find(d => d.id === selectedDestination)?.name}`,
      });
      
      onSyncComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const syncToGoogleCalendar = async () => {
    for (let i = 0; i < tasksToSync.length; i++) {
      const task = tasksToSync[i];
      
      try {
        const subtasksText = task.subtasks?.length 
          ? `\n\nSubtasks:\n${task.subtasks.map((sub: string, idx: number) => `${idx + 1}. ${sub}`).join('\n')}`
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
            category: task.category
          }
        });

        if (error) throw error;
        
        if (data?.googleCalendarUrl) {
          // Open each calendar URL with a delay to prevent popup blocking
          setTimeout(() => {
            window.open(data.googleCalendarUrl, '_blank');
          }, i * 500);
        }
      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
        // Continue with other tasks even if one fails
      }
    }
  };

  const exportToOutlook = async () => {
    const icsContent = generateICSContent(tasksToSync);
    downloadFile(icsContent, 'tasks-calendar.ics', 'text/calendar');
  };

  const exportToSheets = async () => {
    const csvContent = generateCSVContent(tasksToSync);
    downloadFile(csvContent, 'tasks-calendar.csv', 'text/csv');
  };

  const generateICSContent = (tasks: any[]) => {
    const formatDate = (date: string, time: string = '09:00') => {
      const dt = new Date(`${date}T${time}:00`);
      return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Task Manager Pro//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    tasks.forEach(task => {
      const startDate = formatDate(task.dueDate || new Date().toISOString().split('T')[0], task.dueTime || '09:00');
      const endTime = task.dueTime ? 
        new Date(new Date(`${task.dueDate}T${task.dueTime}:00`).getTime() + (parseInt(task.estimatedTime || '30') * 60000)).toTimeString().slice(0, 5) :
        '10:00';
      const endDate = formatDate(task.dueDate || new Date().toISOString().split('T')[0], endTime);

      icsContent += `BEGIN:VEVENT
UID:${task.id}@aitaskmanager.pro
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${task.completed ? '✅ ' : ''}${task.title}
DESCRIPTION:${task.description || ''}${task.subtasks?.length ? '\\n\\nSubtasks:\\n' + task.subtasks.map((s: string, i: number) => `${i+1}. ${s}`).join('\\n') : ''}
LOCATION:
STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}
PRIORITY:${task.priority === 'high' ? '1' : task.priority === 'medium' ? '5' : '9'}
CATEGORIES:${task.category}
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
  };

  const generateCSVContent = (tasks: any[]) => {
    const headers = ['Title', 'Description', 'Due Date', 'Due Time', 'Priority', 'Category', 'Estimated Time', 'Status', 'Subtasks', 'Tags'];
    
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.dueDate || '',
      task.dueTime || '',
      task.priority,
      task.category,
      task.estimatedTime || '',
      task.completed ? 'Completed' : 'Pending',
      task.subtasks?.join('; ') || '',
      task.tags?.join(', ') || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Choose Sync Destination
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {tasksToSync.length} tasks ready to sync
            </Badge>
          </div>

          <div className="space-y-3">
            {destinations.map((dest) => {
              const Icon = dest.icon;
              return (
                <div
                  key={dest.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDestination === dest.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDestination(dest.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${dest.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{dest.name}</h3>
                        {selectedDestination === dest.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {dest.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSync} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};