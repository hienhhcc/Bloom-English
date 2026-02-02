'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useTopicQuiz, type QuizResult, type UseTopicQuizOptions } from '@/hooks/useTopicQuiz';
import { useProgress } from '@/hooks/useProgress';
import { CombinedQuiz } from './CombinedQuiz';
import { QuizResults } from './QuizResults';
import { ProgressIndicator } from './ProgressIndicator';
import type { ActiveReviewPosition } from '@/lib/vocabulary/progress';

interface TopicQuizProps {
  items: VocabularyItem[];
  topicId: string;
  onExit: () => void;
  onQuizComplete?: (score: { correct: number; total: number }, results: QuizResult[]) => void;
  isFirstCompletion?: boolean;
  reviewType?: 'oneDay' | 'oneWeek';
}

// Inner component that handles the actual quiz logic
function TopicQuizInner({
  items,
  topicId,
  onExit,
  onQuizComplete,
  isFirstCompletion = false,
  reviewType,
  savedPosition,
  saveReviewPosition,
  clearReviewPosition,
}: TopicQuizProps & {
  savedPosition: ActiveReviewPosition | null;
  saveReviewPosition: (topicId: string, position: ActiveReviewPosition) => void;
  clearReviewPosition: (topicId: string) => void;
}) {
  // Build initial state from saved position
  const initialState = useMemo((): UseTopicQuizOptions['initialState'] => {
    if (!savedPosition) return undefined;

    // Convert saved results back to QuizResult format
    const itemMap = new Map(items.map((item) => [item.id, item]));
    const restoredResults: QuizResult[] = [];

    for (const r of savedPosition.results) {
      const item = itemMap.get(r.itemId);
      if (!item) {
        // Item not found, can't restore
        return undefined;
      }
      restoredResults.push({
        item,
        userAnswer: r.userAnswer,
        isCorrect: r.isCorrect,
      });
    }

    return {
      shuffledItemIds: savedPosition.shuffledItemIds,
      currentIndex: savedPosition.currentIndex,
      results: restoredResults,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only compute on mount

  // Position change handler - only save in review mode
  const handlePositionChange = useCallback(
    (position: Omit<ActiveReviewPosition, 'reviewType'>) => {
      if (!reviewType) return;

      saveReviewPosition(topicId, {
        ...position,
        reviewType,
      });
    },
    [reviewType, topicId, saveReviewPosition]
  );

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
  } = useTopicQuiz(items, {
    initialState,
    onPositionChange: reviewType ? handlePositionChange : undefined,
  });

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
      onQuizComplete(score, results);

      // Clear saved position when review is completed
      if (reviewType) {
        clearReviewPosition(topicId);
      }
    }
  }, [isComplete, onQuizComplete, score, results, reviewType, topicId, clearReviewPosition]);

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

// Outer component that handles loading state and provides saved position
export function TopicQuiz({
  items,
  topicId,
  onExit,
  onQuizComplete,
  isFirstCompletion = false,
  reviewType,
}: TopicQuizProps) {
  const { saveReviewPosition, getReviewPosition, clearReviewPosition, isLoaded } = useProgress();

  // Get saved position if this is a review mode
  const savedPosition = useMemo(() => {
    if (!isLoaded || !reviewType) return null;
    return getReviewPosition(topicId, reviewType);
  }, [isLoaded, reviewType, topicId, getReviewPosition]);

  // Wait for progress to load if we're in review mode (so we can restore position)
  if (reviewType && !isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Use a key that changes when savedPosition is first loaded in review mode
  // This ensures the inner component gets the correct initial state
  const key = reviewType ? `${topicId}-${savedPosition ? 'restored' : 'fresh'}` : topicId;

  return (
    <TopicQuizInner
      key={key}
      items={items}
      topicId={topicId}
      onExit={onExit}
      onQuizComplete={onQuizComplete}
      isFirstCompletion={isFirstCompletion}
      reviewType={reviewType}
      savedPosition={savedPosition}
      saveReviewPosition={saveReviewPosition}
      clearReviewPosition={clearReviewPosition}
    />
  );
}
