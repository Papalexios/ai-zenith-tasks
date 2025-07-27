import React, { useState } from 'react';
import { Calendar, Zap, BarChart3, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoTrigger } from '@/components/onboarding/DemoTrigger';
import { SyncDestinationModal } from './SyncDestinationModal';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';

interface TaskAppHeaderProps {
  onDailyPlanClick: () => void;
  onAnalyticsClick: () => void;
  onCalendarToggle: () => void;
  showCalendar: boolean;
}

export const TaskAppHeader = ({
  onDailyPlanClick,
  onAnalyticsClick,
  onCalendarToggle,
  showCalendar
}: TaskAppHeaderProps) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const { getSyncableTasks, isSyncing } = useGoogleCalendarSync();
  
  const syncableTasks = getSyncableTasks(false);

  const handleSyncClick = () => {
    if (syncableTasks.length === 0) {
      return;
    }
    setShowSyncModal(true);
  };
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            AI Task Manager Pro
          </h1>
          <p className="text-muted-foreground mt-2">
            Premium productivity powered by advanced AI
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
          <DemoTrigger />
          
          <Button
            data-demo="daily-plan-btn"
            variant="outline"
            size="sm"
            onClick={onDailyPlanClick}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Plan</span>
          </Button>
          
          <Button
            data-demo="analytics-btn"
            variant="outline"
            size="sm"
            onClick={onAnalyticsClick}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCalendarToggle}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncClick}
            disabled={isSyncing || syncableTasks.length === 0}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing...' : `Sync All (${syncableTasks.length})`}
            </span>
          </Button>
        </div>
      </div>
      
      <SyncDestinationModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        tasksToSync={syncableTasks}
        onSyncComplete={() => {
          // Refresh or handle completion
        }}
      />
    </div>
  );
};