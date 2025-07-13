import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

interface PlanActionsProps {
  isSyncing: boolean;
  onGeneratePlan: () => void;
  onSyncToCalendar: () => void;
  onClose: () => void;
}

export function PlanActions({ isSyncing, onGeneratePlan, onSyncToCalendar, onClose }: PlanActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
      <Button 
        onClick={onGeneratePlan} 
        variant="outline" 
        className="flex-1 sm:flex-none"
        size="sm"
      >
        Regenerate Plan
      </Button>
      <Button 
        onClick={onSyncToCalendar} 
        variant="secondary"
        disabled={isSyncing}
        className="flex-1 sm:flex-none"
        size="sm"
      >
        {isSyncing ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Syncing...
          </>
        ) : (
          <>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Sync to Calendar
          </>
        )}
      </Button>
      <Button 
        onClick={onClose}
        className="flex-1 sm:flex-none"
        size="sm"
      >
        Apply Schedule
      </Button>
    </div>
  );
}