'use client';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { playErrorSound, playSuccessSound } from '@/lib/audio';
import { evaluatePronunciation, getPronunciationFeedback, type PronunciationResult } from '@/lib/pronunciationEvaluator';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { ArrowRight, Check, Mic, RotateCcw, Snail, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MicrophonePermission } from './MicrophonePermission';
import { RecordingButton } from './RecordingButton';

type QuizState = 'ready' | 'recording' | 'processing' | 'result';
type PronunciationPhase = 'word' | 'sentence';

interface PronunciationQuizProps {
  item: VocabularyItem;
  onComplete: (wasCorrect: boolean) => void;
}

export function PronunciationQuiz({ item, onComplete }: PronunciationQuizProps) {
  const [phase, setPhase] = useState<PronunciationPhase>('word');
  const [hasResult, setHasResult] = useState(false);
  const [wordResult, setWordResult] = useState<PronunciationResult | null>(null);
  const [sentenceResult, setSentenceResult] = useState<PronunciationResult | null>(null);
  const [showPermissionUI, setShowPermissionUI] = useState(false);
  const [evaluatedText, setEvaluatedText] = useState<string>('');

  // Track previous isProcessing state to detect when transcription completes
  const prevIsProcessingRef = useRef(false);

  const {
    isListening,
    isProcessing,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking } = useTextToSpeech();

  // Use first example sentence for pronunciation practice
  const exampleSentence = item.examples[0];

  // Compute quiz state from recording/processing status and result
  const quizState: QuizState = hasResult
    ? 'result'
    : isListening
      ? 'recording'
      : isProcessing
        ? 'processing'
        : 'ready';

  // Get the expected text based on current phase
  const getExpectedText = useCallback(() => {
    return phase === 'word' ? item.word : exampleSentence.english;
  }, [phase, item.word, exampleSentence.english]);

  // Process recording result when transcription completes
  const processRecordingResult = useCallback((currentTranscript: string) => {
    const expected = getExpectedText();

    if (currentTranscript) {
      // Store the text that was actually evaluated
      setEvaluatedText(currentTranscript);

      const result = evaluatePronunciation(currentTranscript, expected);

      if (phase === 'word') {
        setWordResult(result);
      } else {
        setSentenceResult(result);
      }

      if (result.isPassing) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    } else {
      // No speech detected - create a failing result
      const expectedWords = expected.toLowerCase().split(' ').filter(w => w.length > 0);
      const noSpeechResult: PronunciationResult = {
        isExactMatch: false,
        wordMatchScore: 0,
        phoneticScore: 0,
        editDistanceScore: 0,
        overallScore: 0,
        isPassing: false,
        recognizedWords: [],
        expectedWords: expectedWords,
        matchedWords: 0,
      };

      setEvaluatedText('');

      if (phase === 'word') {
        setWordResult(noSpeechResult);
      } else {
        setSentenceResult(noSpeechResult);
      }

      playErrorSound();
    }

    setHasResult(true);
  }, [phase, getExpectedText]);

  // Handle permission errors
  const handlePermissionError = useCallback(() => {
    setShowPermissionUI(true);
    setHasResult(false);
  }, []);

  // Handle transcription completion - when isProcessing goes from true to false
  useEffect(() => {
    if (prevIsProcessingRef.current && !isProcessing && !hasResult) {
      // Transcription just completed
      queueMicrotask(() => processRecordingResult(transcript));
    }
    prevIsProcessingRef.current = isProcessing;
  }, [isProcessing, transcript, hasResult, processRecordingResult]);

  // Handle errors
  useEffect(() => {
    if (error === 'not-allowed' || error === 'audio-capture') {
      queueMicrotask(() => handlePermissionError());
    } else if (error === 'transcription-failed' || error === 'no-speech' || error === 'non-english-detected') {
      // Handle transcription errors - including non-English detection
      queueMicrotask(() => processRecordingResult(''));
    }
  }, [error, handlePermissionError, processRecordingResult]);

  const handleStartRecording = useCallback(() => {
    resetTranscript();
    // Don't set quizState here - let the effect handle it when isListening becomes true
    startListening({
      maxDuration: 30000, // 30 seconds max
    });
  }, [resetTranscript, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handleRetryRecording = useCallback(() => {
    resetTranscript();
    setEvaluatedText('');
    if (phase === 'word') {
      setWordResult(null);
    } else {
      setSentenceResult(null);
    }
    setHasResult(false);
  }, [resetTranscript, phase]);

  const handleContinue = useCallback(() => {
    if (phase === 'word') {
      // Move to sentence phase
      resetTranscript();
      setEvaluatedText('');
      setPhase('sentence');
      setHasResult(false);
    } else {
      // Both phases complete - determine overall result
      const wordPassed = wordResult?.isPassing ?? false;
      const sentencePassed = sentenceResult?.isPassing ?? false;
      const overallPassed = wordPassed && sentencePassed;
      onComplete(overallPassed);
    }
  }, [phase, wordResult, sentenceResult, onComplete, resetTranscript]);

  const handleSkip = useCallback(() => {
    // Skip counts as not passing
    onComplete(false);
  }, [onComplete]);

  const handleRetryPermission = useCallback(() => {
    setShowPermissionUI(false);
    handleStartRecording();
  }, [handleStartRecording]);

  const handleListen = useCallback((slow: boolean = false) => {
    const text = getExpectedText();
    speak(text, slow);
  }, [speak, getExpectedText]);

  // isSupported is always true now (MediaRecorder is widely supported)
  // But keep the check for edge cases
  if (!isSupported) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Audio recording is not supported in your browser.
            </p>
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              Skip Pronunciation Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show permission UI
  if (showPermissionUI) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <MicrophonePermission
            error={error === 'not-allowed' || error === 'audio-capture' ? error : null}
            onRetry={handleRetryPermission}
            onSkip={handleSkip}
          />
        </div>
      </div>
    );
  }

  const currentResult = phase === 'word' ? wordResult : sentenceResult;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pronunciation Quiz
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {phase === 'word' ? 'Pronounce the vocabulary word' : 'Pronounce the sentence'}
            </p>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${phase === 'word' ? 'bg-emerald-500' : 'bg-emerald-500'
            }`} />
          <div className={`flex-1 h-1 rounded-full ${phase === 'sentence' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
        </div>

        {/* Text to pronounce */}
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
            {phase === 'word' ? 'Pronounce this word:' : 'Pronounce this sentence:'}
          </p>
          <p className="text-xl font-medium text-emerald-900 dark:text-emerald-100 mb-3">
            {phase === 'word' ? item.word : `"${exampleSentence.english}"`}
          </p>

          {/* Listen buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleListen(false)}
              disabled={isSpeaking}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4" />
              Listen
            </button>
            <button
              onClick={() => handleListen(true)}
              disabled={isSpeaking}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 dark:bg-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <Snail className="w-4 h-4" />
              Slow
            </button>
          </div>
        </div>

        {/* Ready state - show record button */}
        {quizState === 'ready' && (
          <div className="flex flex-col items-center py-6">
            <RecordingButton
              isRecording={false}
              isDisabled={false}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              size="lg"
            />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Tap to start recording
            </p>
          </div>
        )}

        {/* Recording state */}
        {quizState === 'recording' && (
          <div className="flex flex-col items-center py-6">
            {/* Recording indicator ring */}
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-red-400/30 animate-ping pointer-events-none" />
              <div className="absolute inset-0 -m-1 rounded-full bg-red-400/50 animate-pulse pointer-events-none" />
              <RecordingButton
                isRecording={true}
                isDisabled={false}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                size="lg"
              />
            </div>
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 font-medium">
              Recording... Tap to stop
            </p>
          </div>
        )}

        {/* Processing state */}
        {quizState === 'processing' && (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 font-medium">
              Processing your pronunciation...
            </p>
          </div>
        )}

        {/* Result state */}
        {quizState === 'result' && currentResult && (
          <div className="space-y-4">
            {/* What was recognized */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You said:</p>
              <p className="text-gray-900 dark:text-white">{evaluatedText || '(No speech detected)'}</p>
            </div>

            {/* Result indicator */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${currentResult.isPassing
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
              }`}>
              {currentResult.isPassing ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <span className={currentResult.isPassing
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
                }>
                  {getPronunciationFeedback(currentResult)}
                </span>
              </div>
              <span className={`text-lg font-bold ${currentResult.isPassing
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                {currentResult.overallScore}%
              </span>
            </div>

            {/* Retry and continue buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRetryRecording}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
