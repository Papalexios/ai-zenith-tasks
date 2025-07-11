import React, { useState } from 'react';
import { useTaskStore, Task } from '@/store/taskStore';
import { TaskAppHeader } from './TaskAppHeader';
import { TaskInputForm } from './TaskInputForm';
import { TaskFilters } from './TaskFilters';
import { SyncStatusAlert } from './SyncStatusAlert';
import { TaskList } from './TaskList';
import { AIInsights } from './AIInsights';
import { DailyPlanModal } from './DailyPlanModal';
import { AnalyticsModal } from './AnalyticsModal';
import { FocusTimer } from './FocusTimer';
import { TaskEditModal } from './TaskEditModal';
import { CalendarView } from './CalendarView';
import { PremiumStatsCard } from './PremiumStatsCard';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';

export const EnhancedTaskApp = () => {
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    focusTimer,
    syncError,
    clearSyncError
  } = useTaskStore();

  const { syncAllTasks, isSyncing } = useGoogleCalendarSync();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <TaskAppHeader
          onDailyPlanClick={() => setShowDailyPlan(true)}
          onAnalyticsClick={() => setShowAnalytics(true)}
          onCalendarToggle={() => setShowCalendar(!showCalendar)}
          onSyncAll={() => syncAllTasks(false)}
          showCalendar={showCalendar}
          isSyncing={isSyncing}
        />

        <SyncStatusAlert
          syncError={syncError}
          onClearError={clearSyncError}
        />

        <PremiumStatsCard />

        <TaskInputForm />

        <TaskFilters />

        {/* Main Content */}
        <div className="space-y-6">
          {showCalendar ? (
            <CalendarView />
          ) : (
            <>
              <TaskList />
              <AIInsights />
            </>
          )}
        </div>

        {/* Focus Timer */}
        {focusTimer.isActive && (
          <div className="fixed bottom-6 right-6 z-50">
            <FocusTimer />
          </div>
        )}

        {/* Modals */}
        <DailyPlanModal 
          open={showDailyPlan} 
          onOpenChange={setShowDailyPlan} 
        />
        
        <AnalyticsModal 
          open={showAnalytics} 
          onOpenChange={setShowAnalytics}
        />
        
        {editingTask && (
          <TaskEditModal task={editingTask}>
            <div></div>
          </TaskEditModal>
        )}
      </div>
    </div>
  );
};