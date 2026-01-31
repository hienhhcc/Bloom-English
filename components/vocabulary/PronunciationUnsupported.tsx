'use client';

import { AlertTriangle, Chrome, ExternalLink } from 'lucide-react';

interface PronunciationUnsupportedProps {
  onSkip: () => void;
  onSelfAssess?: (passed: boolean) => void;
}

export function PronunciationUnsupported({ onSkip, onSelfAssess }: PronunciationUnsupportedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Speech Recognition Not Available
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 max-w-sm">
        Your browser doesn&apos;t support speech recognition. For the best experience, please use Google Chrome or Microsoft Edge.
      </p>

      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
        <Chrome className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Download Google Chrome
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onSelfAssess && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Or assess yourself: Did you pronounce it correctly?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelfAssess(true)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
              >
                Yes, I did
              </button>
              <button
                onClick={() => onSelfAssess(false)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                No, I didn&apos;t
              </button>
            </div>
          </>
        )}

        <button
          onClick={onSkip}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
        >
          Skip Pronunciation Quiz
        </button>
      </div>
    </div>
  );
}
