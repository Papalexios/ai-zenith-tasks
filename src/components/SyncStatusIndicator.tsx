import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  WifiOff 
} from 'lucide-react';

export function SyncStatusIndicator() {
  const { syncStatus, syncError, forceSyncAllTasks, clearSyncError } = useTaskStore();

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: CheckCircle,
          text: 'All tasks synced',
          variant: 'success' as const,
          className: 'text-accent border-accent/20'
        };
      case 'syncing':
        return {
          icon: Loader2,
          text: 'Syncing tasks...',
          variant: 'default' as const,
          className: 'text-primary border-primary/20 animate-pulse'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync failed',
          variant: 'destructive' as const,
          className: 'text-destructive border-destructive/20'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Not synced',
          variant: 'secondary' as const,
          className: 'text-muted-foreground border-muted/20'
        };
    }
  };

  const { icon: Icon, text, variant, className } = getStatusConfig();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={className}>
          <Icon className={`h-3 w-3 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {text}
        </Badge>
        
        {(syncStatus === 'error' || syncStatus === 'idle') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={forceSyncAllTasks}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Sync
          </Button>
        )}
      </div>
      
      {syncError && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            {syncError}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSyncError}
              className="ml-2 h-4 px-1 text-xs"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}