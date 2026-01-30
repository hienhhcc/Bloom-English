// Progress tracking types and utilities

export const STORAGE_KEY = "bloom-english-progress";
export const CURRENT_VERSION = 1;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * ONE_DAY_MS;

export interface QuizAttempt {
  date: number;
  score: number; // percentage 0-100
  correct: number;
  total: number;
}

export interface ReviewSchedule {
  oneDay: { date: number; completed: boolean };
  oneWeek: { date: number; completed: boolean };
}

export interface TopicProgress {
  topicId: string;
  quizAttempts: QuizAttempt[];
  bestScore: number | null;
  completedAt: number | null;
  reviewSchedule: ReviewSchedule | null;
}

export interface LearningProgress {
  version: number;
  topics: Record<string, TopicProgress>;
  lastUpdated: number;
}

export type TopicStatus = "not-started" | "completed" | "review-due";

export function createInitialProgress(): LearningProgress {
  return {
    version: CURRENT_VERSION,
    topics: {},
    lastUpdated: Date.now(),
  };
}

export function createInitialTopicProgress(topicId: string): TopicProgress {
  return {
    topicId,
    quizAttempts: [],
    bestScore: null,
    completedAt: null,
    reviewSchedule: null,
  };
}

export function createReviewSchedule(completedAt: number): ReviewSchedule {
  return {
    oneDay: { date: completedAt + ONE_DAY_MS, completed: false },
    oneWeek: { date: completedAt + ONE_WEEK_MS, completed: false },
  };
}

export function isReviewDue(schedule: ReviewSchedule | null): {
  oneDay: boolean;
  oneWeek: boolean;
  anyDue: boolean;
} {
  if (!schedule) {
    return { oneDay: false, oneWeek: false, anyDue: false };
  }

  const now = Date.now();
  const oneDayDue = !schedule.oneDay.completed && now >= schedule.oneDay.date;
  const oneWeekDue =
    !schedule.oneWeek.completed && now >= schedule.oneWeek.date;

  return {
    oneDay: oneDayDue,
    // oneDay: true,
    oneWeek: oneWeekDue,
    // oneWeek: true,
    anyDue: oneDayDue || oneWeekDue,
  };
}

export function getTopicStatus(progress: TopicProgress | null): TopicStatus {
  if (!progress || progress.quizAttempts.length === 0) {
    return "not-started";
  }

  const reviewStatus = isReviewDue(progress.reviewSchedule);
  if (reviewStatus.anyDue) {
    return "review-due";
  }

  return "completed";
}

export function getNextReviewType(
  schedule: ReviewSchedule | null,
): "oneDay" | "oneWeek" | null {
  if (!schedule) return null;

  const reviewStatus = isReviewDue(schedule);

  // Return the earliest due review
  if (reviewStatus.oneDay) return "oneDay";
  if (reviewStatus.oneWeek) return "oneWeek";

  return null;
}

export function formatReviewDate(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;

  if (diff < 0) {
    return "overdue";
  }

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / ONE_DAY_MS);

  if (hours < 24) {
    return hours <= 1 ? "in 1 hour" : `in ${hours} hours`;
  }

  if (days === 1) {
    return "tomorrow";
  }

  return `in ${days} days`;
}
