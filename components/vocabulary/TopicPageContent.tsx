'use client';

import { useState, useCallback } from 'react';
import type { VocabularyItem, VocabularyTopic } from '@/lib/vocabulary/types';
import { FlashcardContainer } from './FlashcardContainer';
import { TopicQuiz } from './TopicQuiz';
import { useProgress } from '@/hooks/useProgress';
import { ClipboardList } from 'lucide-react';

type PageMode = 'learning' | 'quiz';

interface TopicPageContentProps {
  topic: VocabularyTopic;
  items: VocabularyItem[];
  initialMode?: PageMode;
}

export function TopicPageContent({ topic, items, initialMode = 'learning' }: TopicPageContentProps) {
  const [pageMode, setPageMode] = useState<PageMode>(initialMode);
  const { recordQuizAttempt, getTopicProgress, markReviewCompleted } = useProgress();

  const topicProgress = getTopicProgress(topic.id);
  const isFirstCompletion = topicProgress === null || topicProgress.completedAt === null;

  const handleQuizComplete = useCallback(
    (score: { correct: number; total: number }) => {
      recordQuizAttempt(topic.id, score);

      // If there's a due review, mark it as completed
      if (topicProgress?.reviewSchedule) {
        const now = Date.now();
        if (
          !topicProgress.reviewSchedule.oneDay.completed &&
          now >= topicProgress.reviewSchedule.oneDay.date
        ) {
          markReviewCompleted(topic.id, 'oneDay');
        } else if (
          topicProgress.reviewSchedule.oneDay.completed &&
          !topicProgress.reviewSchedule.oneWeek.completed &&
          now >= topicProgress.reviewSchedule.oneWeek.date
        ) {
          markReviewCompleted(topic.id, 'oneWeek');
        }
      }
    },
    [recordQuizAttempt, markReviewCompleted, topic.id, topicProgress]
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{topic.icon}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{topic.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{topic.nameVietnamese}</p>
          </div>
        </div>

        {pageMode === 'learning' && (
          <button
            onClick={() => setPageMode('quiz')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="hidden sm:inline">Start Topic Quiz</span>
            <span className="sm:hidden">Quiz</span>
          </button>
        )}
      </div>

      {pageMode === 'learning' ? (
        <FlashcardContainer items={items} />
      ) : (
        <TopicQuiz
          items={items}
          onExit={() => setPageMode('learning')}
          onQuizComplete={handleQuizComplete}
          isFirstCompletion={isFirstCompletion}
        />
      )}
    </>
  );
}
