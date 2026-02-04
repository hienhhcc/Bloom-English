'use client';

import Link from 'next/link';
import { Clock, ChevronRight, X } from 'lucide-react';

interface ReviewItem {
  topicId: string;
  topicName: string;
  topicIcon: string;
  reviewType: 'oneDay' | 'oneWeek';
}

interface ReviewRemindersProps {
  reviews: ReviewItem[];
  onDismiss?: (topicId: string, reviewType: 'oneDay' | 'oneWeek') => void;
}

function getReviewBadge(reviewType: 'oneDay' | 'oneWeek'): { label: string; color: string } {
  return reviewType === 'oneDay'
    ? { label: '1 day', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' }
    : { label: '1 week', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' };
}

export function ReviewReminders({ reviews, onDismiss }: ReviewRemindersProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          {reviews.length} review{reviews.length > 1 ? 's' : ''} due
        </span>
      </div>

      {/* Review Cards */}
      <div className="space-y-2">
        {reviews.map((review) => {
          const badge = getReviewBadge(review.reviewType);
          return (
            <div
              key={`${review.topicId}-${review.reviewType}`}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all"
            >
              <Link
                href={`/vocabulary/${review.topicId}?mode=quiz&review=${review.reviewType}`}
                className="flex items-center gap-4 p-4 pr-12"
              >
                {/* Topic Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                  {review.topicIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {review.topicName}
                    </h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ready for review
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDismiss(review.topicId, review.reviewType);
                  }}
                  className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
