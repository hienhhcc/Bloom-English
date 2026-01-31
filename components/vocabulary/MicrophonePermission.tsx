'use client';

import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface MicrophonePermissionProps {
  error: 'not-allowed' | 'audio-capture' | null;
  onRetry: () => void;
  onSkip?: () => void;
}

export function MicrophonePermission({ error, onRetry, onSkip }: MicrophonePermissionProps) {
  const isPermissionDenied = error === 'not-allowed';
  const isMicrophoneError = error === 'audio-capture';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        isPermissionDenied || isMicrophoneError
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-amber-100 dark:bg-amber-900/30'
      }`}>
        {isPermissionDenied || isMicrophoneError ? (
          <MicOff className="w-8 h-8 text-red-600 dark:text-red-400" />
        ) : (
          <Mic className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {isPermissionDenied
          ? 'Microphone Access Denied'
          : isMicrophoneError
          ? 'Microphone Error'
          : 'Microphone Access Required'}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 max-w-sm">
        {isPermissionDenied ? (
          <>
            Please allow microphone access in your browser settings to use the pronunciation quiz.
            <br />
            <span className="text-xs mt-2 block">
              Click the lock/settings icon in your browser&apos;s address bar to manage permissions.
            </span>
          </>
        ) : isMicrophoneError ? (
          'Unable to access your microphone. Please check that it is connected and not being used by another application.'
        ) : (
          'We need access to your microphone to check your pronunciation. Click the button below and allow microphone access when prompted.'
        )}
      </p>

      {(isPermissionDenied || isMicrophoneError) && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {isPermissionDenied
              ? 'After updating permissions, you may need to refresh the page.'
              : 'Try disconnecting and reconnecting your microphone, then click retry.'}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
        >
          {isPermissionDenied || isMicrophoneError ? 'Retry' : 'Enable Microphone'}
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
