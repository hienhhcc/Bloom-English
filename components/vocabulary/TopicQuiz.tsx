'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useTopicQuiz } from '@/hooks/useTopicQuiz';
import { CombinedQuiz } from './CombinedQuiz';
import { QuizResults } from './QuizResults';
import { ProgressIndicator } from './ProgressIndicator';

interface TopicQuizProps {
  items: VocabularyItem[];
  onExit: () => void;
  onQuizComplete?: (score: { correct: number; total: number }) => void;
  isFirstCompletion?: boolean;
}

export function TopicQuiz({
  items,
  onExit,
  onQuizComplete,
  isFirstCompletion = false,
}: TopicQuizProps) {
  const {
    currentIndex,
    currentItem,
    shuffledItems,
    results,
    isComplete,
    score,
    recordAnswer,
    nextQuestion,
    resetQuiz,
  } = useTopicQuiz(items);

  const handleQuizComplete = useCallback(
    (wasCorrect: boolean, userAnswer?: string) => {
      recordAnswer(userAnswer ?? '', wasCorrect);
      nextQuestion();
    },
    [recordAnswer, nextQuestion]
  );

  // Track if we've already recorded this completion
  const hasRecordedRef = useRef(false);

  // Record progress when quiz completes
  useEffect(() => {
    if (isComplete && onQuizComplete && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      onQuizComplete(score);
    }
  }, [isComplete, onQuizComplete, score]);

  // Reset the ref when quiz is reset
  useEffect(() => {
    if (!isComplete) {
      hasRecordedRef.current = false;
    }
  }, [isComplete]);

  if (isComplete) {
    return (
      <QuizResults
        score={score}
        results={results}
        onRetry={resetQuiz}
        onExit={onExit}
        isFirstCompletion={isFirstCompletion}
      />
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator current={currentIndex} total={shuffledItems.length} />

      <CombinedQuiz
        key={currentItem.id}
        item={currentItem}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
