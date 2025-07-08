import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap } from 'lucide-react';

interface PlanInsightsProps {
  plan: any;
}

export function PlanInsights({ plan }: PlanInsightsProps) {
  const hasInsights = plan.insights && plan.insights.length > 0;
  const hasRecommendations = plan.recommendations && plan.recommendations.length > 0;

  if (!hasInsights && !hasRecommendations) {
    return null;
  }

  return (
    <>
      {/* Insights */}
      {hasInsights && (
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
      {hasRecommendations && (
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
    </>
  );
}