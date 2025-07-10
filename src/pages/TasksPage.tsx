
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskApp } from '@/components/tasks/TaskApp';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskStore } from '@/store/taskStore';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';

const TasksPage = () => {
  const { user, loading, signOut, subscription, checkSubscription } = useAuth();
  const { isLoadingTasks, syncError, tasks, loadTasks } = useTaskStore();
  const navigate = useNavigate();

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
      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your AI-powered tasks ({tasks.length} tasks loaded)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleRefresh} size="sm" className="text-sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={signOut} className="self-start sm:self-auto text-sm sm:text-base">
              <LogOut className="mr-2 h-4 w-4" />
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
          <TaskApp />
        ) : (
          <div className="text-center py-12 space-y-4">
            <h2 className="text-xl font-semibold">Access Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your free trial has expired. Please subscribe to continue using AI-powered task management.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
