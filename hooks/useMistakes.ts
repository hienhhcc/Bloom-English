'use client';

import { useMemo } from 'react';
import { useProgress } from './useProgress';
import type { MistakeRecord } from '@/lib/vocabulary/progress';

export interface MistakeWithTopic extends MistakeRecord {
  topicId: string;
}

interface UseMistakesReturn {
  allMistakes: MistakeWithTopic[];
  mistakesByTopic: Map<string, MistakeRecord[]>;
  totalMistakesCount: number;
  isLoaded: boolean;
  getMistakesForTopic: (topicId: string) => MistakeRecord[];
}

export function useMistakes(): UseMistakesReturn {
  const { getAllMistakes, isLoaded } = useProgress();

  const mistakesData = getAllMistakes();

  const mistakesByTopic = useMemo(() => {
    const map = new Map<string, MistakeRecord[]>();
    for (const { topicId, mistakes } of mistakesData) {
      map.set(topicId, mistakes);
    }
    return map;
  }, [mistakesData]);

  const allMistakes = useMemo(() => {
    const mistakes: MistakeWithTopic[] = [];
    for (const { topicId, mistakes: topicMistakes } of mistakesData) {
      for (const mistake of topicMistakes) {
        mistakes.push({ ...mistake, topicId });
      }
    }
    // Sort by lastWrongDate (most recent first)
    return mistakes.sort((a, b) => b.lastWrongDate - a.lastWrongDate);
  }, [mistakesData]);

  const totalMistakesCount = allMistakes.length;

  const getMistakesForTopic = (topicId: string): MistakeRecord[] => {
    return mistakesByTopic.get(topicId) || [];
  };

  return {
    allMistakes,
    mistakesByTopic,
    totalMistakesCount,
    isLoaded,
    getMistakesForTopic,
  };
}
