import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    name: 'Vocabulary',
    description: 'Learn new words with interactive flashcards',
    icon: BookOpen,
    href: '/vocabulary',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="mr-2">🌸</span>
            Bloom English
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your journey to English fluency starts here. Learn, practice, and grow.
          </p>
        </header>

        {/* Features Grid */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <feature.icon className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <span className="text-primary font-medium inline-flex items-center gap-1">
                      Get Started <ArrowRight className="size-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
