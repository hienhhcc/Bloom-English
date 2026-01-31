'use client';

import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useFlashcard } from '@/hooks/useFlashcard';
import { Flashcard } from './Flashcard';
import { ProgressIndicator } from './ProgressIndicator';
import { CombinedQuiz } from './CombinedQuiz';
import { BookCheck, GraduationCap } from 'lucide-react';

interface FlashcardContainerProps {
  items: VocabularyItem[];
}

export function FlashcardContainer({ items }: FlashcardContainerProps) {
  const {
    currentIndex,
    isFlipped,
    viewMode,
    goToNext,
    toggleFlip,
    startQuiz,
  } = useFlashcard(items.length);

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No vocabulary items found.</p>
      </div>
    );
  }

  const handleQuizComplete = () => {
    goToNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator current={currentIndex} total={items.length} />

      {viewMode === 'flashcard' && (
        <>
          <Flashcard
            item={currentItem}
            isFlipped={isFlipped}
            onFlip={toggleFlip}
          />

          <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
            <button
              onClick={startQuiz}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <BookCheck className="w-5 h-5" />
              Check Knowledge
            </button>
            <button
              onClick={goToNext}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" />
              I have learned this word
            </button>
          </div>
        </>
      )}

      {viewMode === 'quiz' && (
        <CombinedQuiz
          item={currentItem}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
