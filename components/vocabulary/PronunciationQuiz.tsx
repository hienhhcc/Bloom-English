'use client';

import { useState, useCallback, useEffect } from 'react';
import type { VocabularyItem } from '@/lib/vocabulary/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { evaluatePronunciation, getPronunciationFeedback, type PronunciationResult } from '@/lib/pronunciationEvaluator';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { RecordingButton } from './RecordingButton';
import { MicrophonePermission } from './MicrophonePermission';
import { PronunciationUnsupported } from './PronunciationUnsupported';
import { Check, X, Volume2, Snail, ArrowRight, Mic, RotateCcw } from 'lucide-react';

type QuizState = 'ready' | 'recording' | 'result';
type PronunciationPhase = 'word' | 'sentence';

interface PronunciationQuizProps {
  item: VocabularyItem;
  onComplete: (wasCorrect: boolean) => void;
}

export function PronunciationQuiz({ item, onComplete }: PronunciationQuizProps) {
  const [phase, setPhase] = useState<PronunciationPhase>('word');
  const [quizState, setQuizState] = useState<QuizState>('ready');
  const [wordResult, setWordResult] = useState<PronunciationResult | null>(null);
  const [sentenceResult, setSentenceResult] = useState<PronunciationResult | null>(null);
  const [showPermissionUI, setShowPermissionUI] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { speak, isSpeaking } = useTextToSpeech();

  // Use first example sentence for pronunciation practice
  const exampleSentence = item.examples[0];

  // Get the expected text based on current phase
  const getExpectedText = useCallback(() => {
    return phase === 'word' ? item.word : exampleSentence.english;
  }, [phase, item.word, exampleSentence.english]);

  // Handle recording stop and evaluate
  useEffect(() => {
    if (quizState === 'recording' && !isListening && transcript) {
      // Recording stopped with transcript
      const expected = getExpectedText();
      const result = evaluatePronunciation(transcript, expected);

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

      setQuizState('result');
    }
  }, [isListening, transcript, quizState, phase, getExpectedText]);

  // Handle errors
  useEffect(() => {
    if (error === 'not-allowed' || error === 'audio-capture') {
      setShowPermissionUI(true);
      setQuizState('ready');
    }
  }, [error]);

  const handleStartRecording = useCallback(() => {
    resetTranscript();
    setQuizState('recording');
    startListening({
      continuous: false,
      interimResults: true,
      maxDuration: 10000, // 10 seconds max
    });
  }, [resetTranscript, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handleRetryRecording = useCallback(() => {
    resetTranscript();
    if (phase === 'word') {
      setWordResult(null);
    } else {
      setSentenceResult(null);
    }
    setQuizState('ready');
  }, [resetTranscript, phase]);

  const handleContinue = useCallback(() => {
    if (phase === 'word') {
      // Move to sentence phase
      resetTranscript();
      setPhase('sentence');
      setQuizState('ready');
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

  const handleSelfAssess = useCallback((passed: boolean) => {
    onComplete(passed);
  }, [onComplete]);

  const handleRetryPermission = useCallback(() => {
    setShowPermissionUI(false);
    handleStartRecording();
  }, [handleStartRecording]);

  const handleListen = useCallback((slow: boolean = false) => {
    const text = getExpectedText();
    speak(text, slow);
  }, [speak, getExpectedText]);

  // Show unsupported browser message
  if (!isSupported) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <PronunciationUnsupported
            onSkip={handleSkip}
            onSelfAssess={handleSelfAssess}
          />
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
          <div className={`flex-1 h-1 rounded-full ${
            phase === 'word' ? 'bg-emerald-500' : 'bg-emerald-500'
          }`} />
          <div className={`flex-1 h-1 rounded-full ${
            phase === 'sentence' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
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
            <RecordingButton
              isRecording={true}
              isDisabled={false}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              size="lg"
            />
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 animate-pulse">
              Recording... Tap to stop
            </p>

            {/* Live transcript */}
            {(transcript || interimTranscript) && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg w-full">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You said:</p>
                <p className="text-gray-900 dark:text-white">
                  {transcript}
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    {interimTranscript}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result state */}
        {quizState === 'result' && currentResult && (
          <div className="space-y-4">
            {/* What was recognized */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You said:</p>
              <p className="text-gray-900 dark:text-white">{transcript || '(No speech detected)'}</p>
            </div>

            {/* Result indicator */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              currentResult.isPassing
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
              <span className={`text-lg font-bold ${
                currentResult.isPassing
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
