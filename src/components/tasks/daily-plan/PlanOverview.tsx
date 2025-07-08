import { Card, CardContent } from '@/components/ui/card';
import { Clock, Target, CheckCircle } from 'lucide-react';

interface PlanOverviewProps {
  plan: any;
}

export function PlanOverview({ plan }: PlanOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Focus Time</div>
          <div className="font-semibold">{plan.totalFocusTime || '6 hours'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Target className="h-6 w-6 text-accent mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Tasks Planned</div>
          <div className="font-semibold">{plan.timeBlocks?.length || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-6 w-6 text-secondary mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Productivity Score</div>
          <div className="font-semibold">{plan.productivityScore || 85}%</div>
        </CardContent>
      </Card>
    </div>
  );
}