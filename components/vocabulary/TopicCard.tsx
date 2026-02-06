import Link from 'next/link';
import type { VocabularyTopic } from '@/lib/vocabulary/types';
import type { TopicProgress } from '@/lib/vocabulary/progress';
import { getTopicStatus } from '@/lib/vocabulary/progress';
import { TopicProgressBadge } from './TopicProgressBadge';
import { ArrowRight } from 'lucide-react';

interface TopicCardProps {
  topic: VocabularyTopic;
  progress?: TopicProgress | null;
  isReviewDismissed?: boolean;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export function TopicCard({ topic, progress, isReviewDismissed }: TopicCardProps) {
  const rawStatus = getTopicStatus(progress ?? null);
  const status = rawStatus === 'review-due' && isReviewDismissed ? 'completed' : rawStatus;

  return (
    <Link
      href={`/vocabulary/${topic.id}`}
      className={`block p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow border cursor-pointer ${
        status === 'review-due'
          ? 'border-amber-300 dark:border-amber-700'
          : 'border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{topic.icon}</span>
        <div className="flex items-center gap-2">
          <TopicProgressBadge status={status} bestScore={progress?.bestScore} />
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(topic.difficulty)}`}>
            {topic.difficulty}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-1">{topic.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{topic.nameVietnamese}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{topic.description}</p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">{topic.wordCount} words</span>
        <span
          className={`font-medium inline-flex items-center gap-1 ${
            status === 'review-due'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-blue-500'
          }`}
        >
          {status === 'not-started' && 'Start Learning'}
          {status === 'completed' && 'Practice More'}
          {status === 'review-due' && 'Review Now'}
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
