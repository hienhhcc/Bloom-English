'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, RotateCcw, Camera, Type } from 'lucide-react';
import type { CheckResult, ExerciseResult, ExerciseStatus } from '@/lib/exerciseChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadZone } from './ImageUploadZone';

type PageState = 'idle' | 'checking' | 'results' | 'error';
type InputMode = 'image' | 'text';

const statusConfig: Record<ExerciseStatus, {
  label: string;
  icon: typeof CheckCircle;
  badgeClass: string;
}> = {
  correct: {
    label: 'Correct',
    icon: CheckCircle,
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  incorrect: {
    label: 'Incorrect',
    icon: XCircle,
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  book_error: {
    label: 'Book Error',
    icon: AlertTriangle,
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

function ExerciseResultCard({ exercise }: { exercise: ExerciseResult }) {
  const config = statusConfig[exercise.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">#{exercise.number}</span>
            <Badge variant="outline" className="text-xs">
              {exercise.type}
            </Badge>
          </div>
          <Badge className={`${config.badgeClass} border-0 gap-1`}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Your answer: </span>
            <span className="text-foreground">{exercise.userAnswer || '(empty)'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Book answer: </span>
            <span className="text-foreground">{exercise.bookAnswer || '(empty)'}</span>
          </div>
          {exercise.correctedAnswer && (
            <div>
              <span className="text-muted-foreground">Correct answer: </span>
              <span className="font-medium text-foreground">{exercise.correctedAnswer}</span>
            </div>
          )}
          <p className="text-muted-foreground italic">{exercise.explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBar({ summary }: { summary: CheckResult['summary'] }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="font-medium text-foreground">{summary.total} exercises</span>
          <span className="text-muted-foreground">|</span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="size-4" />
            {summary.correct} correct
          </span>
          {summary.incorrect > 0 && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="size-4" />
                {summary.incorrect} incorrect
              </span>
            </>
          )}
          {summary.bookErrors > 0 && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
                {summary.bookErrors} book {summary.bookErrors === 1 ? 'error' : 'errors'}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExerciseCheckerContent() {
  const [inputMode, setInputMode] = useState<InputMode>('image');
  // Image mode state
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [answersImage, setAnswersImage] = useState<string | null>(null);
  const [answerKeyImage, setAnswerKeyImage] = useState<string | null>(null);
  // Text mode state
  const [questionsText, setQuestionsText] = useState('');
  const [answersText, setAnswersText] = useState('');
  const [answerKeyText, setAnswerKeyText] = useState('');
  // Shared state
  const [state, setState] = useState<PageState>('idle');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string>('');

  const canCheck = inputMode === 'image'
    ? answersImage && answerKeyImage && state !== 'checking'
    : answersText.trim() && answerKeyText.trim() && state !== 'checking';

  function handleModeChange(mode: string) {
    setInputMode(mode as InputMode);
    // Clear state from the other mode
    setQuestionImage(null);
    setAnswersImage(null);
    setAnswerKeyImage(null);
    setQuestionsText('');
    setAnswersText('');
    setAnswerKeyText('');
    setError('');
  }

  async function handleCheck() {
    setState('checking');
    setError('');

    try {
      const body = inputMode === 'image'
        ? {
            mode: 'image',
            answersImage,
            answerKeyImage,
            questionImage,
          }
        : {
            mode: 'text',
            answersText: answersText.trim(),
            answerKeyText: answerKeyText.trim(),
            questionsText: questionsText.trim() || undefined,
          };

      const response = await fetch('/api/check-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check exercises');
      }

      setResult(data);
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  }

  function handleReset() {
    setQuestionImage(null);
    setAnswersImage(null);
    setAnswerKeyImage(null);
    setQuestionsText('');
    setAnswersText('');
    setAnswerKeyText('');
    setResult(null);
    setError('');
    setState('idle');
  }

  return (
    <div className="space-y-6">
      {/* Upload / Input Section */}
      {state !== 'results' && (
        <>
          <Tabs value={inputMode} onValueChange={handleModeChange}>
            <TabsList className="w-full">
              <TabsTrigger value="image" className="flex-1 gap-1.5">
                <Camera className="size-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1 gap-1.5">
                <Type className="size-4" />
                Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-4">
              <ImageUploadZone
                label="Questions (Optional)"
                description="Upload the original exercise questions for better accuracy"
                image={questionImage}
                onImageChange={setQuestionImage}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadZone
                  label="Your Answers"
                  description="Upload your completed exercise page"
                  image={answersImage}
                  onImageChange={setAnswersImage}
                />
                <ImageUploadZone
                  label="Answer Key"
                  description="Upload the textbook's answer key"
                  image={answerKeyImage}
                  onImageChange={setAnswerKeyImage}
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Questions (Optional)
                </label>
                <Textarea
                  placeholder="Type or paste the original questions here for better accuracy..."
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Your Answers
                  </label>
                  <Textarea
                    placeholder="Type or paste your answers here..."
                    value={answersText}
                    onChange={(e) => setAnswersText(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Answer Key
                  </label>
                  <Textarea
                    placeholder="Type or paste the answer key here..."
                    value={answerKeyText}
                    onChange={(e) => setAnswerKeyText(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!canCheck}
            onClick={handleCheck}
          >
            {state === 'checking' ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Checking your answers...
              </>
            ) : (
              'Check My Answers'
            )}
          </Button>
        </>
      )}

      {/* Results Section */}
      {state === 'results' && result && (
        <>
          <SummaryBar summary={result.summary} />

          <div className="space-y-3">
            {result.exercises.map((exercise, i) => (
              <ExerciseResultCard key={`${exercise.number}-${i}`} exercise={exercise} />
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={handleReset}>
            <RotateCcw className="size-4 mr-2" />
            Check Another Exercise
          </Button>
        </>
      )}
    </div>
  );
}
