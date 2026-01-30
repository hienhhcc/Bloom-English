import { getTopics } from '@/lib/vocabulary/data';
import { VocabularyPageContent } from '@/components/vocabulary/VocabularyPageContent';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Vocabulary - Bloom English',
  description: 'Learn English vocabulary with interactive flashcards organized by topic',
};

export default function VocabularyPage() {
  const topics = getTopics();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Vocabulary</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a topic to start learning new words with interactive flashcards
          </p>
        </div>

        <VocabularyPageContent topics={topics} />
      </div>
    </div>
  );
}
