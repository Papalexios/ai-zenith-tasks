export { OPENROUTER_CONFIG } from './config';
export type { TaskEnhancement, AIInsight } from './types';
export { OpenRouterService } from './service';

// Create and export the service instance
import { OpenRouterService } from './service';
export const openRouterService = new OpenRouterService();