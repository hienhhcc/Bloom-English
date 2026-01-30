'use client';

import { useState, useCallback, useMemo } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';

export interface QuizResult {
  item: VocabularyItem;
  userAnswer: string;
  isCorrect: boolean;
}

interface UseTopicQuizReturn {
  currentIndex: number;
  currentItem: VocabularyItem | null;
  shuffledItems: VocabularyItem[];
  results: QuizResult[];
  isComplete: boolean;
  score: { correct: number; total: number };
  recordAnswer: (userAnswer: string, isCorrect: boolean) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useTopicQuiz(items: VocabularyItem[]): UseTopicQuizReturn {
  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[]>(() =>
    shuffleArray(items)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);

  const currentItem = shuffledItems[currentIndex] ?? null;
  const isComplete = currentIndex >= shuffledItems.length;

  const score = useMemo(() => {
    const correct = results.filter((r) => r.isCorrect).length;
    return { correct, total: shuffledItems.length };
  }, [results, shuffledItems.length]);

  const recordAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      if (!currentItem) return;

      setResults((prev) => [
        ...prev,
        {
          item: currentItem,
          userAnswer,
          isCorrect,
        },
      ]);
    },
    [currentItem]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const resetQuiz = useCallback(() => {
    setShuffledItems(shuffleArray(items));
    setCurrentIndex(0);
    setResults([]);
  }, [items]);

  return {
    currentIndex,
    currentItem,
    shuffledItems,
    results,
    isComplete,
    score,
    recordAnswer,
    nextQuestion,
    resetQuiz,
  };
}
