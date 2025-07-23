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
import { CommandPalette } from './CommandPalette';
import { BulkActions } from './BulkActions';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ProductivityOracle } from './ProductivityOracle';

export const EnhancedTaskApp = () => {
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initialize keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts();

  const {
    focusTimer,
    syncError,
    clearSyncError
  } = useTaskStore();

  const { syncAllTasks, isSyncing } = useGoogleCalendarSync();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <TaskAppHeader
            onDailyPlanClick={() => setShowDailyPlan(true)}
            onAnalyticsClick={() => setShowAnalytics(true)}
            onCalendarToggle={() => setShowCalendar(!showCalendar)}
            onSyncAll={() => syncAllTasks(false)}
            showCalendar={showCalendar}
            isSyncing={isSyncing}
          />
          
          {/* Command Palette Trigger */}
          <Button
            id="command-palette-trigger"
            variant="outline"
            onClick={() => setShowCommandPalette(true)}
            className="gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:border-primary/30"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <SyncStatusAlert
          syncError={syncError}
          onClearError={clearSyncError}
        />

        <PremiumStatsCard />

        <TaskInputForm />

        <BulkActions />

        <TaskFilters />

        {/* Main Content */}
        <div className="space-y-6">
          {showCalendar ? (
            <CalendarView />
          ) : (
            <>
              <ProductivityOracle />
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

        <CommandPalette 
          open={showCommandPalette} 
          onOpenChange={setShowCommandPalette} 
        />
      </div>
    </div>
  );
};