import type { VocabularyItem } from '@/lib/vocabulary/types';
import { AudioButton } from './AudioButton';

interface FlashcardFrontProps {
  item: VocabularyItem;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

function getPartOfSpeechColor(pos: string): string {
  switch (pos) {
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

export function FlashcardFront({ item }: FlashcardFrontProps) {
  return (
    <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
          {item.difficulty}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${getPartOfSpeechColor(item.partOfSpeech)}`}>
          {item.partOfSpeech}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">{item.word}</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{item.phonetic}</p>

        <div className="flex gap-2 mb-6">
          <AudioButton text={item.word} />
          <AudioButton text={item.word} slow />
        </div>

        <div className="space-y-3 w-full max-w-md">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">English</p>
            <p className="text-gray-800 dark:text-gray-200">{item.definitionEnglish}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vietnamese</p>
            <p className="text-gray-800 dark:text-gray-200">{item.definitionVietnamese}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">Click to flip</p>
    </div>
  );
}
