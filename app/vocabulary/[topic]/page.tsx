import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTopicData, getTopicById, getTopics } from '@/lib/vocabulary/data';
import { FlashcardContainer } from '@/components/vocabulary/FlashcardContainer';

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  const topics = getTopics();
  return topics.map((topic) => ({
    topic: topic.id,
  }));
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { topic: topicId } = await params;
  const topic = getTopicById(topicId);

  if (!topic) {
    return {
      title: 'Topic Not Found - Bloom English',
    };
  }

  return {
    title: `${topic.name} Vocabulary - Bloom English`,
    description: topic.description,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic: topicId } = await params;
  const topic = getTopicById(topicId);
  const topicData = await getTopicData(topicId);

  if (!topic || !topicData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/vocabulary"
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
            Back to Topics
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{topic.icon}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{topic.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{topic.nameVietnamese}</p>
            </div>
          </div>
        </div>

        <FlashcardContainer items={topicData.items} />
      </div>
    </div>
  );
}
