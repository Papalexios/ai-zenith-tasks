import { Card, CardContent } from '@/components/ui/card';
import { Clock, Target, CheckCircle } from 'lucide-react';

interface PlanOverviewProps {
  plan: any;
}

export function PlanOverview({ plan }: PlanOverviewProps) {
  // Calculate meaningful data from the plan
  const totalFocusTime = plan.timeBlocks?.reduce((total: number, block: any) => {
    if (block.estimatedTime) {
      const match = block.estimatedTime.match(/(\d+)/);
      return total + (match ? parseInt(match[1]) : 60);
    }
    return total + 60; // Default 1 hour per task
  }, 0) || 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const highPriorityTasks = plan.timeBlocks?.filter((block: any) => 
    block.priority === 'high' || block.priority === 'urgent'
  ).length || 0;

  const productivityScore = plan.timeBlocks?.length > 0 
    ? Math.min(100, Math.max(60, 75 + (highPriorityTasks * 5) + (plan.timeBlocks.length * 2)))
    : 85;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Focus Time</div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {totalFocusTime > 0 ? formatTime(totalFocusTime) : '0h'}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Tasks Planned</div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {plan.timeBlocks?.length || 0}
            </div>
            {highPriorityTasks > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                {highPriorityTasks} high priority
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">Productivity Score</div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {productivityScore}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${productivityScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}