'use client';

import { useState, useCallback } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { SpellingQuiz } from './SpellingQuiz';
import { PronunciationQuiz } from './PronunciationQuiz';
import { TranslationQuiz } from './TranslationQuiz';

type QuizPhase = 'spelling' | 'pronunciation' | 'translation';

interface CombinedQuizProps {
  item: VocabularyItem;
  onComplete: (wasCorrect: boolean, userAnswer?: string) => void;
}

export function CombinedQuiz({ item, onComplete }: CombinedQuizProps) {
  const [phase, setPhase] = useState<QuizPhase>('spelling');
  const [spellingCorrect, setSpellingCorrect] = useState(false);
  const [spellingAnswer, setSpellingAnswer] = useState('');
  const [pronunciationCorrect, setPronunciationCorrect] = useState(false);

  const handleSpellingComplete = useCallback((wasCorrect: boolean, userAnswer?: string) => {
    setSpellingCorrect(wasCorrect);
    setSpellingAnswer(userAnswer ?? '');
    // Move to pronunciation phase
    setPhase('pronunciation');
  }, []);

  const handlePronunciationComplete = useCallback((wasCorrect: boolean) => {
    setPronunciationCorrect(wasCorrect);
    // Move to translation phase
    setPhase('translation');
  }, []);

  const handleTranslationComplete = useCallback((wasCorrect: boolean) => {
    // Item is correct if all three phases are correct
    const overallCorrect = spellingCorrect && pronunciationCorrect && wasCorrect;
    onComplete(overallCorrect, spellingAnswer);
  }, [spellingCorrect, pronunciationCorrect, spellingAnswer, onComplete]);

  if (phase === 'spelling') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
            Step 1 of 3: Spelling
          </span>
        </div>
        <SpellingQuiz
          item={item}
          onComplete={handleSpellingComplete}
        />
      </div>
    );
  }

  if (phase === 'pronunciation') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full">
            Step 2 of 3: Pronunciation
          </span>
        </div>
        <PronunciationQuiz
          item={item}
          onComplete={handlePronunciationComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full">
          Step 3 of 3: Translation
        </span>
      </div>
      <TranslationQuiz
        item={item}
        onComplete={handleTranslationComplete}
      />
    </div>
  );
}
