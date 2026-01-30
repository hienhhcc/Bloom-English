"use client";

import {
  STORAGE_KEY,
  createInitialProgress,
  createInitialTopicProgress,
  createReviewSchedule,
  getTopicStatus,
  isReviewDue,
  type LearningProgress,
  type TopicProgress,
  type TopicStatus,
} from "@/lib/vocabulary/progress";
import { useCallback, useEffect, useState } from "react";

interface DueReview {
  topicId: string;
  reviewType: "oneDay" | "oneWeek";
}

interface UseProgressReturn {
  progress: LearningProgress | null;
  isLoaded: boolean;
  getTopicProgress: (topicId: string) => TopicProgress | null;
  getTopicStatusById: (topicId: string) => TopicStatus;
  recordQuizAttempt: (
    topicId: string,
    score: { correct: number; total: number },
  ) => void;
  markReviewCompleted: (
    topicId: string,
    reviewType: "oneDay" | "oneWeek",
  ) => void;
  getDueReviews: () => DueReview[];
}

export function useProgress(): UseProgressReturn {
  // Initialize as null - localStorage is read in useEffect to avoid hydration mismatch
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (legitimate initialization pattern)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LearningProgress;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(parsed);
      } else {
        setProgress(createInitialProgress());
      }
    } catch {
      // If parsing fails, start fresh
      setProgress(createInitialProgress());
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (isLoaded && progress) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        // localStorage might be full or unavailable
        console.error("Failed to save progress to localStorage");
      }
    }
  }, [progress, isLoaded]);

  const getTopicProgress = useCallback(
    (topicId: string): TopicProgress | null => {
      if (!progress) return null;
      return progress.topics[topicId] || null;
    },
    [progress],
  );

  const getTopicStatusById = useCallback(
    (topicId: string): TopicStatus => {
      const topicProgress = getTopicProgress(topicId);
      return getTopicStatus(topicProgress);
    },
    [getTopicProgress],
  );

  const recordQuizAttempt = useCallback(
    (topicId: string, score: { correct: number; total: number }) => {
      setProgress((prev) => {
        if (!prev) return prev;

        const now = Date.now();
        const percentage = Math.round((score.correct / score.total) * 100);

        const existingTopicProgress =
          prev.topics[topicId] || createInitialTopicProgress(topicId);

        const isFirstCompletion = existingTopicProgress.completedAt === null;

        const newAttempt = {
          date: now,
          score: percentage,
          correct: score.correct,
          total: score.total,
        };

        const newTopicProgress: TopicProgress = {
          ...existingTopicProgress,
          quizAttempts: [...existingTopicProgress.quizAttempts, newAttempt],
          bestScore:
            existingTopicProgress.bestScore === null
              ? percentage
              : Math.max(existingTopicProgress.bestScore, percentage),
          completedAt: existingTopicProgress.completedAt ?? now,
          reviewSchedule: isFirstCompletion
            ? createReviewSchedule(now)
            : existingTopicProgress.reviewSchedule,
        };

        return {
          ...prev,
          topics: {
            ...prev.topics,
            [topicId]: newTopicProgress,
          },
          lastUpdated: now,
        };
      });
    },
    [],
  );

  const markReviewCompleted = useCallback(
    (topicId: string, reviewType: "oneDay" | "oneWeek") => {
      setProgress((prev) => {
        if (!prev) return prev;

        const existingTopicProgress = prev.topics[topicId];
        if (!existingTopicProgress?.reviewSchedule) return prev;

        const newReviewSchedule = {
          ...existingTopicProgress.reviewSchedule,
          [reviewType]: {
            ...existingTopicProgress.reviewSchedule[reviewType],
            completed: true,
          },
        };

        return {
          ...prev,
          topics: {
            ...prev.topics,
            [topicId]: {
              ...existingTopicProgress,
              reviewSchedule: newReviewSchedule,
            },
          },
          lastUpdated: Date.now(),
        };
      });
    },
    [],
  );

  const getDueReviews = useCallback((): DueReview[] => {
    if (!progress) return [];

    const dueReviews: DueReview[] = [];

    Object.values(progress.topics).forEach((topicProgress) => {
      const reviewStatus = isReviewDue(topicProgress.reviewSchedule);

      if (reviewStatus.oneDay) {
        dueReviews.push({
          topicId: topicProgress.topicId,
          reviewType: "oneDay",
        });
      } else if (reviewStatus.oneWeek) {
        // Only show week review if day review is already completed
        dueReviews.push({
          topicId: topicProgress.topicId,
          reviewType: "oneWeek",
        });
      }
    });

    return dueReviews;
  }, [progress]);

  return {
    progress,
    isLoaded,
    getTopicProgress,
    getTopicStatusById,
    recordQuizAttempt,
    markReviewCompleted,
    getDueReviews,
  };
}
