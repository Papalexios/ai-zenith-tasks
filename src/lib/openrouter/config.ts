// OpenRouter Configuration
export const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  models: {
    // Fast models (prioritized for speed)
    DEEPSEEK_CHAT_V3: 'deepseek/deepseek-chat-v3-0324:free',
    QWEN3_235B: 'qwen/qwen3-235b-a22b-2507:free',
    KIMI_K2: 'moonshotai/kimi-k2:free',
    // Slower but more capable models
    DEEPSEEK_R1T2_CHIMERA: 'tngtech/deepseek-r1t2-chimera:free',
    DEEPSEEK_R1_0528: 'deepseek/deepseek-r1-0528:free',
    DEEPSEEK_R1: 'deepseek/deepseek-r1:free',
    GEMINI_25_PRO: 'google/gemini-2.5-pro-exp-03-25'
  },
  // Model priority order: fastest first, most capable last
  modelPriority: [
    'deepseek/deepseek-chat-v3-0324:free',
    'qwen/qwen3-235b-a22b-2507:free', 
    'moonshotai/kimi-k2:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'deepseek/deepseek-r1-0528:free',
    'deepseek/deepseek-r1:free',
    'google/gemini-2.5-pro-exp-03-25'
  ],
  headers: {
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Productivity Assistant'
  }
};