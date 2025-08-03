// OpenRouter Configuration - Optimized for Lightning-Fast Response
export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  
  models: {
    // Lightning-fast models for instant user interactions (< 800ms response)
    HORIZON_BETA: 'openrouter/horizon-beta',             // OpenRouter's ultra-premium fastest model
    DEEPSEEK_CHAT_V3: 'deepseek/deepseek-chat-v3-0324:free',  // Ultra-fast chat
    GLM_45_AIR: 'z-ai/glm-4.5-air:free',                    // Lightning-fast GLM model
    QWEN3_235B: 'qwen/qwen3-235b-a22b-2507:free',        // Blazing fast inference
    KIMI_K2: 'moonshotai/kimi-k2:free',                  // Lightning response
    
    // Premium reasoning models for background refinement (2-10s response)
    DEEPSEEK_R1T2_CHIMERA: 'tngtech/deepseek-r1t2-chimera:free',  // Advanced reasoning
    DEEPSEEK_R1_0528: 'deepseek/deepseek-r1-0528:free',          // Deep reasoning
    GEMINI_25_PRO: 'google/gemini-2.5-pro-exp-03-25'            // Premium capability
  },
  
  // Lightning models: Instant response for user-facing interactions (< 500ms timeout)
  lightningModels: [
    'openrouter/horizon-beta',               // Ultra-premium fastest available
    'z-ai/glm-4.5-air:free',                 // Lightning-fast GLM model
    'deepseek/deepseek-chat-v3-0324:free',   // Ultra-fast chat
    'qwen/qwen3-235b-a22b-2507:free',        // Blazing inference
    'moonshotai/kimi-k2:free'                // Lightning response
  ],
  
  // Speed models: Fast response for immediate feedback (< 2s timeout)
  speedModels: [
    'openrouter/horizon-beta',               // Ultra-premium primary
    'z-ai/glm-4.5-air:free',                 // GLM speed model
    'deepseek/deepseek-chat-v3-0324:free',   // Primary speed model
    'qwen/qwen3-235b-a22b-2507:free',        // Secondary speed
    'moonshotai/kimi-k2:free'                // Tertiary speed
  ],
  
  // Quality models: Background processing and refinement (5-15s timeout)
  qualityModels: [
    'tngtech/deepseek-r1t2-chimera:free',    // Best reasoning
    'deepseek/deepseek-r1-0528:free',        // Deep analysis
    'google/gemini-2.5-pro-exp-03-25',      // Premium quality
    'deepseek/deepseek-chat-v3-0324:free'    // Quality fallback
  ],
  
  // Optimized priority: Ultra-premium lightning first, then speed, then quality
  modelPriority: [
    'openrouter/horizon-beta',               // Ultra-premium: Instant response
    'z-ai/glm-4.5-air:free',                 // GLM: Lightning-fast response
    'deepseek/deepseek-chat-v3-0324:free',   // Speed: Ultra-fast
    'qwen/qwen3-235b-a22b-2507:free',        // Speed: Fast inference  
    'moonshotai/kimi-k2:free',               // Speed: Quick response
    'tngtech/deepseek-r1t2-chimera:free',    // Quality: Advanced reasoning
    'deepseek/deepseek-r1-0528:free',        // Quality: Deep reasoning
    'google/gemini-2.5-pro-exp-03-25'       // Quality: Premium capability
  ],
  
  // Legacy arrays for compatibility
  fastModels: [
    'openrouter/horizon-beta',
    'z-ai/glm-4.5-air:free',
    'deepseek/deepseek-chat-v3-0324:free',
    'qwen/qwen3-235b-a22b-2507:free',
    'moonshotai/kimi-k2:free'
  ],
  
  headers: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Productivity Assistant - Premium Performance'
  }
};