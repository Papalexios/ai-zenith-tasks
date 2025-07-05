import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

const insightIcons = {
  productivity: TrendingUp,
  pattern: Brain,
  suggestion: Lightbulb,
  warning: AlertTriangle
};

const insightColors = {
  productivity: 'bg-accent/10 text-accent border-accent/20',
  pattern: 'bg-primary/10 text-primary border-primary/20',
  suggestion: 'bg-secondary/10 text-secondary border-secondary/20',
  warning: 'bg-destructive/10 text-destructive border-destructive/20'
};

export function AIInsights() {
  const { insights, getAIInsights, tasks } = useTaskStore();

  useEffect(() => {
    if (tasks.length > 0) {
      getAIInsights();
    }
  }, [tasks.length, getAIInsights]);

  const refreshInsights = () => {
    getAIInsights();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshInsights}
            className="p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium">No insights yet</p>
              <p className="text-xs text-muted-foreground">
                Add some tasks to get AI-powered insights
              </p>
            </div>
          </div>
        ) : (
          insights.map((insight, index) => {
            const IconComponent = insightIcons[insight.type] || Lightbulb;
            const colorClass = insightColors[insight.type] || insightColors.suggestion;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="space-y-3 p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    Priority {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground pl-10">
                  {insight.description}
                </p>
                
                {insight.actionable && (
                  <div className="pl-10">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs h-8 gap-2 hover:scale-105 transition-all duration-300"
                      onClick={() => {
                        const { applyInsightAction } = useTaskStore.getState();
                        applyInsightAction(insight.type);
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {insight.type === 'productivity' ? 'Focus on High Priority' : 
                       insight.type === 'pattern' ? 'Group Similar Tasks' : 
                       insight.type === 'suggestion' ? "Show Today's Tasks" : 'Apply Suggestion'}
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
        
        {tasks.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="h-3 w-3" />
              Powered by DeepSeek Chat AI
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}