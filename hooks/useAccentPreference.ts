"use client";

import { useCallback, useEffect, useState } from "react";
import type { Accent } from "@/lib/vocabulary/utils";

const STORAGE_KEY = "bloom-english-accent";

interface UseAccentPreferenceReturn {
  accent: Accent;
  setAccent: (accent: Accent) => void;
  isLoaded: boolean;
}

export function useAccentPreference(): UseAccentPreferenceReturn {
  const [accent, setAccentState] = useState<Accent>("AmE");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "BrE" || stored === "AmE") {
        setAccentState(stored);
      }
    } catch {
      // localStorage unavailable
    }
    setIsLoaded(true);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(STORAGE_KEY, newAccent);
    } catch {
      // localStorage unavailable
    }
  }, []);

  return { accent, setAccent, isLoaded };
}
