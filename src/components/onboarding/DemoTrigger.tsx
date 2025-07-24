import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Play } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';

export const DemoTrigger: React.FC = () => {
  const { hasCompletedDemo, startDemo } = useOnboarding();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startDemo}
      className="gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:border-primary/30"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">
        {hasCompletedDemo ? 'Replay Demo' : 'How to Use'}
      </span>
      {!hasCompletedDemo && (
        <Badge variant="secondary" className="text-xs ml-1">
          New
        </Badge>
      )}
    </Button>
  );
};