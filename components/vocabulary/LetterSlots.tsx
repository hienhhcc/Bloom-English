'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface LetterSlotsProps {
  word: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showResult?: 'correct' | 'incorrect' | null;
  lockedChars?: number;
}

export function LetterSlots({
  word,
  value,
  onChange,
  disabled = false,
  showResult = null,
  lockedChars = 0,
}: LetterSlotsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Move cursor to end of input value
  const moveCursorToEnd = useCallback(() => {
    if (inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
      moveCursorToEnd();
    }
  }, [disabled, moveCursorToEnd]);

  // Also move cursor to end when value changes (e.g., after hint)
  useEffect(() => {
    moveCursorToEnd();
  }, [value, moveCursorToEnd]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Small delay to ensure the focus event completes before moving cursor
    requestAnimationFrame(() => {
      moveCursorToEnd();
    });
  }, [moveCursorToEnd]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase();

    // Prevent modifying locked characters
    if (newValue.length < lockedChars) {
      // Restore locked prefix if user tried to delete it
      const lockedPrefix = word.slice(0, lockedChars).toLowerCase();
      onChange(lockedPrefix);
      return;
    }

    // Ensure locked characters remain unchanged
    if (lockedChars > 0) {
      const lockedPrefix = word.slice(0, lockedChars).toLowerCase();
      const userSuffix = newValue.slice(lockedChars);
      const correctedValue = lockedPrefix + userSuffix;
      if (correctedValue.length <= word.length) {
        onChange(correctedValue);
      }
      return;
    }

    if (newValue.length <= word.length) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent backspace from deleting locked characters
    if (e.key === 'Backspace' && value.length <= lockedChars) {
      e.preventDefault();
    }
  };

  const getSlotColor = (index: number) => {
    if (!showResult) {
      // Show hinted/locked characters in a different color
      if (index < lockedChars) {
        return 'text-amber-600 dark:text-amber-400';
      }
      return 'text-gray-800 dark:text-gray-200';
    }
    if (showResult === 'correct') {
      return 'text-green-600 dark:text-green-400';
    }
    // Incorrect - show which letters are right/wrong
    const userChar = value[index]?.toLowerCase();
    const correctChar = word[index]?.toLowerCase();
    if (userChar === correctChar) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-red-600 dark:text-red-400';
  };

  const getUnderscoreColor = (index: number) => {
    if (showResult) {
      if (showResult === 'correct') {
        return 'bg-green-500 dark:bg-green-400';
      }
      return 'bg-red-500 dark:bg-red-400';
    }
    // Highlight current typing position
    if (!disabled && isFocused && index === value.length) {
      return 'bg-blue-500 dark:bg-blue-400 animate-pulse';
    }
    return 'bg-gray-400 dark:bg-gray-500';
  };

  return (
    <div
      className="relative cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="flex justify-center gap-1 md:gap-1.5 overflow-x-auto">
        {word.split('').map((char, index) => {
          const isSpace = char === ' ';
          const userChar = value[index] || '';
          const displayChar = showResult === 'incorrect' && !userChar ? word[index] : userChar;

          if (isSpace) {
            return (
              <div key={index} className="w-3 md:w-4" />
            );
          }

          return (
            <div
              key={index}
              className="flex flex-col items-center w-5 md:w-7 flex-shrink-0"
            >
              <span
                className={`text-lg md:text-xl font-mono font-bold h-7 flex items-center justify-center ${getSlotColor(index)}`}
              >
                {displayChar || '\u00A0'}
              </span>
              <div
                className={`w-full h-0.5 rounded-full ${getUnderscoreColor(index)}`}
              />
            </div>
          );
        })}
      </div>

      {!disabled && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
          Type the word ({word.length} letters)
        </p>
      )}
    </div>
  );
}
