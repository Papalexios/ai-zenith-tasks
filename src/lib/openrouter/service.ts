import OpenAI from 'openai';
import { OPENROUTER_CONFIG } from './config';
import { TaskEnhancement, AIInsight } from './types';

export class OpenRouterService {
  private client: OpenAI;
  private modelUsageTracker: Map<string, number> = new Map();
  private responseCache: Map<string, any> = new Map();

  constructor() {
    this.client = new OpenAI({
      baseURL: OPENROUTER_CONFIG.baseURL,
      apiKey: OPENROUTER_CONFIG.apiKey,
      defaultHeaders: OPENROUTER_CONFIG.headers,
      dangerouslyAllowBrowser: true
    });
  }

  async enhanceTask(taskInput: string, model: string = OPENROUTER_CONFIG.models.DEEPSEEK_R1T2_CHIMERA): Promise<TaskEnhancement> {
    const cacheKey = `enhance_${taskInput}_${model}`;
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an elite productivity expert AI. Transform ANY task input into premium quality, actionable items with crystal-clear steps, precise time estimates, and strategic priorities.

CRITICAL REQUIREMENTS:
- Be EXTREMELY specific and actionable
- Create concise, valuable subtasks (max 4-5 items)
- Use precise time estimates based on task complexity
- Assign strategic priorities based on impact/urgency
- Generate premium quality descriptions that add real value

Return a JSON object with this EXACT structure:
{
  "originalTask": "original input",
  "enhancedTitle": "clear, specific, actionable title",
  "description": "premium quality description with context and value",
  "subtasks": ["precise action step 1", "specific step 2", "clear deliverable 3"],
  "priority": "low|medium|high|urgent",
  "estimatedTime": "X minutes/hours",
  "category": "work|personal|health|learning|finance|creative|social",
  "deadline": "optional YYYY-MM-DD format",
  "dependencies": ["optional specific dependencies"],
  "tags": ["relevant", "searchable", "tags"]
}

EXAMPLES OF PREMIUM QUALITY:
- Vague: "exercise" → Enhanced: "Complete 30-minute HIIT cardio workout"
- Vague: "work on project" → Enhanced: "Review and finalize Q1 marketing strategy presentation slides"
- Vague: "call mom" → Enhanced: "Schedule weekly check-in call with mom to discuss vacation plans"

Make every task PREMIUM QUALITY: specific, actionable, time-bound, and valuable.`
          },
          {
            role: 'user',
            content: taskInput
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      const result = this.parseTaskResponse(completion.choices[0].message.content);
      this.responseCache.set(cacheKey, result);
      this.trackModelUsage(model);
      
      return result;
    } catch (error) {
      console.error('OpenRouter task enhancement error:', error);
      return this.fallbackTaskEnhancement(taskInput);
    }
  }

  async parseNaturalLanguage(input: string): Promise<any> {
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_R1T2_CHIMERA;
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `Extract structured information from natural language task input. Today is ${today.toISOString().split('T')[0]}.
            
Return JSON with:
{
  "title": "extracted task title",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:MM or null",
  "priority": "low|medium|high|urgent",
  "tags": ["tag1", "tag2"],
  "people": ["person1", "person2"],
  "location": "location or null",
  "recurring": "daily|weekly|monthly|yearly or null"
}

Examples:
"Call mom tomorrow at 2pm" -> {"title": "Call mom", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
"Weekly team meeting every Tuesday" -> {"title": "Team meeting", "recurring": "weekly", "priority": "medium"}`
          },
          {
            role: 'user',
            content: input
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const content = completion.choices[0].message.content || '{}';
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      try {
        return JSON.parse(cleanContent);
      } catch (parseError) {
        console.warn('Failed to parse natural language, using fallback');
        return { title: input, priority: 'medium', dueDate: null };
      }
    } catch (error) {
      console.error('Natural language parsing error:', error);
      return { title: input, priority: 'medium', dueDate: null };
    }
  }

  async generateDailyPlan(tasks: any[], userPreferences: any = {}): Promise<any> {
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_R1T2_CHIMERA;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const pendingTasks = tasks.filter(t => !t.completed);
      
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an elite productivity planner and time management expert. Create a PREMIUM QUALITY optimized daily schedule for today (${today}) with:

STRATEGIC PLANNING PRINCIPLES:
- Urgent tasks in peak energy hours (9-11 AM)
- High-focus work in morning/early afternoon
- Administrative tasks in lower energy periods
- Context switching minimization (group similar tasks)
- Realistic buffer times (10-15 minutes between tasks)
- Energy management (high → medium → low tasks)

PREMIUM TIME BLOCKING:
- Deep work blocks: 90-120 minutes max
- Quick tasks: 15-30 minute blocks
- Administrative: 30-45 minute blocks
- Creative work: 60-90 minute blocks

Return ONLY valid JSON with no markdown:
{
  "timeBlocks": [
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "taskId": "task-id",
      "task": "specific task title",
      "description": "task details and subtasks combined",
      "type": "deep_work|quick_task|admin|creative|meeting",
      "energy": "high|medium|low",
      "priority": "urgent|high|medium|low",
      "category": "work|personal|health|learning",
      "estimatedDuration": "90 minutes"
    }
  ],
  "insights": ["Strategic insights about the day's plan"],
  "recommendations": ["Actionable recommendations for peak performance"],
  "totalFocusTime": "6 hours 30 minutes",
  "productivityScore": 85,
  "energyOptimization": "high",
  "contextSwitching": "minimal"
}`
          },
          {
            role: 'user',
            content: `Create daily plan for these tasks: ${JSON.stringify(pendingTasks)}
Working hours: 9 AM - 6 PM
Preferences: ${JSON.stringify(userPreferences)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const content = completion.choices[0].message.content || '{}';
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      try {
        return JSON.parse(cleanContent);
      } catch (parseError) {
        console.warn('Failed to parse daily plan, using fallback');
        return { 
          timeBlocks: [], 
          insights: ['Unable to generate plan - please try again'], 
          recommendations: ['Add more specific time estimates to your tasks'],
          totalFocusTime: '0 hours',
          productivityScore: 0
        };
      }
    } catch (error) {
      console.error('Daily plan generation error:', error);
      return { 
        timeBlocks: [], 
        insights: ['Unable to generate plan - please try again'], 
        recommendations: ['Add more specific time estimates to your tasks'],
        totalFocusTime: '0 hours',
        productivityScore: 0
      };
    }
  }

  async provideCoaching(userContext: any): Promise<AIInsight[]> {
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_R1T2_CHIMERA;
    
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a supportive productivity coach. Analyze user patterns and provide encouraging, actionable insights.

Return ONLY a valid JSON array of insights with no markdown formatting:
[
  {
    "type": "productivity",
    "title": "short title",
    "description": "helpful description",
    "actionable": true,
    "priority": 1
  }
]

Be positive, specific, and helpful.`
          },
          {
            role: 'user',
            content: `User context: ${JSON.stringify(userContext)}`
          }
        ],
        temperature: 0.8,
        max_tokens: 600
      });

      const content = completion.choices[0].message.content || '[]';
      // Clean up any markdown formatting and escape issues
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .trim();
      
      let insights;
      try {
        insights = JSON.parse(cleanContent);
      } catch (parseError) {
        console.warn('Failed to parse AI insights, using fallback');
        insights = [];
      }
      return insights.slice(0, 3); // Limit to 3 insights
    } catch (error) {
      console.error('Coaching error:', error);
      return [
        {
          type: 'suggestion',
          title: 'Keep Going!',
          description: 'You\'re making great progress on your tasks today.',
          actionable: false,
          priority: 3
        }
      ];
    }
  }

  private parseTaskResponse(content: string | null): TaskEnhancement {
    if (!content) {
      throw new Error('No content received from AI');
    }

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.fallbackTaskEnhancement(content);
    }
  }

  private fallbackTaskEnhancement(input: string): TaskEnhancement {
    return {
      originalTask: input,
      enhancedTitle: input,
      description: `Task: ${input}`,
      subtasks: [input],
      priority: 'medium',
      estimatedTime: '30 minutes',
      category: 'general'
    };
  }

  private trackModelUsage(model: string) {
    const current = this.modelUsageTracker.get(model) || 0;
    this.modelUsageTracker.set(model, current + 1);
  }

  getModelUsageStats() {
    return Object.fromEntries(this.modelUsageTracker);
  }
}