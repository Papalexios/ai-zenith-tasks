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

  async enhanceTask(taskInput: string, model?: string): Promise<TaskEnhancement> {
    // Use fast fallback system with timeout
    const modelPriority = OPENROUTER_CONFIG.modelPriority;
    const timeout = 8000; // 8 second timeout per model

    for (let i = 0; i < modelPriority.length; i++) {
      try {
        const selectedModel = modelPriority[i];
        const cacheKey = `enhance_${taskInput}_${selectedModel}`;
        
        if (this.responseCache.has(cacheKey)) {
          return this.responseCache.get(cacheKey);
        }

        const completionPromise = this.client.chat.completions.create({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `You are a productivity AI that enhances task descriptions. Analyze the task and provide structured improvements.
              
              CRITICAL: Respond with ONLY valid JSON in this exact format:
              {
                "originalTask": "original input task",
                "enhancedTitle": "clear, actionable task title",
                "description": "detailed description with context",
                "estimatedTime": "X minutes" or "X hours",
                "priority": "low" | "medium" | "high" | "urgent",
                "subtasks": ["subtask 1", "subtask 2"],
                "category": "work" | "personal" | "health" | "learning" | "general"
              }`
            },
            {
              role: 'user',
              content: `Enhance this task: ${taskInput}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        // Race the API call against a timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
          throw new Error('No response from AI');
        }

        // Cache successful response
        this.responseCache.set(cacheKey, response);
        this.trackModelUsage(selectedModel);

        return this.parseTaskResponse(response);
        
      } catch (error) {
        console.warn(`Model ${modelPriority[i]} failed:`, error);
        
        // Continue to next model, don't throw errors during task editing
        continue;
      }
    }

    // All models failed - return simple enhancement that won't cause sync failure
    console.warn('All AI models failed, returning minimal enhancement to prevent sync error');
    return this.getFallbackTaskEnhancement(taskInput);
  }

  async parseNaturalLanguage(input: string): Promise<any> {
    try {
      const today = new Date();
      
      const completion = await this.client.chat.completions.create({
        model: OPENROUTER_CONFIG.modelPriority[0], // Use fastest model
        messages: [
          {
            role: 'system',
            content: `Extract structured information from natural language task input. Return ONLY valid JSON:
            {
              "title": "extracted task title",
              "dueDate": "YYYY-MM-DD or null",
              "dueTime": "HH:MM or null",
              "priority": "low|medium|high|urgent"
            }`
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
    try {
      if (!tasks || tasks.length === 0) {
        return this.createFallbackPlan([]);
      }

      // Sort tasks by priority and due date for better planning
      const sortedTasks = this.sortTasksForPlanning(tasks);
      
      // Fast-first approach: Start with fastest model and upgrade in background
      return await this.generateFastPlan(sortedTasks, userPreferences);
      
    } catch (error) {
      console.error('Error generating daily plan:', error);
      return this.createFallbackPlan(tasks);
    }
  }

  private async generateFastPlan(tasks: any[], userPreferences: any = {}): Promise<any> {
    // Use fastest model first (DeepSeek Chat V3)
    const fastModel = OPENROUTER_CONFIG.modelPriority[0];
    const timeout = 10000; // 10 second timeout for daily plans
    
    try {
      const planPromise = this.client.chat.completions.create({
        model: fastModel,
        messages: [
          {
            role: 'system',
            content: `Create an optimal daily schedule. Return ONLY valid JSON with this structure:
            {
              "title": "Today's Optimized Schedule",
              "totalEstimatedTime": "X hours Y minutes", 
              "timeBlocks": [
                {
                  "id": "unique-id",
                  "task": "task title",
                  "description": "task details",
                  "startTime": "HH:MM",
                  "endTime": "HH:MM", 
                  "priority": "low|medium|high|urgent",
                  "energy": "low|medium|high",
                  "type": "deep work|communication|administrative|creative",
                  "taskId": "original-task-id"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Create an optimized daily plan for these tasks: ${JSON.stringify(tasks.slice(0, 10))}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Fast plan timeout')), timeout);
      });

      const completion = await Promise.race([planPromise, timeoutPromise]) as any;
      const response = completion.choices[0]?.message?.content;

      if (response) {
        const plan = this.parsePlanResponse(response);
        if (plan && this.validatePlan(plan)) {
          // Start background improvement with better model
          this.improveInBackground(tasks, userPreferences, plan);
          return plan;
        }
      }
    } catch (error) {
      console.warn('Fast model failed, trying fallback:', error);
    }

    // Fallback to instant local plan
    return this.createFallbackPlan(tasks);
  }

  private improveInBackground(tasks: any[], userPreferences: any, initialPlan: any) {
    // Async background improvement with better models
    setTimeout(async () => {
      try {
        const betterModel = OPENROUTER_CONFIG.modelPriority[3]; // DeepSeek R1T2 Chimera
        const improvedPlan = await this.generateAIPlan(tasks, userPreferences, betterModel);
        
        if (improvedPlan && this.validatePlan(improvedPlan)) {
          // Cache improved plan for future use
          this.responseCache.set(`improved_plan_${Date.now()}`, JSON.stringify(improvedPlan));
          console.log('Background plan improvement completed');
        }
      } catch (error) {
        console.warn('Background improvement failed:', error);
      }
    }, 1000);
  }

  private async generateAIPlan(tasks: any[], userPreferences: any = {}, model?: string): Promise<any> {
    try {
      const selectedModel = model || OPENROUTER_CONFIG.modelPriority[0];
      const completion = await this.client.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: `Create an optimal daily schedule using productivity science. Return ONLY valid JSON.`
          },
          {
            role: 'user',
            content: `Create an optimized daily plan for these tasks: ${JSON.stringify(tasks)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const content = completion.choices[0].message.content || '{}';
      return this.parsePlanResponse(content);
      
    } catch (error) {
      console.error('AI plan generation failed:', error);
      throw error;
    }
  }

  private parsePlanResponse(content: string): any {
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Failed to parse plan response:', error);
      return null;
    }
  }

  private validatePlan(plan: any): boolean {
    return plan && 
           typeof plan === 'object' && 
           Array.isArray(plan.timeBlocks) && 
           plan.timeBlocks.length > 0;
  }

  private sortTasksForPlanning(tasks: any[]) {
    return tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
      
      return bPriority - aPriority;
    });
  }

  private createFallbackPlan(tasks: any[]) {
    const timeBlocks = tasks.slice(0, 8).map((task, index) => {
      const startHour = 9 + index * 1.5;
      const endHour = startHour + 1.5;
      
      return {
        id: `fallback-${index}`,
        task: task.title || `Task ${index + 1}`,
        description: task.description || `Focus session: ${task.title}`,
        startTime: `${Math.floor(startHour).toString().padStart(2, '0')}:${Math.floor((startHour % 1) * 60).toString().padStart(2, '0')}`,
        endTime: `${Math.floor(endHour).toString().padStart(2, '0')}:${Math.floor((endHour % 1) * 60).toString().padStart(2, '0')}`,
        priority: task.priority || 'medium',
        energy: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
        type: 'deep work',
        taskId: task.id
      };
    });

    return {
      title: "Today's Schedule",
      totalEstimatedTime: `${Math.ceil(tasks.length * 1.5)} hours`,
      timeBlocks,
      insights: [`Created schedule for ${tasks.length} tasks`],
      recommendations: ['Start with high-priority tasks during peak energy hours'],
      totalFocusTime: `${Math.ceil(tasks.length * 1.2)} hours`,
      productivityScore: 85
    };
  }

  async provideCoaching(userContext: any): Promise<AIInsight[]> {
    try {
      const completion = await this.client.chat.completions.create({
        model: OPENROUTER_CONFIG.modelPriority[0], // Use fastest model
        messages: [
          {
            role: 'system',
            content: `Provide helpful productivity insights. Return ONLY valid JSON array:
            [
              {
                "type": "productivity",
                "title": "Short tip title",
                "description": "Helpful actionable advice",
                "actionable": true,
                "priority": 1
              }
            ]`
          },
          {
            role: 'user',
            content: `Provide insights for: ${JSON.stringify(userContext)}`
          }
        ],
        temperature: 0.8,
        max_tokens: 600
      });

      const content = completion.choices[0].message.content || '[]';
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      try {
        const insights = JSON.parse(cleanContent);
        return Array.isArray(insights) ? insights.slice(0, 3) : [];
      } catch (parseError) {
        return this.getFallbackInsights();
      }
    } catch (error) {
      console.error('Coaching error:', error);
      return this.getFallbackInsights();
    }
  }

  private getFallbackInsights(): AIInsight[] {
    return [
      {
        type: 'productivity',
        title: '🚀 Stay Focused',
        description: 'Complete one task at a time to maintain peak productivity.',
        actionable: true,
        priority: 1
      },
      {
        type: 'suggestion',
        title: '⚡ Energy Management',
        description: 'Schedule your most important tasks during peak energy hours.',
        actionable: true,
        priority: 2
      }
    ];
  }

  private parseTaskResponse(content: string | null): TaskEnhancement {
    if (!content) {
      throw new Error('No content received from AI');
    }

    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure we have the required fields for TaskEnhancement interface
        return {
          originalTask: parsed.originalTask || parsed.title || content,
          enhancedTitle: parsed.enhancedTitle || parsed.title || content,
          description: parsed.description || `Task: ${content}`,
          estimatedTime: parsed.estimatedTime || '30 minutes',
          priority: parsed.priority || 'medium',
          subtasks: parsed.subtasks || [content],
          category: parsed.category || 'general',
          deadline: parsed.deadline,
          dependencies: parsed.dependencies
        };
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackTaskEnhancement(content);
    }
  }

  private getFallbackTaskEnhancement(input: string): TaskEnhancement {
    return {
      originalTask: input,
      enhancedTitle: input,
      description: `Task: ${input}`,
      estimatedTime: '30 minutes',
      priority: 'medium',
      subtasks: [input],
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