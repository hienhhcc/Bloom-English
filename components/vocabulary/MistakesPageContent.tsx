'use client';

import { useState, useCallback, useMemo } from 'react';
import type { VocabularyTopic, VocabularyItem } from '@/lib/vocabulary/types';
import { MistakesList } from './MistakesList';
import { TopicQuiz } from './TopicQuiz';
import { useMistakes } from '@/hooks/useMistakes';
import { useProgress } from '@/hooks/useProgress';
import type { QuizResult } from '@/hooks/useTopicQuiz';

type PageMode = 'list' | 'quiz';

interface MistakesPageContentProps {
  topics: VocabularyTopic[];
  vocabularyEntries: [string, VocabularyItem[]][];
}

export function MistakesPageContent({
  topics,
  vocabularyEntries,
}: MistakesPageContentProps) {
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const { mistakesByTopic, isLoaded } = useMistakes();
  const { recordMistakes, clearMistake } = useProgress();

  // Convert entries back to Map
  const vocabularyByTopic = useMemo(
    () => new Map(vocabularyEntries),
    [vocabularyEntries]
  );

  // Get items for the current review
  const reviewItems = useMemo(() => {
    if (!isLoaded) return [];

    if (activeTopicId) {
      // Review specific topic
      const mistakes = mistakesByTopic.get(activeTopicId) || [];
      const vocabulary = vocabularyByTopic.get(activeTopicId) || [];
      const vocabularyMap = new Map(vocabulary.map((v) => [v.id, v]));
      return mistakes
        .map((m) => vocabularyMap.get(m.itemId))
        .filter((v): v is VocabularyItem => v !== undefined);
    } else {
      // Review all mistakes
      const items: VocabularyItem[] = [];
      for (const [topicId, mistakes] of mistakesByTopic) {
        const vocabulary = vocabularyByTopic.get(topicId) || [];
        const vocabularyMap = new Map(vocabulary.map((v) => [v.id, v]));
        for (const mistake of mistakes) {
          const vocab = vocabularyMap.get(mistake.itemId);
          if (vocab) {
            items.push(vocab);
          }
        }
      }
      return items;
    }
  }, [isLoaded, activeTopicId, mistakesByTopic, vocabularyByTopic]);

  const handleStartReview = useCallback((topicId: string) => {
    setActiveTopicId(topicId);
    setPageMode('quiz');
  }, []);

  const handleStartReviewAll = useCallback(() => {
    setActiveTopicId(null);
    setPageMode('quiz');
  }, []);

  const handleQuizComplete = useCallback(
    (_score: { correct: number; total: number }, results: QuizResult[]) => {
      // For mistakes review, we track by individual items across topics
      // Group results by topic
      const resultsByTopic = new Map<string, QuizResult[]>();

      for (const result of results) {
        // Find which topic this item belongs to
        for (const [topicId, vocabulary] of vocabularyByTopic) {
          if (vocabulary.some((v) => v.id === result.item.id)) {
            const existing = resultsByTopic.get(topicId) || [];
            existing.push(result);
            resultsByTopic.set(topicId, existing);
            break;
          }
        }
      }

      // Process each topic's results
      for (const [topicId, topicResults] of resultsByTopic) {
        const wrongItemIds = topicResults
          .filter((r) => !r.isCorrect)
          .map((r) => r.item.id);
        if (wrongItemIds.length > 0) {
          recordMistakes(topicId, wrongItemIds);
        }

        const correctItemIds = topicResults
          .filter((r) => r.isCorrect)
          .map((r) => r.item.id);
        for (const itemId of correctItemIds) {
          clearMistake(topicId, itemId);
        }
      }
    },
    [vocabularyByTopic, recordMistakes, clearMistake]
  );

  const handleExitQuiz = useCallback(() => {
    setPageMode('list');
    setActiveTopicId(null);
  }, []);

  const activeTopic = useMemo(() => {
    if (!activeTopicId) return null;
    return topics.find((t) => t.id === activeTopicId) || null;
  }, [activeTopicId, topics]);

  if (pageMode === 'quiz' && reviewItems.length > 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">
            {activeTopic ? activeTopic.icon : '📝'}
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {activeTopic ? `Review: ${activeTopic.name}` : 'Review All Mistakes'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {reviewItems.length} word{reviewItems.length !== 1 ? 's' : ''} to review
            </p>
          </div>
        </div>

        <TopicQuiz
          items={reviewItems}
          topicId={activeTopicId || 'all-mistakes'}
          onExit={handleExitQuiz}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  }

  return (
    <MistakesList
      topics={topics}
      vocabularyByTopic={vocabularyByTopic}
      onStartReview={handleStartReview}
      onStartReviewAll={handleStartReviewAll}
    />
  );
}
