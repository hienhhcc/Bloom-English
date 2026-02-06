'use client';

import { useMistakes } from '@/hooks/useMistakes';
import { useProgress } from '@/hooks/useProgress';
import { getTopicStatus } from '@/lib/vocabulary/progress';
import type { DifficultyLevel, VocabularyTopic } from '@/lib/vocabulary/types';
import { AlertCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AddTopicModal } from './AddTopicModal';
import { AddVocabularyModal } from './AddVocabularyModal';
import { ReviewReminders } from './ReviewReminders';
import { TopicCard } from './TopicCard';
import { TopicFilters, type SortOption, type StatusFilter } from './TopicFilters';

interface VocabularyPageContentProps {
  topics: VocabularyTopic[];
}

const difficultyOrder: Record<DifficultyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function VocabularyPageContent({ topics }: VocabularyPageContentProps) {
  const {
    progress,
    isLoaded,
    getDueReviews,
    dismissReviewAlert,
    isReviewAlertDismissed,
    dismissMistakesAlert,
    isMistakesAlertDismissed,
    getTopicProgress,
  } = useProgress();
  const { totalMistakesCount, isLoaded: mistakesLoaded } = useMistakes();

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('added-desc');

  // Modal state
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showAddVocabularyModal, setShowAddVocabularyModal] = useState(false);

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    let result = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (topic) =>
          topic.name.toLowerCase().includes(query) ||
          topic.nameVietnamese.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all' && isLoaded) {
      result = result.filter((topic) => {
        const topicProgress = getTopicProgress(topic.id);
        const status = getTopicStatus(topicProgress);
        return status === statusFilter;
      });
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter((topic) => topic.difficulty === difficultyFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'added-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'added-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'words-asc':
          return a.wordCount - b.wordCount;
        case 'words-desc':
          return b.wordCount - a.wordCount;
        case 'difficulty-asc':
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'difficulty-desc':
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        default:
          return 0;
      }
    });

    return result;
  }, [topics, searchQuery, statusFilter, difficultyFilter, sortOption, isLoaded, getTopicProgress]);

  const dueReviews = getDueReviews();

  // Create a map of topic info for the reminders
  const topicMap = new Map(topics.map((t) => [t.id, t]));

  // Filter out dismissed reviews
  const reviewsWithTopicInfo = dueReviews
    .filter((review) => !isReviewAlertDismissed(review.topicId, review.reviewType))
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

  // Check if mistakes alert should be shown
  const showMistakesAlert =
    mistakesLoaded &&
    totalMistakesCount > 0 &&
    !isMistakesAlertDismissed(totalMistakesCount);

  return (
    <>
      {isLoaded && reviewsWithTopicInfo.length > 0 && (
        <ReviewReminders
          reviews={reviewsWithTopicInfo}
          onDismiss={dismissReviewAlert}
        />
      )}

      {/* Review Mistakes Card */}
      {showMistakesAlert && (
        <div className="relative mb-6 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-red-50 dark:from-red-950/40 dark:via-rose-950/40 dark:to-red-950/40 border border-red-200 dark:border-red-800/60 p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-400 dark:bg-red-500">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-red-800 dark:text-red-200 uppercase tracking-wide">
              {totalMistakesCount} word{totalMistakesCount !== 1 ? 's' : ''} to review
            </span>
          </div>

          {/* Mistakes Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all">
            <Link
              href="/vocabulary/mistakes"
              className="flex items-center gap-3 p-3 pr-10"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-xl">
                📝
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                    Review Mistakes
                  </h3>
                  <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/80 text-red-700 dark:bg-red-900/80 dark:text-red-200">
                    {totalMistakesCount}
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Practice misspelled words
                </p>
              </div>
            </Link>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissMistakesAlert(totalMistakesCount)}
              className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={() => setShowAddVocabularyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Research specific Words</span>
        </button>
        <button
          onClick={() => setShowAddTopicModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Research a new Topic</span>
        </button>
      </div>

      {/* Search, Filter, and Sort */}
      <TopicFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        resultCount={filteredTopics.length}
        totalCount={topics.length}
      />

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const dueReview = dueReviews.find((r) => r.topicId === topic.id);
            const reviewDismissed = dueReview
              ? isReviewAlertDismissed(dueReview.topicId, dueReview.reviewType)
              : false;
            return (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={isLoaded ? progress?.topics[topic.id] : null}
                isReviewDismissed={reviewDismissed}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No topics found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={showAddTopicModal}
        onClose={() => setShowAddTopicModal(false)}
      />

      {/* Add Vocabulary Modal */}
      <AddVocabularyModal
        isOpen={showAddVocabularyModal}
        onClose={() => setShowAddVocabularyModal(false)}
        topics={topics}
      />
    </>
  );
}
