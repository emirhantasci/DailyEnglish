export const APP_NAME = 'LinguaFlame';
export const PASSING_SCORE = 70;
export const DAILY_WORD_COUNT = 5;
export const EXAM_QUESTION_COUNT = 20;
export const POINTS_PER_QUESTION = 5;
export const STREAK_FREEZE_INTERVAL = 10;
export const MAX_CONSECUTIVE_MISSED_DAYS = 3;
export const TURKEY_UTC_OFFSET = 3;

export const OPENROUTER_API_KEY = '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';
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const FREE_MODEL = 'mistralai/mistral-7b-instruct:free';

// Legacy single-user constant removed — app now uses multi-user auth

export const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  intermediate: { bg: 'bg-brand-500/20', text: 'text-brand-400', border: 'border-brand-500/30' },
  advanced: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'emotion': '💭',
  'personality': '🧠',
  'nature': '🌿',
  'travel': '✈️',
  'health': '🏥',
  'food': '🍽️',
  'culture': '🎭',
  'academic': '📚',
  'daily': '💬',
  'business': '💼',
  'crime': '🔍',
  'weather': '🌤️',
  'arts': '🎨',
  'home': '🏠',
  'money': '💰',
  'body': '🦴',
  'action': '⚡',
  'description': '🏷️',
  'phrasal-verb': '🔗',
  'idiom': '🗝️',
};
