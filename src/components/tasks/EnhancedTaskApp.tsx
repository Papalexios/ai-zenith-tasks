import React, { useState, Suspense, lazy, memo, useCallback, useMemo } from 'react';
import { useTaskStore, Task } from '@/store/taskStore';
import { TaskAppHeader } from './TaskAppHeader';
import { TaskInputForm } from './TaskInputForm';
import { TaskFilters } from './TaskFilters';
import { SyncStatusAlert } from './SyncStatusAlert';
import { TaskList } from './TaskList';
import { BulkActions } from './BulkActions';
import { InteractiveDemo } from '../onboarding/InteractiveDemo';
import { FocusTimer } from './FocusTimer';
import { PremiumStatsCard } from './PremiumStatsCard';
import { EnterpriseErrorBoundary } from '../ui/error-boundary';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOnboarding } from '../onboarding/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components for better performance
const AIInsights = lazy(() => import('./AIInsights').then(m => ({ default: m.AIInsights })));
const CalendarView = lazy(() => import('./CalendarView').then(m => ({ default: m.CalendarView })));
const DailyPlanModal = lazy(() => import('./DailyPlanModal').then(m => ({ default: m.DailyPlanModal })));
const AnalyticsModal = lazy(() => import('./AnalyticsModal').then(m => ({ default: m.AnalyticsModal })));
const TaskEditModal = lazy(() => import('./TaskEditModal').then(m => ({ default: m.TaskEditModal })));
const CommandPalette = lazy(() => import('./CommandPalette').then(m => ({ default: m.CommandPalette })));
const DashboardAIInsights = lazy(() => import('./DashboardAIInsights').then(m => ({ default: m.DashboardAIInsights })));
const ProductivityOracle = lazy(() => import('./ProductivityOracle').then(m => ({ default: m.ProductivityOracle })));
const EnterpriseBulkOperations = lazy(() => import('../enterprise/BulkOperations').then(m => ({ default: m.EnterpriseBulkOperations })));
const AdminDashboard = lazy(() => import('../enterprise/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Loading component for better UX
const ComponentSkeleton = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
));

export const EnhancedTaskApp = memo(() => {
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initialize keyboard shortcuts and onboarding
  const { shortcuts } = useKeyboardShortcuts();
  const { showDemo, completeDemo } = useOnboarding();

  const {
    focusTimer,
    syncError,
    clearSyncError
  } = useTaskStore();

  // Memoized callbacks for better performance
  const handleDailyPlanToggle = useCallback(() => setShowDailyPlan(prev => !prev), []);
  const handleAnalyticsToggle = useCallback(() => setShowAnalytics(prev => !prev), []);
  const handleCalendarToggle = useCallback(() => setShowCalendar(prev => !prev), []);
  const handleCommandPaletteToggle = useCallback(() => setShowCommandPalette(prev => !prev), []);

  // Memoized derived state
  const shouldShowFocusTimer = useMemo(() => focusTimer.isActive, [focusTimer.isActive]);

  return (
    <EnterpriseErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <TaskAppHeader
              onDailyPlanClick={handleDailyPlanToggle}
              onAnalyticsClick={handleAnalyticsToggle}
              onCalendarToggle={handleCalendarToggle}
              showCalendar={showCalendar}
            />
            
            <div className="flex items-center gap-2">
              {/* Enterprise Operations */}
              <Suspense fallback={<Skeleton className="h-10 w-32" />}>
                <EnterpriseBulkOperations />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-10 w-32" />}>
                <AdminDashboard />
              </Suspense>
              
              {/* Command Palette Trigger */}
              <Button
                id="command-palette-trigger"
                data-demo="command-palette"
                variant="outline"
                onClick={handleCommandPaletteToggle}
                className="gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:border-primary/30"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>

          <SyncStatusAlert
            syncError={syncError}
            onClearError={clearSyncError}
          />

          <PremiumStatsCard />

          {/* AI Insights Dashboard */}
          <Suspense fallback={<ComponentSkeleton />}>
            <DashboardAIInsights />
          </Suspense>

          <div data-demo="task-input">
            <TaskInputForm />
          </div>

          <BulkActions />

          <div data-demo="task-filters">
            <TaskFilters />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {showCalendar ? (
              <Suspense fallback={<ComponentSkeleton />}>
                <CalendarView />
              </Suspense>
            ) : (
              <>
                <div data-demo="productivity-oracle">
                  <Suspense fallback={<ComponentSkeleton />}>
                    <ProductivityOracle />
                  </Suspense>
                </div>
                <div data-demo="task-list">
                  <TaskList />
                </div>
                <Suspense fallback={<ComponentSkeleton />}>
                  <AIInsights />
                </Suspense>
              </>
            )}
          </div>

          {/* Focus Timer */}
          {shouldShowFocusTimer && (
            <div className="fixed bottom-6 right-6 z-50">
              <FocusTimer />
            </div>
          )}

          {/* Modals */}
          <Suspense fallback={null}>
            <DailyPlanModal 
              open={showDailyPlan} 
              onOpenChange={setShowDailyPlan} 
            />
          </Suspense>
          
          <Suspense fallback={null}>
            <AnalyticsModal 
              open={showAnalytics} 
              onOpenChange={setShowAnalytics}
            />
          </Suspense>
          
          {editingTask && (
            <Suspense fallback={null}>
              <TaskEditModal task={editingTask}>
                <div></div>
              </TaskEditModal>
            </Suspense>
          )}

          <Suspense fallback={null}>
            <CommandPalette 
              open={showCommandPalette} 
              onOpenChange={setShowCommandPalette} 
            />
          </Suspense>

          {/* Interactive Demo */}
          <InteractiveDemo
            isOpen={showDemo}
            onClose={() => {}}
            onComplete={completeDemo}
          />
        </div>
      </div>
    </EnterpriseErrorBoundary>
  );
});

EnhancedTaskApp.displayName = 'EnhancedTaskApp';