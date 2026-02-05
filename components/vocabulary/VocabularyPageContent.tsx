'use client';

import { useMistakes } from '@/hooks/useMistakes';
import { useProgress } from '@/hooks/useProgress';
import { getTopicStatus } from '@/lib/vocabulary/progress';
import type { DifficultyLevel, VocabularyTopic } from '@/lib/vocabulary/types';
import { AlertCircle, ChevronRight, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AddTopicModal } from './AddTopicModal';
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

  // Add topic modal state
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);

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
        <div className="group relative mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-red-700 transition-all">
          <Link
            href="/vocabulary/mistakes"
            className="flex items-center gap-4 p-4 pr-12"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Review Mistakes
                </h3>
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  {totalMistakesCount}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalMistakesCount} word{totalMistakesCount !== 1 ? 's' : ''} need practice
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Dismiss Button */}
          <button
            onClick={() => dismissMistakesAlert(totalMistakesCount)}
            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Topic Button */}
      <div className="flex justify-end mb-4">
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
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              progress={isLoaded ? progress?.topics[topic.id] : null}
            />
          ))}
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
    </>
  );
}
