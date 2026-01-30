'use client';

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2, Snail } from 'lucide-react';

interface AudioButtonProps {
  text: string;
  slow?: boolean;
  className?: string;
}

export function AudioButton({ text, slow = false, className = '' }: AudioButtonProps) {
  const { speak, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text, slow);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSpeaking}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer ${className}`}
      aria-label={slow ? 'Play slow pronunciation' : 'Play pronunciation'}
      title={slow ? 'Slow speed' : 'Normal speed'}
    >
      {slow ? (
        <Snail className="w-6 h-6" />
      ) : (
        <Volume2 className="w-6 h-6" />
      )}
    </button>
  );
}
