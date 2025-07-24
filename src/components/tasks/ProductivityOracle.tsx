import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target, 
  Activity,
  Lightbulb,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { ProductivityOracle as ProductivityOracleService, ProductivityProfile, WorkloadForecast } from '@/lib/openrouter/productivityOracle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function ProductivityOracle() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [oracle] = useState(() => new ProductivityOracleService());
  
  const [productivityProfile, setProductivityProfile] = useState<ProductivityProfile | null>(null);
  const [workloadForecast, setWorkloadForecast] = useState<WorkloadForecast[]>([]);
  const [burnoutRisk, setBurnoutRisk] = useState<any>(null);
  const [contextSuggestions, setContextSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      loadProductivityData();
    }
  }, [user?.id]);

  const loadProductivityData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load productivity profile first (most reliable)
      const profile = await oracle.analyzeProductivityPatterns(user.id);
      setProductivityProfile(profile);

      // Try other features with graceful fallbacks
      try {
        const forecasts = await oracle.forecastWorkload(user.id, 7);
        setWorkloadForecast(Array.isArray(forecasts) ? forecasts : []);
      } catch (err) {
        console.warn('Workload forecast unavailable:', err);
        setWorkloadForecast([]);
      }

      try {
        const risk = await oracle.detectBurnoutRisk(user.id);
        setBurnoutRisk(risk);
      } catch (err) {
        console.warn('Burnout detection unavailable:', err);
        setBurnoutRisk({ riskLevel: 'low', score: 0.2, factors: [], recommendations: ['Keep up the good work!'] });
      }

      try {
        const suggestions = await oracle.generateContextAwareSuggestions(user.id, {
          currentTime: new Date(),
          location: 'unknown',
          environment: 'focus'
        });
        setContextSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } catch (err) {
        console.warn('Context suggestions unavailable:', err);
        setContextSuggestions(['Focus on your highest priority tasks during peak hours']);
      }

    } catch (error) {
      console.error('Error loading productivity data:', error);
      // Set fallback data instead of showing error
      setProductivityProfile({
        userId: user.id,
        peakHours: [9, 10, 14],
        taskTypePreferences: { work: 0.8, general: 0.6, personal: 0.7 },
        averageFocusSession: 45,
        energyPatterns: { morning: 0.8, afternoon: 0.6, evening: 0.4 },
        optimalBreakDuration: 15,
        cognitiveLoadCapacity: 8,
        contextPreferences: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getEnergyLevel = (): number => {
    if (!productivityProfile) return 0.6;
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return productivityProfile.energyPatterns.morning;
    if (currentHour >= 12 && currentHour < 18) return productivityProfile.energyPatterns.afternoon;
    return productivityProfile.energyPatterns.evening;
  };

  const formatEnergyLevel = (level: number) => {
    if (level >= 0.8) return { label: 'High', color: 'bg-green-500' };
    if (level >= 0.6) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Low', color: 'bg-red-500' };
  };

  if (loading && !productivityProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Productivity Oracle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Productivity Oracle
          </CardTitle>
          <Button 
            onClick={loadProductivityData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Energy Level */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Current Energy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productivityProfile && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${formatEnergyLevel(getEnergyLevel()).color}`}></div>
                        <span className="font-medium">{formatEnergyLevel(getEnergyLevel()).label}</span>
                      </div>
                      <Progress value={getEnergyLevel() * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Burnout Risk */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Burnout Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {burnoutRisk && (
                    <div className="space-y-2">
                      <Badge variant={getRiskColor(burnoutRisk.riskLevel)}>
                        {burnoutRisk.riskLevel.toUpperCase()}
                      </Badge>
                      <Progress value={burnoutRisk.score * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {burnoutRisk.factors.length} risk factors detected
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Peak Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productivityProfile && (
                    <div className="space-y-1">
                      {productivityProfile.peakHours.slice(0, 3).map((hour, index) => (
                        <div key={index} className="text-sm">
                          {hour}:00 - {hour + 1}:00
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Task Type Preferences */}
            {productivityProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Task Type Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(productivityProfile.taskTypePreferences).map(([type, score]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{type}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(score * 100)}%</span>
                        </div>
                        <Progress value={score * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {burnoutRisk && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Burnout Prevention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskColor(burnoutRisk.riskLevel)}>
                        {burnoutRisk.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {Math.round(burnoutRisk.score * 100)}%
                      </span>
                    </div>
                    
                    {burnoutRisk.factors.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                        <ul className="space-y-1">
                          {burnoutRisk.factors.map((factor: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {burnoutRisk.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {burnoutRisk.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 mt-1 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  7-Day Workload Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workloadForecast.map((forecast, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">
                          {new Date(forecast.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Capacity: {Math.round(forecast.capacityUtilization * 100)}%
                          </span>
                          <Badge variant={forecast.burnoutRisk > 0.6 ? 'destructive' : 'secondary'}>
                            {forecast.burnoutRisk > 0.6 ? 'High Risk' : 'Safe'}
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress value={forecast.capacityUtilization * 100} className="h-2" />
                      
                      {forecast.predictedBottlenecks.length > 0 && (
                        <div>
                          <span className="text-xs font-medium">Potential Bottlenecks:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {forecast.predictedBottlenecks.slice(0, 3).map((task, taskIndex) => (
                              <Badge key={taskIndex} variant="outline" className="text-xs">
                                {task}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Context-Aware Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contextSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                  
                  {contextSuggestions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No suggestions available. Complete some tasks to generate personalized recommendations.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}