import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  X,
  Lightbulb,
  Calendar,
  BarChart3,
  Timer,
  Search,
  Brain,
  Target,
  Zap
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  highlight?: boolean;
}

const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your AI-Powered Task Manager!',
    description: 'Let\'s take a quick tour to help you master all the amazing features. This demo will guide you through everything step by step.',
    icon: <Play className="h-6 w-6" />,
  },
  {
    id: 'add-task',
    title: 'Adding Your First Task',
    description: 'Start by adding a task in the input field. Try typing "Plan vacation" and hit Enter. The AI will automatically enhance it with subtasks and insights.',
    icon: <Target className="h-6 w-6" />,
    target: '[data-demo="task-input"]',
    position: 'bottom',
    action: 'Type and press Enter',
    highlight: true,
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Your Productivity Oracle analyzes your work patterns and provides personalized insights. It predicts your best work times and prevents burnout.',
    icon: <Brain className="h-6 w-6" />,
    target: '[data-demo="productivity-oracle"]',
    position: 'left',
  },
  {
    id: 'task-actions',
    title: 'Task Management',
    description: 'Click on any task to see options: edit, complete, set priority, or add to daily plan. Each task shows AI-generated insights and time estimates.',
    icon: <CheckCircle className="h-6 w-6" />,
    target: '[data-demo="task-list"]',
    position: 'right',
  },
  {
    id: 'filters',
    title: 'Smart Filtering',
    description: 'Use filters to focus on specific tasks. Filter by priority, category, completion status, or even AI-suggested focus areas.',
    icon: <Search className="h-6 w-6" />,
    target: '[data-demo="task-filters"]',
    position: 'bottom',
  },
  {
    id: 'daily-plan',
    title: 'AI Daily Planning',
    description: 'Click "Daily Plan" to let AI create an optimized schedule based on your energy patterns, deadlines, and task priorities.',
    icon: <Calendar className="h-6 w-6" />,
    target: '[data-demo="daily-plan-btn"]',
    position: 'bottom',
    action: 'Click to open',
  },
  {
    id: 'focus-timer',
    title: 'Focus Sessions',
    description: 'Start focused work sessions with the built-in timer. The AI learns your focus patterns and suggests optimal break times.',
    icon: <Timer className="h-6 w-6" />,
    target: '[data-demo="focus-timer"]',
    position: 'left',
  },
  {
    id: 'analytics',
    title: 'Productivity Analytics',
    description: 'View detailed analytics about your productivity patterns, completion rates, and time management. Track your progress over time.',
    icon: <BarChart3 className="h-6 w-6" />,
    target: '[data-demo="analytics-btn"]',
    position: 'bottom',
    action: 'Click to explore',
  },
  {
    id: 'command-palette',
    title: 'Quick Actions',
    description: 'Press Cmd/Ctrl + K to open the command palette. Quickly add tasks, navigate features, or execute AI suggestions without clicking.',
    icon: <Zap className="h-6 w-6" />,
    target: '[data-demo="command-palette"]',
    position: 'left',
    action: 'Press ⌘+K',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Congratulations! You now know how to use all the powerful features. The AI will continue learning your patterns to provide better insights.',
    icon: <Lightbulb className="h-6 w-6" />,
  },
];

interface InteractiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const currentStepData = demoSteps[currentStep];
  const isLastStep = currentStep === demoSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (isOpen && currentStepData.highlight && currentStepData.target) {
      setIsHighlighting(true);
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('demo-highlight');
      }
      
      const timer = setTimeout(() => {
        setIsHighlighting(false);
        if (targetElement) {
          targetElement.classList.remove('demo-highlight');
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
        if (targetElement) {
          targetElement.classList.remove('demo-highlight');
        }
      };
    }
  }, [currentStep, isOpen, currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Demo Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {currentStepData.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {demoSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <CardDescription className="text-sm leading-relaxed">
              {currentStepData.description}
            </CardDescription>
            
            {currentStepData.action && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm font-medium text-primary">
                  👉 {currentStepData.action}
                </p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>
                <Button onClick={handleNext} className="gap-2">
                  {isLastStep ? 'Complete' : 'Next'}
                  {!isLastStep && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Highlighting handled via CSS classes in index.css */}
    </>
  );
};