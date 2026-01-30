import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function NavigationControls({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: NavigationControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Previous word"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Next word"
      >
        <span>Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
