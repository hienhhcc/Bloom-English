interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Word {current + 1} of {total}
      </span>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
