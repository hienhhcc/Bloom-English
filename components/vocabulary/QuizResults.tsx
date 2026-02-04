'use client';

import type { QuizResult } from '@/hooks/useTopicQuiz';
import { Trophy, RotateCcw, ArrowLeft, ChevronDown, ChevronUp, CalendarCheck } from 'lucide-react';
import { useState } from 'react';

interface QuizResultsProps {
  score: { correct: number; total: number };
  results: QuizResult[];
  onRetry: () => void;
  onExit: () => void;
  isFirstCompletion?: boolean;
  isReview?: boolean;
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600 dark:text-green-400';
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30';
  if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

function getMessage(percentage: number): string {
  if (percentage === 100) return 'Perfect score! 🎉';
  if (percentage >= 80) return 'Great job! Keep it up! 🌟';
  if (percentage >= 60) return 'Good effort! Practice makes perfect.';
  return 'Keep practicing, you\'ll get better!';
}

export function QuizResults({
  score,
  results,
  onRetry,
  onExit,
  isFirstCompletion = false,
  isReview = false,
}: QuizResultsProps) {
  const [showIncorrect, setShowIncorrect] = useState(true);
  const percentage = Math.round((score.correct / score.total) * 100);
  const incorrectResults = results.filter((r) => !r.isCorrect);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg text-center">
        <div className={`inline-flex p-4 rounded-full ${getScoreBgColor(percentage)} mb-4`}>
          <Trophy className={`w-12 h-12 ${getScoreColor(percentage)}`} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isReview ? 'Review Complete!' : 'Quiz Complete!'}
        </h2>

        <div className={`text-5xl font-bold ${getScoreColor(percentage)} mb-2`}>
          {score.correct}/{score.total}
        </div>

        <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {percentage}% correct
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {getMessage(percentage)}
        </p>

        {isFirstCompletion && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <CalendarCheck className="w-5 h-5" />
              <span className="font-medium">Review Scheduled</span>
            </div>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 text-left">
              <li>• Review in 1 day to strengthen memory</li>
              <li>• Final review in 1 week for long-term retention</li>
            </ul>
          </div>
        )}

        {incorrectResults.length > 0 && (
          <div className="mb-6 text-left">
            <button
              onClick={() => setShowIncorrect(!showIncorrect)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Words to review ({incorrectResults.length})
              </span>
              {showIncorrect ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showIncorrect && (
              <div className="mt-2 space-y-2">
                {incorrectResults.map((result) => (
                  <div
                    key={result.item.id}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {result.item.definitionVietnamese}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      → {result.item.word}
                    </div>
                    {result.userAnswer && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Your answer: {result.userAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retry Quiz
          </button>
          <button
            onClick={onExit}
            className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}
