'use client';

import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useFlashcard } from '@/hooks/useFlashcard';
import { Flashcard } from './Flashcard';
import { ProgressIndicator } from './ProgressIndicator';
import { CombinedQuiz } from './CombinedQuiz';
import { BookCheck, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <p className="text-muted-foreground">No vocabulary items found.</p>
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
            <Button
              onClick={startQuiz}
              className="w-full"
            >
              <BookCheck className="size-5" />
              Check Knowledge
            </Button>
            <Button
              variant="outline"
              onClick={goToNext}
              className="w-full"
            >
              <GraduationCap className="size-5" />
              I have learned this word
            </Button>
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
