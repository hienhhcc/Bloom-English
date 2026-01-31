'use client';

import { containsVocabularyWord } from '@/lib/languageTool';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { AlertCircle, ArrowRight, Check, Languages, Lightbulb, Loader2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

type QuizState = 'input' | 'checking' | 'result';

interface GrammarError {
  message: string;
  context: string;
  suggestion: string;
}

interface TranslationCheckResult {
  grammarCorrect: boolean;
  grammarErrors: GrammarError[];
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
  referenceTranslation: string;
}

interface TranslationQuizProps {
  item: VocabularyItem;
  onComplete: (wasCorrect: boolean) => void;
}

export function TranslationQuiz({ item, onComplete }: TranslationQuizProps) {
  const [userInput, setUserInput] = useState('');
  const [quizState, setQuizState] = useState<QuizState>('input');
  const [containsWord, setContainsWord] = useState(false);
  const [checkResult, setCheckResult] = useState<TranslationCheckResult | null>(null);
  const [apiError, setApiError] = useState(false);

  // Use the third example sentence for translation (dedicated for the translation quiz, not shown on flashcard)
  const exampleSentence = item.examples[2];

  const handleCheck = useCallback(async () => {
    if (!userInput.trim()) return;

    setQuizState('checking');
    setApiError(false);

    // Check if translation contains the vocabulary word
    const hasWord = containsVocabularyWord(userInput, item.word, item.wordFamily);
    setContainsWord(hasWord);

    // Comprehensive check with Ollama (grammar + semantic + reference translation)
    try {
      const response = await fetch('/api/check-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vietnamese: exampleSentence.vietnamese,
          userTranslation: userInput,
          vocabularyWord: item.word,
        }),
      });

      if (response.ok) {
        const result: TranslationCheckResult = await response.json();
        console.log(result);
        setCheckResult(result);
      } else {
        setApiError(true);
        setCheckResult({
          grammarCorrect: true,
          grammarErrors: [],
          isCorrect: true,
          score: -1,
          feedback: 'Translation check unavailable',
          suggestions: [],
          referenceTranslation: exampleSentence.english,
        });
      }
    } catch {
      setApiError(true);
      setCheckResult({
        grammarCorrect: true,
        grammarErrors: [],
        isCorrect: true,
        score: -1,
        feedback: 'Translation check unavailable',
        suggestions: [],
        referenceTranslation: exampleSentence.english,
      });
    }

    setQuizState('result');
  }, [userInput, item.word, item.wordFamily, exampleSentence]);

  const handleContinue = useCallback(() => {
    // Determine overall correctness based on all checks
    const grammarOk = checkResult?.grammarCorrect ?? true;
    const score = checkResult?.score ?? -1;
    const semanticOk = score === -1 || score >= 80;
    const isFullyCorrect = containsWord && grammarOk && semanticOk;
    onComplete(isFullyCorrect);
  }, [containsWord, checkResult, onComplete]);

  // Calculate overall status
  const grammarOk = checkResult?.grammarCorrect ?? true;
  const score = checkResult?.score ?? -1;
  const checkAvailable = score !== -1;
  const semanticOk = !checkAvailable || score >= 80;
  const isFullyCorrect = containsWord && grammarOk && semanticOk;
  const isPartiallyCorrect = containsWord && grammarOk && checkAvailable && score >= 50 && score < 80;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Languages className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Translation Quiz
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Translate the Vietnamese sentence to English
            </p>
          </div>
        </div>

        {/* Vietnamese sentence to translate */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">
            Translate this sentence:
          </p>
          <p className="text-lg font-medium text-amber-900 dark:text-amber-100">
            &ldquo;{exampleSentence.vietnamese}&rdquo;
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Include the word: <span className="font-bold">{item.word}</span>
          </p>
        </div>

        {quizState === 'input' && (
          <>
            {/* Text input */}
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your English translation here..."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              autoFocus
            />

            {/* Check button */}
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className="w-full mt-4 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white disabled:text-gray-500 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Check Translation
            </button>
          </>
        )}

        {quizState === 'checking' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your translation...
            </p>
          </div>
        )}

        {quizState === 'result' && (
          <div className="space-y-4">
            {/* User's translation */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your translation:</p>
              <p className="text-gray-900 dark:text-white">{userInput}</p>
            </div>

            {/* Vocabulary word check */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${containsWord
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              {containsWord ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={containsWord
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
              }>
                {containsWord
                  ? `Contains vocabulary word "${item.word}"`
                  : `Missing vocabulary word "${item.word}"`}
              </span>
            </div>

            {/* Grammar check */}
            {apiError && score === -1 ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-300">
                  Translation check unavailable (Ollama not running)
                </span>
              </div>
            ) : checkResult?.grammarCorrect ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">
                  Grammar is correct
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-300 font-medium">
                    Grammar issues found:
                  </span>
                </div>
                <ul className="space-y-2 ml-8">
                  {checkResult?.grammarErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">
                      <p>{error.message}</p>
                      {error.suggestion && (
                        <p className="text-red-600 dark:text-red-400 mt-1">
                          Suggestion: {error.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Translation quality check */}
            {checkResult && score !== -1 && (
              <div className={`p-4 rounded-xl ${getScoreBg(score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {score >= 80 ? (
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : score >= 50 ? (
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium ${getScoreColor(score)}`}>
                      Translation quality
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </span>
                </div>

                {/* Feedback */}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {checkResult.feedback}
                </p>

                {/* Suggestions */}
                {checkResult.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Suggestions for improvement:
                      </span>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {checkResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 list-disc">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Reference translation (from Ollama) */}
            {checkResult && checkResult.referenceTranslation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Reference translation:
                </p>
                <p className="text-blue-900 dark:text-blue-100">
                  &ldquo;{checkResult.referenceTranslation}&rdquo;
                </p>
              </div>
            )}

            {/* Result summary and continue */}
            <div className={`p-4 rounded-xl ${isFullyCorrect
              ? 'bg-green-100 dark:bg-green-900/30'
              : isPartiallyCorrect
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
              }`}>
              <p className={`font-medium ${isFullyCorrect
                ? 'text-green-800 dark:text-green-300'
                : isPartiallyCorrect
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-red-800 dark:text-red-300'
                }`}>
                {isFullyCorrect
                  ? 'Excellent! Your translation is accurate.'
                  : isPartiallyCorrect
                    ? 'Good effort! Your translation is close but could be improved.'
                    : 'Keep practicing! Review the feedback above.'}
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
