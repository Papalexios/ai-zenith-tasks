import React from 'react';
import { Calendar, Zap, BarChart3, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DemoTrigger } from '@/components/onboarding/DemoTrigger';

interface TaskAppHeaderProps {
  onDailyPlanClick: () => void;
  onAnalyticsClick: () => void;
  onCalendarToggle: () => void;
  onSyncAll: () => void;
  showCalendar: boolean;
  isSyncing: boolean;
}

export const TaskAppHeader = ({
  onDailyPlanClick,
  onAnalyticsClick,
  onCalendarToggle,
  onSyncAll,
  showCalendar,
  isSyncing
}: TaskAppHeaderProps) => {
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
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing...' : 'Sync All'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};