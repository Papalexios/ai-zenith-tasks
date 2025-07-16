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

  async enhanceTask(taskInput: string, model: string = OPENROUTER_CONFIG.models.KIMI_K2): Promise<TaskEnhancement> {
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
            content: `You are an ULTRA-PREMIUM multilingual productivity expert AI with PhD-level expertise in task optimization, project management, and cognitive psychology. Transform ANY task input in ANY LANGUAGE into the HIGHEST QUALITY, most actionable, fact-checked, and precisely detailed items possible.

🌍 ABSOLUTE MULTILINGUAL MASTERY: Handle input in ANY language (English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Dutch, Korean, Hindi, Greek, Hebrew, Turkish, etc.) and preserve the original language in ALL fields.

🚀 ULTRA-PREMIUM QUALITY REQUIREMENTS:
- Be EXTREMELY specific, actionable, and fact-checked in the original language
- Create 4-7 ULTRA-DETAILED subtasks that are research-backed and optimized for maximum productivity
- Each subtask must be MEASURABLE, SPECIFIC, and include EXACT steps with micro-actions
- Use SCIENTIFICALLY-BASED time estimates based on cognitive load theory and actual task complexity
- Assign STRATEGIC priorities based on real impact/urgency analysis using proven frameworks
- Generate WORLD-CLASS descriptions that add MASSIVE value and context
- PRESERVE THE ORIGINAL LANGUAGE in ALL text fields
- For medical/personal tasks, be extra careful, professional, and fact-checked
- For removal/cleaning tasks, provide proper safety guidance with specific product recommendations
- Include PRODUCTIVITY HACKS and EFFICIENCY TIPS in subtasks
- Make subtasks GRANULAR enough to eliminate decision fatigue
- Add QUALITY CONTROL checkpoints in subtasks
- Include RESOURCE REQUIREMENTS and PREPARATION steps
- Add TIME-SAVING techniques and OPTIMIZATION strategies

💎 EXAMPLES OF ULTRA-PREMIUM ENHANCEMENT:

Input: "Αφαίρεση των cherries από το σώμα μου"
Output: {
  "originalTask": "Αφαίρεση των cherries από το σώμα μου",
  "enhancedTitle": "Ασφαλής αφαίρεση cherry στοιχείων από το δέρμα",
  "description": "Διαδικασία ασφαλούς αφαίρεσης προσωρινών tattoos, stickers ή άλλων διακοσμητικών στοιχείων σε σχήμα κερασιού από το δέρμα με ήπιες μεθόδους που δεν βλάπτουν την επιδερμίδα και διατηρούν την υγεία του δέρματος",
  "subtasks": [
    "ΠΡΟΕΤΟΙΜΑΣΙΑ (5 λεπτά): Συλλογή υλικών - 100% virgin ελαιόλαδο ή Johnson's baby oil, βαμβάκι χωρίς χημικές προσθήκες, ζεστό νερό 37-40°C, ήπιο σαπούνι χωρίς αλκοόλη (όπως Dove sensitive), καθαρή πετσέτα μικροϊνών",
    "ΕΦΑΡΜΟΓΗ ΕΛΑΙΟΥ (3 λεπτά): Βρέξιμο βαμβακιού με ελαιόλαδο, εφαρμογή με απαλό κυκλικό μασάζ για 2-3 λεπτά χωρίς πίεση στην επιδερμίδα, αφήνοντας το έλαιο να διαπεράσει τα κολλητικά στοιχεία",
    "ΚΑΘΑΡΙΣΜΟΣ (4 λεπτά): Χρήση ζεστού νερού με ήπιο σαπούνι για εμβάθυνση του καθαρισμού, αφρίζοντας απαλά την περιοχή και αφαιρώντας τα υπολείμματα ελαίου και κόλλας",
    "ΞΕΠΛΥΜΑ & ΕΝΥΔΑΤΩΣΗ (3 λεπτά): Πλύσιμο με δροσερό νερό 20-25°C για κλείσιμο των πόρων, στέγνωμα με ταμπονάρισμα (όχι τρίψιμο), εφαρμογή premium κρέμας σώματος με υαλουρονικό οξύ",
    "ΕΛΕΓΧΟΣ ΠΟΙΟΤΗΤΑΣ (2 λεπτά): Επιθεώρηση για υπολείμματα κόλλας ή χρώματος, έλεγχος για ερεθισμό δέρματος, επανάληψη διαδικασίας αν χρειάζεται με μεγαλύτερη διάρκεια μασάζ",
    "ΑΝΤΙΜΕΤΩΠΙΣΗ ΠΡΟΒΛΗΜΑΤΩΝ (2 λεπτά): Σε περίπτωση επίμονων υπολειμμάτων, εφαρμογή rubbing alcohol 70% με βαμβάκι, αποφυγή αλκοόλ σε ευαίσθητες περιοχές, εφαρμογή aloe vera gel σε περίπτωση ερεθισμού"
  ],
  "priority": "medium",
  "estimatedTime": "19 minutes",
  "category": "personal",
  "tags": ["φροντίδα δέρματος", "καθαρισμός", "ομορφιά", "υγιεινή"]
}

Input: "Plan meeting"
Output: {
  "originalTask": "Plan meeting",
  "enhancedTitle": "Strategic team meeting planning and coordination",
  "description": "Comprehensive planning and organization of a high-impact team meeting with clear objectives, structured agenda, and actionable outcomes to maximize productivity and collaboration",
  "subtasks": [
    "OBJECTIVES DEFINITION (8 minutes): Define 3-5 SMART objectives using the MoSCoW method (Must/Should/Could/Won't), identify key success metrics, establish clear desired outcomes with quantifiable results, create decision-making framework for agenda items",
    "AGENDA CREATION (12 minutes): Build time-boxed agenda with 5-minute buffer zones, allocate specific time slots (10 min intro, 20 min main topic, 5 min Q&A), assign topic owners and preparation requirements, include pre-read materials with 48-hour advance notice",
    "STAKEHOLDER ANALYSIS (10 minutes): Identify decision-makers vs. information-only participants using RACI matrix, determine optimal meeting size (6-8 people max for productivity), send personalized invitations with role expectations, prepare participant-specific talking points",
    "LOGISTICS OPTIMIZATION (8 minutes): Book meeting room with A/V capabilities, whiteboard, and video conferencing, schedule during peak productivity hours (10 AM - 2 PM), ensure backup technical setup, prepare physical materials (notebooks, pens, name tags)",
    "CONTENT PREPARATION (12 minutes): Create presentation deck with maximum 1 slide per 2 minutes, prepare supporting documents in shared folder, develop contingency plans for key discussion points, create action item tracking template",
    "COMMUNICATION STRATEGY (7 minutes): Send calendar invites with agenda 24 hours in advance, include pre-meeting preparation checklist, set up follow-up email template, establish meeting ground rules (phones off, active participation expected)",
    "QUALITY ASSURANCE (3 minutes): Review agenda for flow and timing, confirm all participants can access materials, test technology setup, prepare opening and closing statements to maintain structure"
  ],
  "priority": "high",
  "estimatedTime": "60 minutes",
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
        temperature: 0.3,
        max_tokens: 2000
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
    const pendingTasks = tasks.filter(t => !t.completed);
    
    // If no tasks, return an informative empty plan
    if (pendingTasks.length === 0) {
      return this.createEmptyPlan();
    }
    
    // Sort tasks by priority and urgency for optimal scheduling
    const sortedTasks = this.optimizeTaskOrder(pendingTasks);
    
    try {
      // Always try AI first, with robust fallback
      const aiPlan = await this.generateAIPlan(sortedTasks);
      
      // If AI succeeds but returns empty timeBlocks, enhance with our algorithm
      if (aiPlan && (!aiPlan.timeBlocks || aiPlan.timeBlocks.length === 0)) {
        aiPlan.timeBlocks = this.createOptimizedTimeBlocks(sortedTasks);
      }
      
      // Enhance the plan with our optimization
      return this.enhancePlanQuality(aiPlan, sortedTasks);
      
    } catch (error) {
      console.error('AI plan generation failed, using premium fallback:', error);
      return this.createPremiumFallbackPlan(sortedTasks);
    }
  }

  private createEmptyPlan() {
    return {
      timeBlocks: [],
      dailySummary: {
        totalTasks: 0,
        urgentTasks: 0,
        highPriorityTasks: 0,
        estimatedWorkload: "0 hours",
        peakProductivityHours: "9:00-11:00, 14:00-16:00"
      },
      insights: ['No pending tasks found. Add some tasks to generate your daily plan!'],
      recommendations: ['Create tasks to get started with your productivity journey'],
      totalFocusTime: '0 hours',
      productivityScore: 0,
      energyOptimization: 'optimal',
      contextSwitching: 'none',
      stressLevel: 'low'
    };
  }

  private optimizeTaskOrder(tasks: any[]) {
    return tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      // Factor in due dates for urgency
      const today = new Date();
      const aUrgent = a.dueDate && new Date(a.dueDate) <= today ? 2 : 0;
      const bUrgent = b.dueDate && new Date(b.dueDate) <= today ? 2 : 0;
      
      return (bPriority + bUrgent) - (aPriority + aUrgent);
    });
  }

  private async generateAIPlan(sortedTasks: any[]) {
    const model = OPENROUTER_CONFIG.models.DEEPSEEK_R1T2_CHIMERA;
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an ELITE productivity optimization expert. Create the MOST EFFICIENT daily schedule that maximizes productivity and minimizes stress.

🎯 CORE OPTIMIZATION PRINCIPLES:
1. URGENT TASKS → 9:00-11:00 AM (peak cognitive performance)
2. HIGH PRIORITY → 11:00 AM-2:00 PM (sustained focus period)
3. MEDIUM PRIORITY → 2:00-4:00 PM (good productivity window)
4. LOW PRIORITY → 4:00-6:00 PM (administrative time)

⚡ ENERGY & COGNITIVE OPTIMIZATION:
- Peak energy (9-11 AM): Complex problem-solving, strategic thinking, creative work
- High energy (11 AM-2 PM): Deep work, important communications, decision-making
- Medium energy (2-4 PM): Routine tasks, planning, review activities
- Lower energy (4-6 PM): Admin, organization, simple tasks

🧠 ADVANCED SCHEDULING RULES:
- Deep work blocks: 90-120 minutes for complex tasks
- Quick tasks: 15-30 minutes, batch similar ones together
- Context switching buffers: 10-15 minutes between different task types
- Natural break points: Every 90 minutes for sustained performance

RETURN PERFECT JSON (no markdown, no explanations):
{
  "timeBlocks": [
    {
      "id": "unique-id",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "taskId": "task-id",
      "task": "Task title (original language)",
      "description": "Specific actions and outcomes (original language)",
      "type": "deep_work|quick_task|admin|creative|meeting|break",
      "energy": "high|medium|low",
      "priority": "urgent|high|medium|low",
      "category": "work|personal|health|learning|finance|creative",
      "estimatedTime": "X hours Y minutes",
      "focusLevel": "high|medium|low",
      "contextGroup": "grouping identifier"
    }
  ],
  "dailySummary": {
    "totalTasks": 8,
    "urgentTasks": 2,
    "highPriorityTasks": 3,
    "estimatedWorkload": "7.5 hours",
    "peakProductivityHours": "9:00-11:00, 14:00-16:00"
  },
  "insights": [
    "Strategic insight about task optimization",
    "Energy management recommendation",
    "Productivity enhancement tip"
  ],
  "recommendations": [
    "Specific actionable productivity advice",
    "Time management strategy",
    "Focus optimization technique"
  ],
  "totalFocusTime": "6 hours 30 minutes",
  "productivityScore": 92,
  "energyOptimization": "optimal",
  "contextSwitching": "minimal",
  "stressLevel": "low"
}`
          },
          {
            role: 'user',
            content: `Create OPTIMAL daily schedule for these prioritized tasks:

${JSON.stringify(sortedTasks.map(t => ({
  id: t.id,
  title: t.title,
  description: t.description,
  priority: t.priority,
  category: t.category,
  estimatedTime: t.estimatedTime,
  dueDate: t.dueDate
})))}

Schedule Requirements:
- Working hours: 9:00 AM - 6:00 PM (9 hours)
- Schedule ALL tasks efficiently
- Optimize for peak productivity
- Include realistic time estimates
- No time overlaps
- Group similar tasks when possible`
          }
        ],
        temperature: 0.1,
        max_tokens: 2500
      });

      const content = completion.choices[0].message.content || '{}';
      
      // Multi-layer JSON parsing with robust error handling
      const parsedPlan = this.parseAIResponse(content);
      
      // Validate and enhance the parsed plan
      return this.validateAndEnhancePlan(parsedPlan, sortedTasks);
      
    } catch (error) {
      console.error('AI plan generation failed:', error);
      throw error; // Let the caller handle the fallback
    }
  }

  private parseAIResponse(content: string): any {
    try {
      // First, try to clean the content
      let cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      // Try direct parsing first
      try {
        return JSON.parse(cleanContent);
      } catch (firstParseError) {
        console.warn('First JSON parse failed, trying alternative cleaning:', firstParseError);
        
        // More aggressive cleaning
        cleanContent = cleanContent
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":')
          .replace(/"\s*([^"]+)\s*"/g, '"$1"');
        
        // Try parsing again
        try {
          return JSON.parse(cleanContent);
        } catch (secondParseError) {
          console.warn('Second JSON parse failed, extracting JSON block:', secondParseError);
          
          // Try to extract JSON from the response
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          
          throw new Error('Could not extract valid JSON from AI response');
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw error;
    }
  }

  private validateAndEnhancePlan(plan: any, tasks: any[]): any {
    // Ensure plan has required structure
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan structure');
    }
    
    // Validate and fix timeBlocks
    if (!Array.isArray(plan.timeBlocks)) {
      plan.timeBlocks = [];
    }
    
    // If no timeBlocks or incomplete ones, create optimized blocks
    if (plan.timeBlocks.length === 0 || plan.timeBlocks.length < tasks.length) {
      plan.timeBlocks = this.createOptimizedTimeBlocks(tasks);
    }
    
    // Validate each time block
    plan.timeBlocks = plan.timeBlocks.map((block: any, index: number) => ({
      id: block.id || `ai-block-${index}`,
      startTime: block.startTime || this.calculateTimeSlot(index).start,
      endTime: block.endTime || this.calculateTimeSlot(index).end,
      taskId: block.taskId || tasks[index]?.id || `task-${index}`,
      task: block.task || tasks[index]?.title || `Task ${index + 1}`,
      description: block.description || `Focus session: ${block.task}`,
      type: block.type || this.getOptimalTaskType(tasks[index]),
      energy: block.energy || this.getOptimalEnergyLevel(9 + index * 1.5),
      priority: block.priority || tasks[index]?.priority || 'medium',
      category: block.category || tasks[index]?.category || 'general',
      estimatedTime: block.estimatedTime || this.formatDuration(1.5),
      focusLevel: block.focusLevel || (block.priority === 'urgent' || block.priority === 'high' ? 'high' : 'medium'),
      contextGroup: block.contextGroup || block.category
    }));
    
    // Ensure all required fields
    plan.dailySummary = plan.dailySummary || {
      totalTasks: tasks.length,
      urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
      estimatedWorkload: `${Math.ceil(tasks.length * 1.5)} hours`,
      peakProductivityHours: "9:00-11:00, 14:00-16:00"
    };
    
    plan.insights = plan.insights || [
      `Optimized schedule created for ${tasks.length} tasks`,
      'High-priority tasks scheduled during peak energy hours',
      'Strategic time blocks designed for maximum productivity'
    ];
    
    plan.recommendations = plan.recommendations || [
      'Start with your most important task during peak energy',
      'Take 5-minute breaks between tasks to maintain focus',
      'Adjust timing based on your actual progress'
    ];
    
    plan.totalFocusTime = plan.totalFocusTime || `${Math.ceil(tasks.length * 1.5)} hours`;
    plan.productivityScore = plan.productivityScore || Math.min(95, 75 + (tasks.length * 3));
    plan.energyOptimization = plan.energyOptimization || 'optimal';
    plan.contextSwitching = plan.contextSwitching || 'minimal';
    plan.stressLevel = plan.stressLevel || 'low';
    
    return plan;
  }

  private calculateTimeSlot(index: number) {
    const startHour = 9 + Math.floor(index * 1.5);
    const endHour = Math.min(18, startHour + 1.5);
    return {
      start: `${startHour.toString().padStart(2, '0')}:00`,
      end: `${Math.floor(endHour).toString().padStart(2, '0')}:${Math.floor((endHour % 1) * 60).toString().padStart(2, '0')}`
    };
  }

  private createOptimizedTimeBlocks(tasks: any[]) {
    const timeBlocks = [];
    let currentTime = 9; // Start at 9 AM
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // Calculate optimal duration based on task complexity and priority
      let duration = this.calculateOptimalDuration(task, i);
      
      // Ensure we don't go past 6 PM
      if (currentTime + duration > 18) {
        duration = Math.max(0.5, 18 - currentTime);
      }
      
      const startHour = Math.floor(currentTime);
      const startMin = Math.floor((currentTime % 1) * 60);
      const endTime = currentTime + duration;
      const endHour = Math.floor(endTime);
      const endMin = Math.floor((endTime % 1) * 60);
      
      timeBlocks.push({
        id: `optimized-block-${i}`,
        startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
        taskId: task.id,
        task: task.title,
        description: task.description || `Focus session: ${task.title}`,
        type: this.getOptimalTaskType(task),
        energy: this.getOptimalEnergyLevel(currentTime),
        priority: task.priority,
        category: task.category,
        estimatedTime: this.formatDuration(duration),
        focusLevel: task.priority === 'urgent' || task.priority === 'high' ? 'high' : 'medium',
        contextGroup: task.category
      });
      
      // Add buffer time and move to next slot
      currentTime = endTime + 0.25; // 15 minute buffer
      
      // Stop if we've reached end of day
      if (currentTime >= 18) break;
    }
    
    return timeBlocks;
  }

  private calculateOptimalDuration(task: any, index: number) {
    // Base duration on priority and position in schedule
    const baseDuration = {
      'urgent': 1.5,
      'high': 1.25,
      'medium': 1.0,
      'low': 0.75
    }[task.priority] || 1.0;
    
    // Adjust for peak energy times
    const peakTimeMultiplier = index < 3 ? 1.2 : index < 6 ? 1.0 : 0.8;
    
    return Math.max(0.5, Math.min(2.0, baseDuration * peakTimeMultiplier));
  }

  private getOptimalTaskType(task: any) {
    if (task.category === 'work' && (task.priority === 'urgent' || task.priority === 'high')) {
      return 'deep_work';
    } else if (task.category === 'creative' || task.category === 'learning') {
      return 'creative';
    } else if (task.priority === 'low' || task.category === 'personal') {
      return 'admin';
    }
    return 'quick_task';
  }

  private getOptimalEnergyLevel(currentTime: number) {
    if (currentTime < 11) return 'high';
    if (currentTime < 14) return 'high';
    if (currentTime < 16) return 'medium';
    return 'low';
  }

  private formatDuration(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    if (h > 0 && m > 0) return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${m} minutes`;
  }

  private enhancePlanQuality(plan: any, tasks: any[]) {
    return {
      ...plan,
      timeBlocks: plan.timeBlocks || this.createOptimizedTimeBlocks(tasks),
      dailySummary: {
        totalTasks: tasks.length,
        urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        estimatedWorkload: this.calculateTotalWorkload(plan.timeBlocks || []),
        peakProductivityHours: "9:00-11:00, 11:00-14:00"
      },
      insights: plan.insights?.length ? plan.insights : [
        `Optimized schedule created for ${tasks.length} tasks`,
        'High-priority tasks scheduled during peak cognitive performance',
        'Strategic time blocks designed for maximum productivity'
      ],
      recommendations: plan.recommendations?.length ? plan.recommendations : [
        'Start with your most critical task at 9 AM during peak energy',
        'Take micro-breaks between tasks to maintain mental clarity',
        'Adjust timing based on your actual progress throughout the day'
      ],
      totalFocusTime: plan.totalFocusTime || this.calculateTotalFocusTime(plan.timeBlocks || []),
      productivityScore: Math.min(98, 85 + (tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length * 3)),
      energyOptimization: 'optimal',
      contextSwitching: 'minimal',
      stressLevel: 'low'
    };
  }

  private createPremiumFallbackPlan(tasks: any[]) {
    return {
      timeBlocks: this.createOptimizedTimeBlocks(tasks),
      dailySummary: {
        totalTasks: tasks.length,
        urgentTasks: tasks.filter(t => t.priority === 'urgent').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
        estimatedWorkload: `${Math.ceil(tasks.length * 1.2)} hours`,
        peakProductivityHours: "9:00-11:00, 11:00-14:00"
      },
      insights: [
        `Premium schedule generated with ${tasks.length} optimized time blocks`,
        'Tasks prioritized using advanced productivity algorithms',
        'Schedule designed for peak performance and minimal stress'
      ],
      recommendations: [
        'Begin with urgent tasks during peak morning energy (9-11 AM)',
        'Use the Pomodoro technique for deep work sessions',
        'Review and celebrate task completion throughout the day'
      ],
      totalFocusTime: this.calculateTotalFocusTime(this.createOptimizedTimeBlocks(tasks)),
      productivityScore: Math.min(96, 82 + (tasks.length * 2)),
      energyOptimization: 'optimal',
      contextSwitching: 'minimal',
      stressLevel: 'low'
    };
  }

  private calculateTotalWorkload(timeBlocks: any[]) {
    const totalHours = timeBlocks.reduce((total, block) => {
      const start = this.timeToDecimal(block.startTime);
      const end = this.timeToDecimal(block.endTime);
      return total + (end - start);
    }, 0);
    return this.formatDuration(totalHours);
  }

  private calculateTotalFocusTime(timeBlocks: any[]) {
    const focusBlocks = timeBlocks.filter(b => b.type === 'deep_work' || b.focusLevel === 'high');
    const totalHours = focusBlocks.reduce((total, block) => {
      const start = this.timeToDecimal(block.startTime);
      const end = this.timeToDecimal(block.endTime);
      return total + (end - start);
    }, 0);
    return this.formatDuration(totalHours);
  }

  private timeToDecimal(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
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
        // Validate that insights is an array and has proper structure
        if (!Array.isArray(insights)) {
          throw new Error('Insights is not an array');
        }
        // Validate each insight has required fields
        insights = insights.map(insight => ({
          type: insight.type || 'productivity',
          title: insight.title || 'Productivity Tip',
          description: insight.description || 'Keep up the great work!',
          actionable: insight.actionable || false,
          priority: insight.priority || 3
        }));
      } catch (parseError) {
        console.warn('Failed to parse AI insights, using premium fallback');
        insights = [
          {
            type: 'productivity',
            title: '🚀 Peak Performance Mode',
            description: 'You\'re optimizing your workflow with advanced AI scheduling - maintain this momentum!',
            actionable: true,
            priority: 1
          },
          {
            type: 'energy',
            title: '⚡ Energy Optimization',
            description: 'Your tasks are scheduled during peak energy hours for maximum productivity.',
            actionable: false,
            priority: 2
          },
          {
            type: 'suggestion',
            title: '🎯 Focus Strategy',
            description: 'Complete one task at a time to maintain deep focus and avoid context switching.',
            actionable: true,
            priority: 2
          }
        ];
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