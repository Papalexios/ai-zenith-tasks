import { Button } from '@/components/ui/button';
import { Calendar, Zap } from 'lucide-react';

interface EmptyPlanStateProps {
  onGeneratePlan: () => void;
}

export function EmptyPlanState({ onGeneratePlan }: EmptyPlanStateProps) {
  return (
    <div className="text-center py-8">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">
        Let AI create the perfect daily plan based on your tasks
      </p>
      <Button onClick={onGeneratePlan} variant="glow">
        <Zap className="mr-2 h-4 w-4" />
        Generate AI Plan
      </Button>
    </div>
  );
}