import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Target, 
  Brain, 
  Zap,
  CheckCircle
} from 'lucide-react';

interface DailyPlanModalProps {
  children: React.ReactNode;
}

export function DailyPlanModal({ children }: DailyPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateDailyPlan } = useTaskStore();

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateDailyPlan();
      setPlan(generatedPlan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Generated Daily Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!plan && !isGenerating && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Let AI create the perfect daily plan based on your tasks
              </p>
              <Button onClick={handleGeneratePlan} variant="glow">
                <Zap className="mr-2 h-4 w-4" />
                Generate AI Plan
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                AI is analyzing your tasks and creating the optimal schedule...
              </p>
            </div>
          )}

          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Plan Overview */}
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

              {/* Time Blocks */}
              {plan.timeBlocks && plan.timeBlocks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Optimized Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.timeBlocks.map((block: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="text-sm font-mono text-muted-foreground">
                            {block.startTime} - {block.endTime}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{block.task}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {block.priority && (
                                <Badge className={getPriorityColor(block.priority)}>
                                  {block.priority}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {block.energy} energy
                              </Badge>
                              <Badge variant="outline">
                                {block.type?.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              {plan.insights && plan.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {plan.recommendations && plan.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-accent mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button onClick={handleGeneratePlan} variant="outline">
                  Regenerate Plan
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Apply Schedule
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}