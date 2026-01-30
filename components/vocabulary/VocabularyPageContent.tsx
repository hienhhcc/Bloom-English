'use client';

import type { VocabularyTopic } from '@/lib/vocabulary/types';
import { useProgress } from '@/hooks/useProgress';
import { TopicCard } from './TopicCard';
import { ReviewReminders } from './ReviewReminders';

interface VocabularyPageContentProps {
  topics: VocabularyTopic[];
}

export function VocabularyPageContent({ topics }: VocabularyPageContentProps) {
  const { progress, isLoaded, getDueReviews } = useProgress();

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
