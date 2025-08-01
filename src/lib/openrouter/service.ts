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

  async enhanceTask(taskInput: string, useBackgroundMode = false): Promise<TaskEnhancement> {
    const cacheKey = `enhance_${taskInput}_${useBackgroundMode ? 'quality' : 'lightning'}`;
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    try {
      // LIGHTNING response for instant user feedback (< 700ms)
      const models = useBackgroundMode 
        ? OPENROUTER_CONFIG.qualityModels 
        : OPENROUTER_CONFIG.lightningModels;
      const timeout = useBackgroundMode ? 12000 : 700; // 12s for quality, 700ms for lightning
      
      console.log(`⚡ ${useBackgroundMode ? 'Quality processing' : 'Lightning enhancement'} with: ${models[0]}`);
      
      const response = await Promise.race([
        this.client.chat.completions.create({
          model: models[0],
          messages: [
            {
              role: 'system',
              content: useBackgroundMode 
                ? `Premium AI productivity consultant. Provide comprehensive task analysis with deep insights.

RESPOND ONLY with valid JSON:
{
  "originalTask": "original input task",
  "enhancedTitle": "Professionally crafted, specific task title",
  "description": "Detailed, strategic description with context and best practices",
  "estimatedTime": "X minutes" or "X hours",
  "priority": "low" | "medium" | "high" | "urgent",
  "subtasks": ["Detailed step 1 with specific actions", "Step 2 with clear deliverables", "Step 3 with measurable outcomes", "Step 4 with verification", "Final step with completion criteria"],
  "category": "work" | "personal" | "health" | "learning" | "finance" | "creative" | "social" | "general"
}

Provide 4-6 comprehensive subtasks with strategic depth.`
                : `Ultra-fast task enhancement AI. Respond in <700ms with actionable breakdown.

RESPOND ONLY with valid JSON:
{
  "originalTask": "original input task",
  "enhancedTitle": "Clear, actionable task title",
  "description": "Brief but helpful context",
  "estimatedTime": "X minutes",
  "priority": "low" | "medium" | "high" | "urgent", 
  "subtasks": ["Quick action 1", "Quick action 2", "Quick action 3"],
  "category": "work" | "personal" | "health" | "learning" | "general"
}

Focus on speed and immediate actionability.`
            },
            {
              role: 'user',
              content: `Enhance: "${taskInput}"`
            }
          ],
          temperature: useBackgroundMode ? 0.6 : 0.2,
          max_tokens: useBackgroundMode ? 1000 : 400
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      if (!response.choices[0]?.message?.content) {
        throw new Error('No response content');
      }

      const enhancement = this.parseTaskResponse(response.choices[0].message.content);
      this.responseCache.set(cacheKey, enhancement);
      this.trackModelUsage(models[0]);

      // Always enhance in background unless already in background mode
      if (!useBackgroundMode) {
        setTimeout(() => this.refineTaskInBackground(taskInput, enhancement), 50);
      }

      return enhancement;

    } catch (error) {
      console.warn(`${useBackgroundMode ? 'Quality' : 'Lightning'} enhancement failed, trying speed models:`, error);
      
      // Fallback to speed models for immediate response
      const speedModels = OPENROUTER_CONFIG.speedModels;
      for (let i = 0; i < speedModels.length; i++) {
        try {
          const speedModel = speedModels[i];
          console.log(`🏃 Speed fallback: ${speedModel}`);
          
          const response = await Promise.race([
            this.client.chat.completions.create({
              model: speedModel,
              messages: [
                {
                  role: 'system',
                  content: `Fast task enhancement. JSON only.`
                },
                {
                  role: 'user',
                  content: `Task: "${taskInput}"`
                }
              ],
              temperature: 0.2,
              max_tokens: 300
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Speed timeout')), 2000)
            )
          ]);

          if (response.choices[0]?.message?.content) {
            const enhancement = this.parseTaskResponse(response.choices[0].message.content);
            this.responseCache.set(cacheKey, enhancement);
            this.trackModelUsage(speedModel);
            return enhancement;
          }
        } catch (speedError) {
          console.warn(`Speed fallback ${i} failed:`, speedError);
          continue;
        }
      }

      // Ultimate fallback
      return this.getFallbackTaskEnhancement(taskInput);
    }
  }

  private refineTaskInBackground(taskInput: string, initialEnhancement: TaskEnhancement) {
    // Start background refinement with quality models after fast response
    setTimeout(async () => {
      try {
        const refinedEnhancement = await this.enhanceTask(taskInput, true);
        if (refinedEnhancement && refinedEnhancement.subtasks.length > initialEnhancement.subtasks.length) {
          // Cache the improved version for future use
          this.responseCache.set(`refined_${taskInput}`, refinedEnhancement);
        }
      } catch (error) {
        console.warn('Background refinement failed:', error);
      }
    }, 100);
  }

  async parseNaturalLanguage(input: string): Promise<any> {
    // LIGHTNING parsing using the fastest model with ultra-minimal timeout
    const lightningModel = OPENROUTER_CONFIG.lightningModels[0];
    const timeout = 800; // 800ms max for instant feel
    
    try {
      const completionPromise = this.client.chat.completions.create({
        model: lightningModel,
        messages: [
          {
            role: 'system',
            content: `Lightning-fast NLP parser. Extract task info in <800ms. Return ONLY JSON:
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
        temperature: 0.05,
        max_tokens: 150
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Lightning parse timeout')), timeout);
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
      const content = completion.choices[0]?.message?.content || '{}';
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('⚡ Lightning parsing completed');
      return JSON.parse(cleanContent);
    } catch (error) {
      console.warn('Lightning parse failed, instant fallback:', error);
      // Instant fallback for uninterrupted UX
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

  private async generateLightningPlan(tasks: any[], userPreferences: any = {}): Promise<any> {
    // Ultra-aggressive lightning planning using fastest model (< 1s)
    const lightningModel = OPENROUTER_CONFIG.lightningModels[0];
    const timeout = 1000; // 1 second max for instant response
    
    try {
      const planPromise = this.client.chat.completions.create({
        model: lightningModel,
        messages: [
          {
            role: 'system',
            content: `Lightning-fast daily planner. Return JSON instantly:
            {
              "title": "Today's AI-Optimized Plan",
              "totalEstimatedTime": "X hours",
              "timeBlocks": [
                {
                  "id": "block_1",
                  "task": "task name",
                  "startTime": "09:00",
                  "endTime": "10:30",
                  "priority": "high",
                  "energy": "high", 
                  "type": "work",
                  "taskId": "id"
                }
              ],
              "insights": ["Lightning insight"]
            }`
          },
          {
            role: 'user',
            content: `Lightning plan: ${tasks.slice(0, 4).map(t => `${t.title} (${t.priority})`).join(', ')}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Lightning timeout')), timeout);
      });

      const completion = await Promise.race([planPromise, timeoutPromise]) as any;
      const response = completion.choices[0]?.message?.content;

      if (response) {
        const plan = this.parsePlanResponse(response);
        if (plan && this.validatePlan(plan)) {
          console.log('⚡ Lightning plan generated successfully');
          return plan;
        }
      }
    } catch (error) {
      console.warn('Lightning plan failed:', error);
    }

    return null;
  }

  private async generateFastPlan(tasks: any[], userPreferences: any = {}): Promise<any> {
    // Fast planning using speed models (< 2s)
    const speedModel = OPENROUTER_CONFIG.speedModels[0];
    const timeout = 2000; // 2 second max for speed response
    
    try {
      const planPromise = this.client.chat.completions.create({
        model: speedModel,
        messages: [
          {
            role: 'system',
            content: `Fast daily planner. Return optimized JSON:
            {
              "title": "Today's Optimized Plan",
              "totalEstimatedTime": "X hours",
              "timeBlocks": [
                {
                  "id": "block_1",
                  "task": "task name",
                  "startTime": "09:00",
                  "endTime": "10:30",
                  "priority": "high",
                  "energy": "high", 
                  "type": "work",
                  "taskId": "id"
                }
              ],
              "insights": ["Speed insight 1", "Speed insight 2"]
            }`
          },
          {
            role: 'user',
            content: `Speed plan for ${Math.min(tasks.length, 6)} tasks: ${tasks.slice(0, 6).map(t => `${t.title} (${t.priority})`).join(', ')}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Speed timeout')), timeout);
      });

      const completion = await Promise.race([planPromise, timeoutPromise]) as any;
      const response = completion.choices[0]?.message?.content;

      if (response) {
        const plan = this.parsePlanResponse(response);
        if (plan && this.validatePlan(plan)) {
          console.log('🏃 Speed plan generated successfully');
          return plan;
        }
      }
    } catch (error) {
      console.warn('Speed plan failed:', error);
    }

    return null;
  }

  private optimizePlanInBackground(tasks: any[], userPreferences: any, initialPlan: any) {
    // Immediate background optimization with quality models
    setTimeout(async () => {
      try {
        const qualityModel = OPENROUTER_CONFIG.qualityModels[0];
        const optimizedPlan = await this.generateDetailedPlan(tasks, userPreferences, qualityModel);
        
        if (optimizedPlan && this.validatePlan(optimizedPlan)) {
          this.responseCache.set(`optimized_plan_${Date.now()}`, JSON.stringify(optimizedPlan));
          console.log('Background plan optimization completed with quality model');
        }
      } catch (error) {
        console.warn('Background optimization failed:', error);
      }
    }, 50); // Start optimization immediately
  }

  private async generateDetailedPlan(tasks: any[], userPreferences: any, model: string): Promise<any> {
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Expert productivity planner. Create optimal schedule with deep analysis and time management principles.`
        },
        {
          role: 'user',
          content: `Create detailed optimized plan: ${JSON.stringify(tasks.slice(0, 8))}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    return this.parsePlanResponse(completion.choices[0].message.content || '{}');
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
    // Ultra-fast insights using fastest model with immediate fallback
    const fastModel = OPENROUTER_CONFIG.fastModels[0];
    const timeout = 1500; // 1.5 second max for instant insights
    
    try {
      const completionPromise = this.client.chat.completions.create({
        model: fastModel,
        messages: [
          {
            role: 'system',
            content: `Lightning-fast productivity coach. Return ONLY JSON array:
            [
              {
                "type": "productivity",
                "title": "Quick tip",
                "description": "Instant actionable advice",
                "actionable": true,
                "priority": 1
              }
            ]`
          },
          {
            role: 'user',
            content: `Quick insights: ${JSON.stringify(userContext).slice(0, 200)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Coaching timeout')), timeout);
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
      const content = completion.choices[0]?.message?.content || '[]';
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const insights = JSON.parse(cleanContent);
      
      // Start background enhancement with quality models
      this.enhanceInsightsInBackground(userContext);
      
      return Array.isArray(insights) ? insights.slice(0, 3) : this.getFallbackInsights();
    } catch (error) {
      return this.getFallbackInsights();
    }
  }

  private enhanceInsightsInBackground(userContext: any) {
    setTimeout(async () => {
      try {
        const qualityModel = OPENROUTER_CONFIG.qualityModels[0];
        const enhancedInsights = await this.generateDetailedInsights(userContext, qualityModel);
        if (enhancedInsights) {
          this.responseCache.set(`enhanced_insights_${Date.now()}`, JSON.stringify(enhancedInsights));
        }
      } catch (error) {
        console.warn('Background insight enhancement failed:', error);
      }
    }, 100);
  }

  private async generateDetailedInsights(userContext: any, model: string): Promise<AIInsight[]> {
    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Expert productivity coach. Provide deep, personalized insights with advanced productivity science.`
        },
        {
          role: 'user',
          content: `Detailed analysis for: ${JSON.stringify(userContext)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = completion.choices[0].message.content || '[]';
    try {
      return JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      return [];
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