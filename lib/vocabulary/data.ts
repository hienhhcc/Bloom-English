import type { VocabularyTopic, TopicData } from './types';

import topicsData from '@/data/vocabulary/topics.json';

export function getTopics(): VocabularyTopic[] {
  return topicsData as VocabularyTopic[];
}

export async function getTopicData(topicId: string): Promise<TopicData | null> {
  try {
    const data = await import(`@/data/vocabulary/${topicId}.json`);
    return data.default as TopicData;
  } catch {
    return null;
  }
}

export function getTopicById(topicId: string): VocabularyTopic | undefined {
  return getTopics().find((topic) => topic.id === topicId);
}
