'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { LetterSlots } from './LetterSlots';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

interface SpellingQuizProps {
  item: VocabularyItem;
  onComplete: (wasCorrect: boolean, userAnswer?: string) => void;
}

type QuizState = 'input' | 'result';

const AUTO_ADVANCE_DELAY = 5000;

function calculateMaxHints(wordLength: number): number {
  // Allow roughly 1 hint per 3 letters, minimum 1, maximum 3
  return Math.min(Math.max(Math.floor(wordLength / 3), 1), 3);
}

export function SpellingQuiz({ item, onComplete }: SpellingQuizProps) {
  const [userInput, setUserInput] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('input');
  const [isCorrect, setIsCorrect] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_DELAY / 1000);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const maxHints = useMemo(() => calculateMaxHints(item.word.length), [item.word.length]);
  const hintsRemaining = maxHints - hintsUsed;

  const handleContinue = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    onComplete(isCorrect, userInput);
  }, [onComplete, isCorrect, userInput]);

  const checkAnswer = useCallback(() => {
    const correct = userInput.toLowerCase().trim() === item.word.toLowerCase();
    setIsCorrect(correct);
    setQuizState('result');

    if (correct) {
      playSuccessSound();
      setCountdown(AUTO_ADVANCE_DELAY / 1000);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        onComplete(true, userInput);
      }, AUTO_ADVANCE_DELAY);
    } else {
      playErrorSound();
    }
  }, [userInput, item.word, onComplete]);

  const useHint = useCallback(() => {
    if (hintsUsed >= maxHints) return;

    const newHintLevel = hintsUsed + 1;
    setHintsUsed(newHintLevel);

    // Reveal the first newHintLevel letters, keeping user's input after that
    const correctPrefix = item.word.slice(0, newHintLevel).toLowerCase();
    const userSuffix = userInput.slice(newHintLevel);
    setUserInput(correctPrefix + userSuffix);
  }, [hintsUsed, maxHints, item.word, userInput]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (quizState === 'input' && userInput.length > 0) {
          checkAnswer();
        } else if (quizState === 'result') {
          handleContinue();
        }
      }
    },
    [quizState, userInput.length, checkAnswer, handleContinue]
  );

  return (
    <div
      className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
      onKeyDown={handleKeyDown}
    >
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Spell the word for:
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {item.definitionVietnamese}
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-1 italic">
          {item.definitionEnglish}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ({item.partOfSpeech})
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
        <LetterSlots
          word={item.word}
          value={userInput}
          onChange={setUserInput}
          disabled={quizState === 'result'}
          showResult={quizState === 'result' ? (isCorrect ? 'correct' : 'incorrect') : null}
          lockedChars={hintsUsed}
        />
      </div>

      {quizState === 'result' && (
        <div
          className={`flex flex-col items-center gap-2 mb-6 p-3 rounded-lg ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <Check className="w-5 h-5" />
                <span className="font-medium">Correct!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span className="font-medium">
                  The correct word is: <strong>{item.word}</strong>
                </span>
              </>
            )}
          </div>
          {isCorrect && (
            <span className="text-sm opacity-75">
              Moving to next word in {countdown}s...
            </span>
          )}
        </div>
      )}

      {quizState === 'input' ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={useHint}
            disabled={hintsRemaining === 0}
            className="w-full py-2.5 px-4 border border-amber-400 dark:border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:border-gray-300 disabled:dark:border-gray-600 disabled:text-gray-400 disabled:dark:text-gray-500 disabled:hover:bg-transparent font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {hintsRemaining > 0
              ? `Get Hint (${hintsRemaining} left)`
              : 'No hints left'}
          </button>
          <button
            onClick={checkAnswer}
            disabled={userInput.length === 0}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            Check
          </button>
        </div>
      ) : (
        <button
          onClick={handleContinue}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
