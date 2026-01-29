'use client';

import { useState, useCallback } from 'react';

interface UseFlashcardReturn {
  currentIndex: number;
  isFlipped: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  toggleFlip: () => void;
  resetFlip: () => void;
}

export function useFlashcard(totalCards: number): UseFlashcardReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const goToPrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToIndex = useCallback((index: number) => {
    setIsFlipped(false);
    setCurrentIndex(Math.max(0, Math.min(index, totalCards - 1)));
  }, [totalCards]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const resetFlip = useCallback(() => {
    setIsFlipped(false);
  }, []);

  return {
    currentIndex,
    isFlipped,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleFlip,
    resetFlip,
  };
}
