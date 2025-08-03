// Enterprise-grade input validation and sanitization utility

export class InputValidator {
  private static readonly MAX_TITLE_LENGTH = 500;
  private static readonly MAX_DESCRIPTION_LENGTH = 2000;
  private static readonly MAX_TAG_LENGTH = 50;
  private static readonly MAX_TAGS_COUNT = 20;

  // HTML sanitization patterns
  private static readonly HTML_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*>/gi,
    /<meta\b[^<]*>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi
  ];

  // SQL injection patterns
  private static readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION|OR|AND)\s+\d+\s*=\s*\d+/gi,
    /['"]\s*(OR|AND)\s+['"]\w*['"]\s*=\s*['"]\w*['"](\s*--|\s*#)/gi,
    /(\b(WAITFOR|DELAY)\b)/gi
  ];

  // XSS patterns
  private static readonly XSS_PATTERNS = [
    /<\s*script/gi,
    /&lt;\s*script/gi,
    /&#60;\s*script/gi,
    /\\u003c\s*script/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi
  ];

  static validateTaskTitle(title: string): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!title || typeof title !== 'string') {
      return { isValid: false, sanitized: '', errors: ['Title is required'] };
    }

    let sanitized = this.sanitizeInput(title.trim());
    
    if (sanitized.length === 0) {
      errors.push('Title cannot be empty');
    }
    
    if (sanitized.length > this.MAX_TITLE_LENGTH) {
      sanitized = sanitized.substring(0, this.MAX_TITLE_LENGTH);
      errors.push(`Title was truncated to ${this.MAX_TITLE_LENGTH} characters`);
    }

    if (this.containsSuspiciousContent(sanitized)) {
      errors.push('Title contains potentially unsafe content');
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  static validateTaskDescription(description?: string): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!description) {
      return { isValid: true, sanitized: '', errors: [] };
    }

    if (typeof description !== 'string') {
      return { isValid: false, sanitized: '', errors: ['Description must be text'] };
    }

    let sanitized = this.sanitizeInput(description.trim());
    
    if (sanitized.length > this.MAX_DESCRIPTION_LENGTH) {
      sanitized = sanitized.substring(0, this.MAX_DESCRIPTION_LENGTH);
      errors.push(`Description was truncated to ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }

    if (this.containsSuspiciousContent(sanitized)) {
      errors.push('Description contains potentially unsafe content');
    }

    return {
      isValid: true, // Description errors are warnings, not blockers
      sanitized,
      errors
    };
  }

  static validatePriority(priority: string): { isValid: boolean; sanitized: string; errors: string[] } {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const sanitized = this.sanitizeInput(priority?.toLowerCase() || 'medium');
    
    if (!validPriorities.includes(sanitized)) {
      return {
        isValid: true, // Use fallback
        sanitized: 'medium',
        errors: ['Invalid priority, defaulting to medium']
      };
    }

    return { isValid: true, sanitized, errors: [] };
  }

  static validateCategory(category: string): { isValid: boolean; sanitized: string; errors: string[] } {
    const validCategories = ['work', 'personal', 'health', 'learning', 'finance', 'creative', 'social', 'general'];
    const sanitized = this.sanitizeInput(category?.toLowerCase() || 'general');
    
    if (!validCategories.includes(sanitized)) {
      return {
        isValid: true, // Use fallback
        sanitized: 'general',
        errors: ['Invalid category, defaulting to general']
      };
    }

    return { isValid: true, sanitized, errors: [] };
  }

  static validateTags(tags: string[]): { isValid: boolean; sanitized: string[]; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(tags)) {
      return { isValid: false, sanitized: [], errors: ['Tags must be an array'] };
    }

    let sanitized = tags
      .map(tag => this.sanitizeInput(tag?.toString() || '').trim())
      .filter(tag => tag.length > 0 && tag.length <= this.MAX_TAG_LENGTH);

    if (sanitized.length > this.MAX_TAGS_COUNT) {
      sanitized = sanitized.slice(0, this.MAX_TAGS_COUNT);
      errors.push(`Only first ${this.MAX_TAGS_COUNT} tags were kept`);
    }

    // Check for suspicious content in tags
    sanitized = sanitized.filter(tag => {
      if (this.containsSuspiciousContent(tag)) {
        errors.push(`Removed potentially unsafe tag: "${tag}"`);
        return false;
      }
      return true;
    });

    return { isValid: true, sanitized, errors };
  }

  static validateDate(dateString?: string): { isValid: boolean; sanitized: string | null; errors: string[] } {
    if (!dateString) {
      return { isValid: true, sanitized: null, errors: [] };
    }

    const sanitized = this.sanitizeInput(dateString);
    const date = new Date(sanitized);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) {
      return { isValid: false, sanitized: null, errors: ['Invalid date format'] };
    }

    if (date < today) {
      return { isValid: false, sanitized: null, errors: ['Due date cannot be in the past'] };
    }

    return { isValid: true, sanitized: sanitized, errors: [] };
  }

  static validateTime(timeString?: string): { isValid: boolean; sanitized: string | null; errors: string[] } {
    if (!timeString) {
      return { isValid: true, sanitized: null, errors: [] };
    }

    const sanitized = this.sanitizeInput(timeString);
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(sanitized)) {
      return { isValid: false, sanitized: null, errors: ['Invalid time format (use HH:MM)'] };
    }

    return { isValid: true, sanitized, errors: [] };
  }

  private static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove HTML tags and dangerous patterns
    this.HTML_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove potential XSS patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove SQL injection patterns
    this.SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  private static containsSuspiciousContent(input: string): boolean {
    const suspiciousPatterns = [
      ...this.HTML_PATTERNS,
      ...this.XSS_PATTERNS,
      ...this.SQL_PATTERNS,
      /\bhref\s*=\s*["']?javascript:/gi,
      /\bsrc\s*=\s*["']?javascript:/gi,
      /@import/gi,
      /url\s*\(\s*["']?javascript:/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Enterprise validation for bulk operations
  static validateBulkTaskInput(tasks: any[]): { valid: any[]; invalid: any[]; errors: string[] } {
    const valid: any[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];

    if (!Array.isArray(tasks)) {
      return { valid: [], invalid: [], errors: ['Input must be an array'] };
    }

    if (tasks.length > 100) {
      errors.push('Bulk operations limited to 100 tasks at once');
      tasks = tasks.slice(0, 100);
    }

    tasks.forEach((task, index) => {
      const taskErrors: string[] = [];
      
      const titleValidation = this.validateTaskTitle(task.title);
      const descValidation = this.validateTaskDescription(task.description);
      const priorityValidation = this.validatePriority(task.priority);
      const categoryValidation = this.validateCategory(task.category);
      const tagsValidation = this.validateTags(task.tags || []);
      const dateValidation = this.validateDate(task.dueDate);
      const timeValidation = this.validateTime(task.dueTime);

      if (!titleValidation.isValid) {
        taskErrors.push(...titleValidation.errors);
      }

      taskErrors.push(...descValidation.errors);
      taskErrors.push(...priorityValidation.errors);
      taskErrors.push(...categoryValidation.errors);
      taskErrors.push(...tagsValidation.errors);

      if (!dateValidation.isValid) {
        taskErrors.push(...dateValidation.errors);
      }

      if (!timeValidation.isValid) {
        taskErrors.push(...timeValidation.errors);
      }

      if (taskErrors.length === 0) {
        valid.push({
          ...task,
          title: titleValidation.sanitized,
          description: descValidation.sanitized,
          priority: priorityValidation.sanitized,
          category: categoryValidation.sanitized,
          tags: tagsValidation.sanitized,
          dueDate: dateValidation.sanitized,
          dueTime: timeValidation.sanitized
        });
      } else {
        invalid.push({
          index,
          task,
          errors: taskErrors
        });
        errors.push(`Task ${index + 1}: ${taskErrors.join(', ')}`);
      }
    });

    return { valid, invalid, errors };
  }
}