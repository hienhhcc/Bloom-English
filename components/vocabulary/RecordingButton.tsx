'use client';

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

  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
        }
        ${className}
      `}
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
