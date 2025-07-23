import { OpenRouterService } from './service';
import { supabase } from '@/integrations/supabase/client';

export interface ProductivityProfile {
  userId: string;
  peakHours: number[];
  taskTypePreferences: Record<string, number>;
  averageFocusSession: number;
  energyPatterns: Record<string, number>;
  optimalBreakDuration: number;
  cognitiveLoadCapacity: number;
  contextPreferences: Record<string, any>;
}

export interface WorkloadForecast {
  date: string;
  predictedBottlenecks: string[];
  capacityUtilization: number;
  burnoutRisk: number;
  recommendedAdjustments: string[];
  optimalSchedule: any[];
}

export interface FocusSession {
  startTime: Date;
  endTime?: Date;
  quality: number;
  interruptions: number;
  taskId?: string;
  context: Record<string, any>;
}

export class ProductivityOracle {
  private openRouterService: OpenRouterService;

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  async analyzeProductivityPatterns(userId: string): Promise<ProductivityProfile> {
    try {
      // Get task completion data
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!tasks || tasks.length === 0) {
        return this.createDefaultProfile(userId);
      }

      // Analyze patterns using AI
      const prompt = `Analyze this task completion data and generate a productivity profile:
      
Tasks: ${JSON.stringify(tasks, null, 2)}

Return a JSON object with:
- peakHours: Array of hours (0-23) when user is most productive
- taskTypePreferences: Object mapping task categories to performance scores (0-1)
- averageFocusSession: Average focus session duration in minutes
- energyPatterns: Object mapping time periods to energy levels
- optimalBreakDuration: Recommended break duration in minutes
- cognitiveLoadCapacity: Maximum cognitive load score
- contextPreferences: Optimal contexts for productivity

Focus on patterns in completion times, task types, and productivity indicators.`;

      const analysis = await this.openRouterService.enhanceTask(prompt);
      
      // Parse AI response and create profile
      const profile: ProductivityProfile = {
        userId,
        peakHours: this.extractPeakHours(tasks),
        taskTypePreferences: this.analyzeTaskTypePreferences(tasks),
        averageFocusSession: this.calculateAverageFocusSession(tasks),
        energyPatterns: this.analyzeEnergyPatterns(tasks),
        optimalBreakDuration: 15, // Default, can be refined
        cognitiveLoadCapacity: 8, // Default, can be refined
        contextPreferences: {}
      };

      // Store profile in database
      await this.storeProductivityProfile(profile);
      
      return profile;
    } catch (error) {
      console.error('Error analyzing productivity patterns:', error);
      return this.createDefaultProfile(userId);
    }
  }

  async forecastWorkload(userId: string, days: number = 7): Promise<WorkloadForecast[]> {
    try {
      // Get upcoming tasks and historical data
      const { data: upcomingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false);

      const { data: completedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!upcomingTasks || !completedTasks) {
        return [];
      }

      const prompt = `Analyze workload and generate forecasts for the next ${days} days:

Upcoming Tasks: ${JSON.stringify(upcomingTasks, null, 2)}
Historical Performance: ${JSON.stringify(completedTasks, null, 2)}

For each day, predict:
- Bottlenecks (tasks that might cause delays)
- Capacity utilization (0-1 scale)
- Burnout risk (0-1 scale)  
- Recommended schedule adjustments
- Optimal task sequence

Return array of daily forecasts.`;

      const forecast = await this.openRouterService.enhanceTask(prompt);
      
      // Generate forecasts for each day
      const forecasts: WorkloadForecast[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dailyForecast = await this.generateDailyForecast(userId, date, upcomingTasks, completedTasks);
        forecasts.push(dailyForecast);
      }

      return forecasts;
    } catch (error) {
      console.error('Error forecasting workload:', error);
      return [];
    }
  }

  async detectBurnoutRisk(userId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    try {
      // Get recent task data
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze burnout indicators
      const overdueTasks = recentTasks?.filter(t => t.due_date && new Date(t.due_date) < new Date()) || [];
      const completedTasks = recentTasks?.filter(t => t.completed) || [];
      const totalTasks = recentTasks?.length || 0;

      let riskScore = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Calculate risk factors
      if (overdueTasks.length > 3) {
        riskScore += 0.3;
        factors.push('High number of overdue tasks');
        recommendations.push('Consider redistributing or rescheduling overdue tasks');
      }

      const completionRate = completedTasks.length / (totalTasks || 1);
      if (completionRate < 0.5) {
        riskScore += 0.3;
        factors.push('Low task completion rate');
        recommendations.push('Break down large tasks into smaller, manageable pieces');
      }

      if (totalTasks > 15) {
        riskScore += 0.25;
        factors.push('High task volume in recent period');
        recommendations.push('Consider redistributing workload and taking more breaks');
      }

      if (overdueTasks.length > completedTasks.length) {
        riskScore += 0.2;
        factors.push('More overdue tasks than completed tasks');
        recommendations.push('Focus on completing existing tasks before adding new ones');
      }

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (riskScore >= 0.8) riskLevel = 'critical';
      else if (riskScore >= 0.6) riskLevel = 'high';
      else if (riskScore >= 0.3) riskLevel = 'medium';

      return {
        riskLevel,
        score: riskScore,
        factors,
        recommendations
      };
    } catch (error) {
      console.error('Error detecting burnout risk:', error);
      return {
        riskLevel: 'low',
        score: 0,
        factors: [],
        recommendations: []
      };
    }
  }

  async generateContextAwareSuggestions(userId: string, currentContext: any): Promise<string[]> {
    try {
      // Generate productivity profile from existing data
      const profile = await this.analyzeProductivityPatterns(userId);

      // Get available tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false);

      if (!tasks || tasks.length === 0) {
        return ['No pending tasks found. Consider adding new tasks to your list.'];
      }

      const currentHour = new Date().getHours();
      const peakHours = profile?.peakHours || [9, 10, 11, 14, 15];
      const isInPeakHours = peakHours.includes(currentHour);

      const prompt = `Generate context-aware task suggestions based on:

Current Context: ${JSON.stringify(currentContext)}
Current Time: ${new Date().toISOString()}
Is Peak Hour: ${isInPeakHours}
Available Tasks: ${JSON.stringify(tasks.slice(0, 10))}
User Profile: ${JSON.stringify(profile)}

Suggest 3-5 specific tasks that would be optimal to work on right now, considering:
- Energy levels and peak hours
- Task complexity vs current cognitive state
- Environmental context
- Time available
- Task dependencies and priorities

Return as array of actionable suggestions.`;

      const suggestions = await this.openRouterService.enhanceTask(prompt);
      
      // Parse and return suggestions
      return this.parseSuggestions(suggestions.enhancedTitle || 'Focus on high-priority tasks during your current energy level.');
    } catch (error) {
      console.error('Error generating context-aware suggestions:', error);
      return ['Consider working on your highest priority task based on your current energy level.'];
    }
  }

  private createDefaultProfile(userId: string): ProductivityProfile {
    return {
      userId,
      peakHours: [9, 10, 11, 14, 15, 16],
      taskTypePreferences: {
        'work': 0.8,
        'personal': 0.7,
        'learning': 0.6,
        'general': 0.5
      },
      averageFocusSession: 45,
      energyPatterns: {
        'morning': 0.9,
        'afternoon': 0.7,
        'evening': 0.5
      },
      optimalBreakDuration: 15,
      cognitiveLoadCapacity: 8,
      contextPreferences: {}
    };
  }

  private extractPeakHours(tasks: any[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    tasks.forEach(task => {
      if (task.updated_at && task.completed) {
        const hour = new Date(task.updated_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([hour]) => parseInt(hour));
  }

  private analyzeTaskTypePreferences(tasks: any[]): Record<string, number> {
    const categoryPerformance: Record<string, { total: number, completed: number }> = {};
    
    tasks.forEach(task => {
      const category = task.category || 'general';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { total: 0, completed: 0 };
      }
      categoryPerformance[category].total++;
      if (task.completed) {
        categoryPerformance[category].completed++;
      }
    });

    const preferences: Record<string, number> = {};
    Object.entries(categoryPerformance).forEach(([category, stats]) => {
      preferences[category] = stats.completed / stats.total;
    });

    return preferences;
  }

  private calculateAverageFocusSession(tasks: any[]): number {
    // Simplified calculation - can be enhanced with actual focus session data
    return 45; // Default 45 minutes
  }

  private analyzeEnergyPatterns(tasks: any[]): Record<string, number> {
    const periods = {
      'morning': 0,
      'afternoon': 0,
      'evening': 0
    };

    tasks.forEach(task => {
      if (task.updated_at && task.completed) {
        const hour = new Date(task.updated_at).getHours();
        if (hour >= 6 && hour < 12) periods.morning++;
        else if (hour >= 12 && hour < 18) periods.afternoon++;
        else periods.evening++;
      }
    });

    const total = periods.morning + periods.afternoon + periods.evening;
    return {
      'morning': total > 0 ? periods.morning / total : 0.33,
      'afternoon': total > 0 ? periods.afternoon / total : 0.33,
      'evening': total > 0 ? periods.evening / total : 0.33
    };
  }

  private async storeProductivityProfile(profile: ProductivityProfile): Promise<void> {
    // TODO: Store in new database tables once migration is approved
    console.log('Productivity profile generated:', profile);
  }

  private async generateDailyForecast(
    userId: string, 
    date: Date, 
    upcomingTasks: any[], 
    completedTasks: any[]
  ): Promise<WorkloadForecast> {
    const tasksForDay = upcomingTasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });

    return {
      date: date.toISOString().split('T')[0],
      predictedBottlenecks: tasksForDay
        .filter(task => task.priority === 'high' || task.priority === 'urgent')
        .map(task => task.title)
        .slice(0, 3),
      capacityUtilization: Math.min(tasksForDay.length / 8, 1), // Assuming 8 tasks is full capacity
      burnoutRisk: tasksForDay.length > 10 ? 0.8 : tasksForDay.length > 6 ? 0.5 : 0.2,
      recommendedAdjustments: this.generateAdjustmentRecommendations(tasksForDay),
      optimalSchedule: this.generateOptimalSchedule(tasksForDay)
    };
  }

  private generateAdjustmentRecommendations(tasks: any[]): string[] {
    const recommendations: string[] = [];
    
    if (tasks.length > 8) {
      recommendations.push('Consider rescheduling some tasks to avoid overload');
    }
    
    const urgentTasks = tasks.filter(t => t.priority === 'urgent');
    if (urgentTasks.length > 3) {
      recommendations.push('Break down urgent tasks into smaller chunks');
    }
    
    return recommendations;
  }

  private generateOptimalSchedule(tasks: any[]): any[] {
    return tasks
      .sort((a, b) => {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      })
      .slice(0, 8); // Limit to reasonable daily capacity
  }

  private parseSuggestions(aiResponse: string): string[] {
    try {
      // Try to parse as JSON array first
      if (aiResponse.startsWith('[')) {
        return JSON.parse(aiResponse);
      }
      
      // Otherwise split by lines and clean up
      return aiResponse
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('-'))
        .slice(0, 5);
    } catch {
      return [aiResponse];
    }
  }
}
