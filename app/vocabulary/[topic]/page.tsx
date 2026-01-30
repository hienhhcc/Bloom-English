import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTopicData, getTopicById, getTopics } from '@/lib/vocabulary/data';
import { TopicPageContent } from '@/components/vocabulary/TopicPageContent';
import { ChevronLeft } from 'lucide-react';

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
        <Link
          href="/vocabulary"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Topics
        </Link>

        <TopicPageContent topic={topic} items={topicData.items} />
      </div>
    </div>
  );
}
