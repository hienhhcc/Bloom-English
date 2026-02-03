import { getTopics, getTopicData } from '@/lib/vocabulary/data';
import { MistakesPageContent } from '@/components/vocabulary/MistakesPageContent';
import type { VocabularyItem } from '@/lib/vocabulary/types';

export const metadata = {
  title: 'Review Mistakes - Bloom English',
  description: 'Review and practice words you got wrong in previous quizzes',
};

export default async function MistakesPage() {
  const topics = getTopics();

  // Load vocabulary for all topics
  const vocabularyByTopic = new Map<string, VocabularyItem[]>();
  for (const topic of topics) {
    const topicData = await getTopicData(topic.id);
    if (topicData) {
      vocabularyByTopic.set(topic.id, topicData.items);
    }
  }

  // Convert Map to serializable format for client component
  const vocabularyEntries = Array.from(vocabularyByTopic.entries());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MistakesPageContent
          topics={topics}
          vocabularyEntries={vocabularyEntries}
        />
      </div>
    </div>
  );
}
