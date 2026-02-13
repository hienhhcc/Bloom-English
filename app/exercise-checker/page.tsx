import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ExerciseCheckerContent } from '@/components/exercise-checker/ExerciseCheckerContent';

export const metadata = {
  title: 'Exercise Checker - Bloom English',
  description: 'Check your textbook exercises with AI — snap photos and get instant feedback',
};

export default function ExerciseCheckerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Exercise Checker</h1>
          <p className="text-muted-foreground">
            Upload photos of your completed exercises and the answer key. AI will compare them and give you instant feedback.
          </p>
        </div>

        <ExerciseCheckerContent />
      </div>
    </div>
  );
}
