'use client';

import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useFlashcard } from '@/hooks/useFlashcard';
import { Flashcard } from './Flashcard';
import { ProgressIndicator } from './ProgressIndicator';
import { NavigationControls } from './NavigationControls';

interface FlashcardContainerProps {
  items: VocabularyItem[];
}

export function FlashcardContainer({ items }: FlashcardContainerProps) {
  const {
    currentIndex,
    isFlipped,
    goToNext,
    goToPrevious,
    toggleFlip,
  } = useFlashcard(items.length);

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No vocabulary items found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator current={currentIndex} total={items.length} />

      <Flashcard
        item={currentItem}
        isFlipped={isFlipped}
        onFlip={toggleFlip}
      />

      <NavigationControls
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasPrevious={true}
        hasNext={true}
      />
    </div>
  );
}
