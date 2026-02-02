'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { useMistakes } from '@/hooks/useMistakes';
import type { VocabularyTopic } from '@/lib/vocabulary/types';
import { ReviewReminders } from './ReviewReminders';
import { TopicCard } from './TopicCard';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface VocabularyPageContentProps {
  topics: VocabularyTopic[];
}

export function VocabularyPageContent({ topics }: VocabularyPageContentProps) {
  const { progress, isLoaded, getDueReviews } = useProgress();
  const { totalMistakesCount, isLoaded: mistakesLoaded } = useMistakes();

  const dueReviews = getDueReviews();

  // Create a map of topic info for the reminders
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  const reviewsWithTopicInfo = dueReviews
    .map((review) => {
      const topic = topicMap.get(review.topicId);
      if (!topic) return null;
      return {
        ...review,
        topicName: topic.name,
        topicIcon: topic.icon,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <>
      {isLoaded && reviewsWithTopicInfo.length > 0 && (
        <ReviewReminders reviews={reviewsWithTopicInfo} />
      )}

      {/* Review Mistakes Card */}
      {mistakesLoaded && totalMistakesCount > 0 && (
        <Link
          href="/vocabulary/mistakes"
          className="block mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Review Mistakes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalMistakesCount} word{totalMistakesCount !== 1 ? 's' : ''} need practice
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            progress={isLoaded ? progress?.topics[topic.id] : null}
          />
        ))}
      </div>
    </>
  );
}
