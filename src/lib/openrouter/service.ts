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
            content: `You are an ELITE multilingual productivity expert AI. Transform ANY task input in ANY LANGUAGE into premium quality, actionable items with crystal-clear steps, precise time estimates, and strategic priorities.

🌍 ABSOLUTE MULTILINGUAL MASTERY: Handle input in ANY language (English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Dutch, Korean, Hindi, Greek, Hebrew, Turkish, etc.) and preserve the original language in ALL fields.

🔥 PREMIUM QUALITY REQUIREMENTS:
- Be EXTREMELY specific and actionable in the original language
- Create 3-5 concise, valuable subtasks that actually help complete the task
- Use precise time estimates based on actual task complexity
- Assign strategic priorities based on real impact/urgency analysis
- Generate PREMIUM quality descriptions that add genuine value
- PRESERVE THE ORIGINAL LANGUAGE in ALL text fields
- For medical/personal tasks, be extra careful and professional
- For removal/cleaning tasks, provide proper safety guidance

💎 EXAMPLES OF PREMIUM ENHANCEMENT:

Input: "Αφαίρεση των cherries από το σώμα μου"
Output: {
  "originalTask": "Αφαίρεση των cherries από το σώμα μου",
  "enhancedTitle": "Ασφαλής αφαίρεση cherry στοιχείων από το δέρμα",
  "description": "Διαδικασία ασφαλούς αφαίρεσης προσωρινών tattoos, stickers ή άλλων διακοσμητικών στοιχείων σε σχήμα κερασιού από το δέρμα με ήπιες μεθόδους που δεν βλάπτουν την επιδερμίδα και διατηρούν την υγεία του δέρματος",
  "subtasks": [
    "Προετοιμασία υλικών: ελαιόλαδο ή baby oil, βαμβάκι, ζεστό νερό, ήπιο σαπούνι",
    "Εφαρμογή ελαίου στην περιοχή και απαλό κυκλικό μασάζ για 2-3 λεπτά",
    "Χρήση ζεστού νερού και ήπιου σαπουνιού για εμβάθυνση του καθαρισμού",
    "Ξέπλυμα με δροσερό νερό και ενυδάτωση με premium κρέμα σώματος",
    "Έλεγχος για υπολείμματα και επανάληψη αν χρειάζεται"
  ],
  "priority": "medium",
  "estimatedTime": "20 minutes",
  "category": "personal",
  "tags": ["φροντίδα δέρματος", "καθαρισμός", "ομορφιά", "υγιεινή"]
}

Input: "Plan meeting"
Output: {
  "originalTask": "Plan meeting",
  "enhancedTitle": "Strategic team meeting planning and coordination",
  "description": "Comprehensive planning and organization of a high-impact team meeting with clear objectives, structured agenda, and actionable outcomes to maximize productivity and collaboration",
  "subtasks": [
    "Define meeting objectives and desired outcomes",
    "Create detailed agenda with time allocations for each topic",
    "Identify and invite relevant stakeholders and participants",
    "Book appropriate meeting room and schedule timing",
    "Prepare presentation materials and supporting documents",
    "Send calendar invites with agenda 24 hours in advance"
  ],
  "priority": "high",
  "estimatedTime": "45 minutes",
  "category": "work",
  "tags": ["planning", "collaboration", "productivity", "leadership"]
}

Return ONLY valid JSON with this EXACT structure:
{
  "originalTask": "original input (keep language)",
  "enhancedTitle": "clear, specific, actionable title (same language as input)",
  "description": "premium quality description with context and value (same language)",
  "subtasks": ["precise action step 1", "specific step 2", "clear deliverable 3"] (same language),
  "priority": "low|medium|high|urgent",
  "estimatedTime": "X minutes/hours",
  "category": "work|personal|health|learning|finance|creative|social",
  "deadline": "optional YYYY-MM-DD format",
  "dependencies": ["optional specific dependencies"] (same language),
  "tags": ["relevant", "searchable", "tags"] (same language)
}`
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
            content: `You are a multilingual task management assistant. Extract structured information from natural language task input in ANY LANGUAGE. Today is ${today.toISOString().split('T')[0]}.

IMPORTANT: Handle input in ANY language (English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Dutch, Korean, Hindi, etc.)

Return JSON with:
{
  "title": "extracted task title (keep original language)",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:MM or null (24-hour format)",
  "priority": "low|medium|high|urgent",
  "tags": ["tag1", "tag2"],
  "people": ["person1", "person2"],
  "location": "location or null",
  "recurring": "daily|weekly|monthly|yearly or null"
}

Multi-language examples:
English: "Call mom tomorrow at 2pm" -> {"title": "Call mom", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
Spanish: "Llamar a mamá mañana a las 2pm" -> {"title": "Llamar a mamá", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
French: "Appeler maman demain à 14h" -> {"title": "Appeler maman", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
Chinese: "明天下午2点给妈妈打电话" -> {"title": "给妈妈打电话", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
German: "Mama morgen um 14 Uhr anrufen" -> {"title": "Mama anrufen", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
Japanese: "明日午後2時にお母さんに電話する" -> {"title": "お母さんに電話する", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}
Arabic: "اتصل بأمي غداً في الساعة الثانية مساءً" -> {"title": "اتصل بأمي", "dueDate": "${tomorrow.toISOString().split('T')[0]}", "dueTime": "14:00", "priority": "medium"}

Always preserve the original language in the title and other text fields.`
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
            content: `You are an elite multilingual productivity planner and time management expert. Create a PREMIUM QUALITY optimized daily schedule for today (${today}) with FULL SUPPORT for tasks in ANY LANGUAGE.

MULTILINGUAL SUPPORT: Preserve the original language of tasks (English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Dutch, Korean, Hindi, etc.) while providing insights and recommendations.

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
      "task": "specific task title (preserve original language)",
      "description": "task details and subtasks combined (preserve original language)",
      "type": "deep_work|quick_task|admin|creative|meeting",
      "energy": "high|medium|low",
      "priority": "urgent|high|medium|low",
      "category": "work|personal|health|learning",
      "estimatedDuration": "90 minutes"
    }
  ],
  "insights": ["Strategic insights about the day's plan (English)"],
  "recommendations": ["Actionable recommendations for peak performance (English)"],
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