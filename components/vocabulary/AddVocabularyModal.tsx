'use client';

import { useState } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';
import type { VocabularyTopic } from '@/lib/vocabulary/types';

interface AddVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: VocabularyTopic[];
  onWorkflowTriggered?: (workflowId: string, label: string) => void;
}

export function AddVocabularyModal({ isOpen, onClose, topics, onWorkflowTriggered }: AddVocabularyModalProps) {
  const [fileName, setFileName] = useState('');
  const [vocabularies, setVocabularies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName) {
      setErrorMessage('Please select a file');
      setStatus('error');
      return;
    }

    if (!vocabularies.trim()) {
      setErrorMessage('Please enter at least one word');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const wordList = vocabularies
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);

      if (wordList.length === 0) {
        throw new Error('No valid words provided');
      }

      const response = await fetch('/api/trigger-specific-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, vocabularies: wordList }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.workflowId && onWorkflowTriggered) {
        onWorkflowTriggered(data.workflowId, `Words: ${wordList.join(', ')}`);
      }

      setStatus('success');
      setFileName('');
      setVocabularies('');

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to trigger workflow');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setStatus('idle');
      setErrorMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Research Specific Vocabularies
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* File Name Select */}
          <div>
            <label
              htmlFor="fileName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Target File
            </label>
            <select
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            >
              <option value="">Select a file...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.icon} {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vocabularies Input */}
          <div>
            <label
              htmlFor="vocabularies"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Words to Research
            </label>
            <input
              id="vocabularies"
              type="text"
              value={vocabularies}
              onChange={(e) => setVocabularies(e.target.value)}
              placeholder='e.g., resilient, pragmatic, elaborate'
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate words with commas
            </p>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-700 dark:text-green-300">
                Workflow started! You&apos;ll be notified when it completes.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-white bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Research
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            The n8n workflow will research these words using AI and append them to the selected file.
          </p>
        </div>
      </div>
    </div>
  );
}
