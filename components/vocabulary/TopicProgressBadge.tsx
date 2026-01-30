'use client';

import { Check, Clock } from 'lucide-react';
import type { TopicStatus } from '@/lib/vocabulary/progress';

interface TopicProgressBadgeProps {
  status: TopicStatus;
  bestScore?: number | null;
}

export function TopicProgressBadge({ status, bestScore }: TopicProgressBadgeProps) {
  if (status === 'not-started') {
    return null;
  }

  if (status === 'review-due') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full animate-pulse">
        <Clock className="w-3 h-3" />
        <span>Review Due</span>
      </div>
    );
  }

  // status === 'completed'
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
      <Check className="w-3 h-3" />
      {bestScore !== null && bestScore !== undefined ? (
        <span>Best: {bestScore}%</span>
      ) : (
        <span>Completed</span>
      )}
    </div>
  );
}
