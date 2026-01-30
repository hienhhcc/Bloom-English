'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

interface ReviewItem {
  topicId: string;
  topicName: string;
  topicIcon: string;
  reviewType: 'oneDay' | 'oneWeek';
}

interface ReviewRemindersProps {
  reviews: ReviewItem[];
}

function getReviewLabel(reviewType: 'oneDay' | 'oneWeek'): string {
  return reviewType === 'oneDay' ? '1-day review' : '1-week review';
}

export function ReviewReminders({ reviews }: ReviewRemindersProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
        <Calendar className="w-5 h-5" />
        <span className="font-semibold">
          You have {reviews.length} review{reviews.length > 1 ? 's' : ''} due
        </span>
      </div>

      <div className="space-y-2">
        {reviews.map((review) => (
          <Link
            key={`${review.topicId}-${review.reviewType}`}
            href={`/vocabulary/${review.topicId}`}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{review.topicIcon}</span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {review.topicName}
                </span>
                <span className="text-sm text-amber-600 dark:text-amber-400 ml-2">
                  {getReviewLabel(review.reviewType)}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
              Review Now
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
