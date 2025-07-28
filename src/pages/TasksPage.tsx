
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedTaskApp } from '@/components/tasks/EnhancedTaskApp';
import { UltraMobileTaskApp } from '@/components/tasks/UltraMobileTaskApp';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdvancedTaskFilters } from '@/components/tasks/AdvancedTaskFilters';
import { EnhancedAIInsights } from '@/components/tasks/EnhancedAIInsights';
import { RealTimeScheduleAdjuster } from '@/components/tasks/RealTimeScheduleAdjuster';
import { FocusMode } from '@/components/tasks/FocusMode';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskStore } from '@/store/taskStore';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';

const TasksPage = () => {
  // Safe auth hook usage with fallback
  let authResult;
  try {
    authResult = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    // Fallback state
    authResult = {
      user: null,
      loading: true,
      signOut: async () => {},
      subscription: null,
      checkSubscription: async () => {}
    };
  }
  
  const { user, loading, signOut, subscription, checkSubscription } = authResult;
  const { isLoadingTasks, syncError, tasks, loadTasks } = useTaskStore();
  const navigate = useNavigate();
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleFocusModeToggle = (event: any) => {
      setFocusModeEnabled(event.detail.enabled);
    };

    window.addEventListener('focusModeToggle', handleFocusModeToggle);
    return () => window.removeEventListener('focusModeToggle', handleFocusModeToggle);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check subscription status on page load
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (user) {
      console.log('Manual refresh triggered - refreshing subscription and tasks');
      await checkSubscription(); // This was missing!
      await loadTasks();
    }
  };

  if (loading || isLoadingTasks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isLoadingTasks ? 'Loading your tasks...' : 'Loading...'}
          </p>
          {syncError && (
            <div className="text-center space-y-2">
              <p className="text-destructive text-sm">{syncError}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Check if user has access (subscribed or trial active)
  const hasAccess = subscription ? subscription.has_access : true;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-6">
        {/* Mobile-Optimized Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              Welcome, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length} tasks loaded
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              onClick={handleRefresh} 
              size="sm" 
              className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
            >
              <RefreshCw className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut} 
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
            >
              <LogOut className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Debug info when no tasks */}
        {tasks.length === 0 && !isLoadingTasks && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-yellow-800">No tasks found</h3>
            <p className="text-sm text-yellow-600 mt-1">
              Your task list appears to be empty. Try adding a new task below.
            </p>
            {syncError && (
              <p className="text-sm text-red-600 mt-2">
                Sync Error: {syncError}
              </p>
            )}
          </div>
        )}

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Sync Status Indicator */}
        <SyncStatusIndicator />

        {/* Task App */}
        {hasAccess ? (
          <div className={`transition-all duration-300 ${focusModeEnabled ? 'blur-sm opacity-50' : ''}`}>
            {isMobile ? <UltraMobileTaskApp /> : <EnhancedTaskApp />}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-xl font-semibold">Access Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your free trial has expired. Please subscribe to continue using AI-powered task management.
            </p>
          </div>
        )}
        
        <FocusMode 
          isEnabled={focusModeEnabled} 
          onToggle={() => setFocusModeEnabled(!focusModeEnabled)} 
        />
      </div>
    </div>
  );
};

export default TasksPage;
