"use client";

import {
  STORAGE_KEY,
  createInitialProgress,
  createInitialTopicProgress,
  createReviewSchedule,
  getTopicStatus,
  isReviewDue,
  type ActiveQuizPosition,
  type ActiveReviewPosition,
  type LearningProgress,
  type MistakeRecord,
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
  saveReviewPosition: (topicId: string, position: ActiveReviewPosition) => void;
  getReviewPosition: (
    topicId: string,
    reviewType: "oneDay" | "oneWeek",
  ) => ActiveReviewPosition | null;
  clearReviewPosition: (topicId: string) => void;
  saveQuizPosition: (topicId: string, position: ActiveQuizPosition) => void;
  getQuizPosition: (topicId: string) => ActiveQuizPosition | null;
  clearQuizPosition: (topicId: string) => void;
  recordMistakes: (topicId: string, wrongItemIds: string[]) => void;
  clearMistake: (topicId: string, itemId: string) => void;
  getAllMistakes: () => Array<{ topicId: string; mistakes: MistakeRecord[] }>;
  // Dismiss alert functions
  dismissReviewAlert: (topicId: string, reviewType: "oneDay" | "oneWeek") => void;
  isReviewAlertDismissed: (topicId: string, reviewType: "oneDay" | "oneWeek") => boolean;
  dismissMistakesAlert: (count: number) => void;
  isMistakesAlertDismissed: (count: number) => boolean;
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

  const saveReviewPosition = useCallback(
    (topicId: string, position: ActiveReviewPosition) => {
      setProgress((prev) => {
        if (!prev) return prev;

        const existingTopicProgress =
          prev.topics[topicId] || createInitialTopicProgress(topicId);

        return {
          ...prev,
          topics: {
            ...prev.topics,
            [topicId]: {
              ...existingTopicProgress,
              activeReview: position,
            },
          },
          lastUpdated: Date.now(),
        };
      });
    },
    [],
  );

  const getReviewPosition = useCallback(
    (
      topicId: string,
      reviewType: "oneDay" | "oneWeek",
    ): ActiveReviewPosition | null => {
      if (!progress) return null;

      const topicProgress = progress.topics[topicId];
      if (!topicProgress?.activeReview) return null;

      // Only return position if reviewType matches
      if (topicProgress.activeReview.reviewType !== reviewType) {
        return null;
      }

      return topicProgress.activeReview;
    },
    [progress],
  );

  const clearReviewPosition = useCallback((topicId: string) => {
    setProgress((prev) => {
      if (!prev) return prev;

      const existingTopicProgress = prev.topics[topicId];
      if (!existingTopicProgress) return prev;

      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: {
            ...existingTopicProgress,
            activeReview: null,
          },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const saveQuizPosition = useCallback(
    (topicId: string, position: ActiveQuizPosition) => {
      setProgress((prev) => {
        if (!prev) return prev;

        const existingTopicProgress =
          prev.topics[topicId] || createInitialTopicProgress(topicId);

        return {
          ...prev,
          topics: {
            ...prev.topics,
            [topicId]: {
              ...existingTopicProgress,
              activeQuiz: position,
            },
          },
          lastUpdated: Date.now(),
        };
      });
    },
    [],
  );

  const getQuizPosition = useCallback(
    (topicId: string): ActiveQuizPosition | null => {
      if (!progress) return null;

      const topicProgress = progress.topics[topicId];
      if (!topicProgress?.activeQuiz) return null;

      return topicProgress.activeQuiz;
    },
    [progress],
  );

  const clearQuizPosition = useCallback((topicId: string) => {
    setProgress((prev) => {
      if (!prev) return prev;

      const existingTopicProgress = prev.topics[topicId];
      if (!existingTopicProgress) return prev;

      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: {
            ...existingTopicProgress,
            activeQuiz: null,
          },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const recordMistakes = useCallback(
    (topicId: string, wrongItemIds: string[]) => {
      if (wrongItemIds.length === 0) return;

      setProgress((prev) => {
        if (!prev) return prev;

        const existingTopicProgress =
          prev.topics[topicId] || createInitialTopicProgress(topicId);
        const now = Date.now();

        // Update or add mistake records
        const updatedMistakes = [...(existingTopicProgress.mistakes || [])];
        for (const itemId of wrongItemIds) {
          const existingIndex = updatedMistakes.findIndex(
            (m) => m.itemId === itemId
          );
          if (existingIndex !== -1) {
            updatedMistakes[existingIndex] = {
              ...updatedMistakes[existingIndex],
              timesWrong: updatedMistakes[existingIndex].timesWrong + 1,
              lastWrongDate: now,
            };
          } else {
            updatedMistakes.push({
              itemId,
              lastWrongDate: now,
              timesWrong: 1,
            });
          }
        }

        return {
          ...prev,
          topics: {
            ...prev.topics,
            [topicId]: {
              ...existingTopicProgress,
              mistakes: updatedMistakes,
            },
          },
          lastUpdated: now,
        };
      });
    },
    []
  );

  const clearMistake = useCallback((topicId: string, itemId: string) => {
    setProgress((prev) => {
      if (!prev) return prev;

      const existingTopicProgress = prev.topics[topicId];
      if (!existingTopicProgress) return prev;

      const updatedMistakes = (existingTopicProgress.mistakes || []).filter(
        (m) => m.itemId !== itemId
      );

      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: {
            ...existingTopicProgress,
            mistakes: updatedMistakes,
          },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const getAllMistakes = useCallback((): Array<{
    topicId: string;
    mistakes: MistakeRecord[];
  }> => {
    if (!progress) return [];

    return Object.values(progress.topics)
      .filter((topic) => topic.mistakes && topic.mistakes.length > 0)
      .map((topic) => ({
        topicId: topic.topicId,
        mistakes: topic.mistakes,
      }));
  }, [progress]);

  const dismissReviewAlert = useCallback(
    (topicId: string, reviewType: "oneDay" | "oneWeek") => {
      setProgress((prev) => {
        if (!prev) return prev;

        const key = `${topicId}-${reviewType}`;
        const existing = prev.dismissedReviewAlerts || [];

        if (existing.includes(key)) return prev;

        return {
          ...prev,
          dismissedReviewAlerts: [...existing, key],
          lastUpdated: Date.now(),
        };
      });
    },
    []
  );

  const isReviewAlertDismissed = useCallback(
    (topicId: string, reviewType: "oneDay" | "oneWeek"): boolean => {
      if (!progress) return false;

      const key = `${topicId}-${reviewType}`;
      return progress.dismissedReviewAlerts?.includes(key) ?? false;
    },
    [progress]
  );

  const dismissMistakesAlert = useCallback((count: number) => {
    setProgress((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        dismissedMistakesAlertCount: count,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const isMistakesAlertDismissed = useCallback(
    (count: number): boolean => {
      if (!progress) return false;

      // Alert is dismissed only if the count matches what was dismissed
      // This way, if the count changes (more/fewer mistakes), the alert shows again
      return progress.dismissedMistakesAlertCount === count;
    },
    [progress]
  );

  return {
    progress,
    isLoaded,
    getTopicProgress,
    getTopicStatusById,
    recordQuizAttempt,
    markReviewCompleted,
    getDueReviews,
    saveReviewPosition,
    getReviewPosition,
    clearReviewPosition,
    saveQuizPosition,
    getQuizPosition,
    clearQuizPosition,
    recordMistakes,
    clearMistake,
    getAllMistakes,
    dismissReviewAlert,
    isReviewAlertDismissed,
    dismissMistakesAlert,
    isMistakesAlertDismissed,
  };
}
