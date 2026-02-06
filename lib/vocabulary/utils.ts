import type { VietnameseDefinition } from './types';

export function normalizeVietnameseDefinitions(
  def: string | VietnameseDefinition[]
): VietnameseDefinition[] {
  if (Array.isArray(def)) return def;
  if (def.includes('|')) {
    return def
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ type: '', definition: s }));
  }
  return [{ type: '', definition: def }];
}

export function getPartOfSpeechColor(pos: string): string {
  const normalizedPos = pos.toLowerCase().trim();
  switch (normalizedPos) {
    case 'noun':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'verb':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'adjective':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'adverb':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}
