import OpenAI from 'openai';

// OpenRouter Configuration
export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  models: {
    CYPHER_ALPHA: 'openrouter/cypher-alpha:free',
    DEEPSEEK_R1_0528: 'deepseek/deepseek-r1-0528:free',
    DEEPSEEK_R1: 'deepseek/deepseek-r1:free',
    DEEPSEEK_CHAT_V3: 'deepseek/deepseek-chat-v3-0324:free',
    GEMINI_25_PRO: 'google/gemini-2.5-pro-exp-03-25'
  },
  headers: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Productivity Assistant'
  }
};

export interface TaskEnhancement {
  originalTask: string;
  enhancedTitle: string;
  description: string;
  subtasks: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  category: string;
  deadline?: string;
  dependencies?: string[];
}

export interface AIInsight {
  type: 'productivity' | 'pattern' | 'suggestion' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}

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

  async enhanceTask(taskInput: string, model: string = OPENROUTER_CONFIG.models.CYPHER_ALPHA): Promise<TaskEnhancement> {
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
            content: `You are a productivity expert AI. Transform vague tasks into actionable items with clear steps, time estimates, and priorities. 

Return a JSON object with this exact structure:
{
  "originalTask": "original input",
  "enhancedTitle": "clear, actionable title",
  "description": "detailed description",
  "subtasks": ["step 1", "step 2", "step 3"],
  "priority": "low|medium|high|urgent",
  "estimatedTime": "X minutes/hours",
  "category": "work|personal|health|learning|etc",
  "deadline": "optional YYYY-MM-DD format",
  "dependencies": ["optional dependencies"]
}

Make it specific, actionable, and motivating.`
          },
          {
            role: 'user',
            content: taskInput
          }
        ],
        temperature: 0.7,
        max_tokens: 800
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
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_R1;
    
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `Extract structured information from natural language task input. 
            
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
"Call mom tomorrow at 2pm" -> {"title": "Call mom", "dueDate": "2024-XX-XX", "dueTime": "14:00", "priority": "medium"}
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

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Natural language parsing error:', error);
      return { title: input, priority: 'medium' };
    }
  }

  async generateDailyPlan(tasks: any[], userPreferences: any = {}): Promise<any> {
    const model = OPENROUTER_CONFIG.models.GEMINI_25_PRO;
    
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert productivity planner. Create an optimized daily schedule considering:
- Task priorities and deadlines
- Estimated time for each task
- User's energy levels throughout the day
- Context switching minimization
- Buffer time for unexpected tasks

Return JSON with:
{
  "timeBlocks": [
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "task": "task title",
      "type": "focused_work|meeting|break|admin",
      "energy": "high|medium|low"
    }
  ],
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["rec 1", "rec 2"]
}`
          },
          {
            role: 'user',
            content: `Tasks: ${JSON.stringify(tasks)}
Preferences: ${JSON.stringify(userPreferences)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Daily plan generation error:', error);
      return { timeBlocks: [], insights: [], recommendations: [] };
    }
  }

  async provideCoaching(userContext: any): Promise<AIInsight[]> {
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_CHAT_V3;
    
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a supportive productivity coach. Analyze user patterns and provide encouraging, actionable insights.

Return JSON array of insights:
[
  {
    "type": "productivity|pattern|suggestion|warning",
    "title": "short title",
    "description": "helpful description",
    "actionable": true/false,
    "priority": 1-5
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

      const insights = JSON.parse(completion.choices[0].message.content || '[]');
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

export const openRouterService = new OpenRouterService();