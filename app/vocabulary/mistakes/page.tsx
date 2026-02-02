import Link from 'next/link';
import { getTopics, getTopicData } from '@/lib/vocabulary/data';
import { MistakesPageContent } from '@/components/vocabulary/MistakesPageContent';
import { ChevronLeft } from 'lucide-react';
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
        <Link
          href="/vocabulary"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Topics
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Review Mistakes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practice the words you got wrong to strengthen your memory
          </p>
        </div>

        <MistakesPageContent
          topics={topics}
          vocabularyEntries={vocabularyEntries}
        />
      </div>
    </div>
  );
}
