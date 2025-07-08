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
    <div className="flex gap-2 flex-wrap">
      <Button onClick={onGeneratePlan} variant="outline">
        Regenerate Plan
      </Button>
      <Button 
        onClick={onSyncToCalendar} 
        variant="secondary"
        disabled={isSyncing}
      >
        {isSyncing ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Syncing...
          </>
        ) : (
          <>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Sync to Google Calendar
          </>
        )}
      </Button>
      <Button onClick={onClose}>
        Apply Schedule
      </Button>
    </div>
  );
}