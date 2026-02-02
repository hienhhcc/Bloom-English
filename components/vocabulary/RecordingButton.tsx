'use client';

import { useCallback, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordingButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RecordingButton({
  isRecording,
  isDisabled,
  onStartRecording,
  onStopRecording,
  size = 'md',
  className = '',
}: RecordingButtonProps) {
  // Track if we've handled a touch event to prevent click from firing too
  const handledByTouchRef = useRef(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleAction = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Skip if this click was triggered by a touch we already handled
    if (handledByTouchRef.current) {
      handledByTouchRef.current = false;
      return;
    }

    handleAction();
  }, [handleAction]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark that we handled this via touch so we skip the synthetic click
    handledByTouchRef.current = true;

    // Reset the flag after a short delay (in case click doesn't fire)
    setTimeout(() => {
      handledByTouchRef.current = false;
    }, 100);

    handleAction();
  }, [handleAction]);

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      disabled={isDisabled}
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-manipulation
        select-none
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
          : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
        }
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <Square className={iconSizes[size]} fill="currentColor" />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </button>
  );
}
