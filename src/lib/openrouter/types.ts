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