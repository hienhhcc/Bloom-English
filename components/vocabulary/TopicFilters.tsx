'use client';

import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useState } from 'react';
import type { DifficultyLevel } from '@/lib/vocabulary/types';

export type StatusFilter = 'all' | 'not-started' | 'completed' | 'review-due';
export type SortOption = 'added-desc' | 'added-asc' | 'name-asc' | 'name-desc' | 'words-asc' | 'words-desc' | 'difficulty-asc' | 'difficulty-desc';

interface TopicFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  difficultyFilter: DifficultyLevel | 'all';
  onDifficultyChange: (difficulty: DifficultyLevel | 'all') => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  totalCount: number;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'review-due', label: 'Review Due' },
];

const difficultyOptions: { value: DifficultyLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Levels', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'added-desc', label: 'Recently Added' },
  { value: 'added-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'words-asc', label: 'Words (Low to High)' },
  { value: 'words-desc', label: 'Words (High to Low)' },
  { value: 'difficulty-asc', label: 'Difficulty (Easy First)' },
  { value: 'difficulty-desc', label: 'Difficulty (Hard First)' },
];

export function TopicFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  difficultyFilter,
  onDifficultyChange,
  sortOption,
  onSortChange,
  resultCount,
  totalCount,
}: TopicFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = statusFilter !== 'all' || difficultyFilter !== 'all' || searchQuery.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onDifficultyChange('all');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Toggle Row */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onStatusChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    statusFilter === option.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDifficultyChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    difficultyFilter === option.value
                      ? option.color
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      {(hasActiveFilters || searchQuery) && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {resultCount} of {totalCount} topics
          {resultCount === 0 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              — Try adjusting your filters
            </span>
          )}
        </div>
      )}
    </div>
  );
}
