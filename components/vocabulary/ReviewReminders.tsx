'use client';

import Link from 'next/link';
import { Bell, X } from 'lucide-react';

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
    ? { label: '1 day', color: 'bg-white/80 text-amber-700 dark:bg-amber-900/80 dark:text-amber-200' }
    : { label: '1 week', color: 'bg-white/80 text-orange-700 dark:bg-orange-900/80 dark:text-orange-200' };
}

export function ReviewReminders({ reviews, onDismiss }: ReviewRemindersProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 dark:bg-amber-500">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
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
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <Link
                href={`/vocabulary/${review.topicId}?mode=quiz&review=${review.reviewType}`}
                className="flex items-center gap-3 p-3 pr-10"
              >
                {/* Topic Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-xl">
                  {review.topicIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {review.topicName}
                    </h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Ready for review
                  </p>
                </div>
              </Link>

              {/* Dismiss Button - top right of each card */}
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDismiss(review.topicId, review.reviewType);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
