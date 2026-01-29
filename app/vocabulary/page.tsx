import { getTopics } from '@/lib/vocabulary/data';
import { TopicCard } from '@/components/vocabulary/TopicCard';
import Link from 'next/link';

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
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Vocabulary</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a topic to start learning new words with interactive flashcards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}
