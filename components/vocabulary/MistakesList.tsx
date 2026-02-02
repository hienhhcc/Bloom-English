'use client';

import Link from 'next/link';
import { useMistakes } from '@/hooks/useMistakes';
import type { VocabularyTopic, VocabularyItem } from '@/lib/vocabulary/types';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface MistakesListProps {
  topics: VocabularyTopic[];
  vocabularyByTopic: Map<string, VocabularyItem[]>;
  onStartReview?: (topicId: string) => void;
  onStartReviewAll?: () => void;
}

export function MistakesList({
  topics,
  vocabularyByTopic,
  onStartReview,
  onStartReviewAll,
}: MistakesListProps) {
  const { allMistakes, mistakesByTopic, totalMistakesCount, isLoaded } = useMistakes();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (totalMistakesCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-800">
        <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <AlertCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No mistakes yet!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete some quizzes to track words you need to practice.
        </p>
      </div>
    );
  }

  // Get topics that have mistakes
  const topicsWithMistakes = topics.filter((topic) => {
    const mistakes = mistakesByTopic.get(topic.id);
    return mistakes && mistakes.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalMistakesCount} word{totalMistakesCount !== 1 ? 's' : ''} to review
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              From {topicsWithMistakes.length} topic{topicsWithMistakes.length !== 1 ? 's' : ''}
            </p>
          </div>
          {onStartReviewAll && (
            <button
              onClick={onStartReviewAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Review All
            </button>
          )}
        </div>
      </div>

      {/* Topics with mistakes */}
      <div className="space-y-4">
        {topicsWithMistakes.map((topic) => {
          const mistakes = mistakesByTopic.get(topic.id) || [];
          const topicVocabulary = vocabularyByTopic.get(topic.id) || [];
          const vocabularyMap = new Map(topicVocabulary.map((v) => [v.id, v]));

          return (
            <div
              key={topic.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{topic.icon}</span>
                  <div>
                    <h4 className="font-semibold">{topic.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mistakes.length} word{mistakes.length !== 1 ? 's' : ''} to review
                    </p>
                  </div>
                </div>
                {onStartReview && (
                  <button
                    onClick={() => onStartReview(topic.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Review
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {mistakes.map((mistake) => {
                    const vocab = vocabularyMap.get(mistake.itemId);
                    if (!vocab) return null;

                    return (
                      <Link
                        key={mistake.itemId}
                        href={`/vocabulary/${topic.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                      >
                        <span className="font-medium">{vocab.word}</span>
                        {mistake.timesWrong > 1 && (
                          <span className="text-xs text-red-500 dark:text-red-400">
                            x{mistake.timesWrong}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
