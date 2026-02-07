import type { VocabularyItem } from '@/lib/vocabulary/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface FlashcardBackProps {
  item: VocabularyItem;
}

export function FlashcardBack({ item }: FlashcardBackProps) {
  return (
    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card rounded-2xl p-6 flex flex-col shadow-lg overflow-y-auto">
      <div className="relative w-full h-40 md:h-48 mb-4 rounded-lg overflow-hidden bg-muted shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.word}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Examples</h3>
          <div className="space-y-2">
            {item.examples.slice(0, -1).map((example, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-foreground mb-1">{example.english}</p>
                <p className="text-sm text-muted-foreground">{example.vietnamese}</p>
              </div>
            ))}
          </div>
        </div>

        {item.collocations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Collocations</h3>
            <div className="flex flex-wrap gap-2">
              {item.collocations.map((collocation) => (
                <Badge
                  key={collocation}
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  {collocation}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.synonyms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Synonyms</h3>
            <div className="flex flex-wrap gap-2">
              {item.synonyms.map((synonym) => (
                <Badge
                  key={synonym}
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  {synonym}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.antonyms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Antonyms</h3>
            <div className="flex flex-wrap gap-2">
              {item.antonyms.map((antonym) => (
                <Badge
                  key={antonym}
                  variant="outline"
                  className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                >
                  {antonym}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.wordFamily.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Word Family</h3>
            <div className="space-y-2">
              {item.wordFamily.map((wf) => (
                <div key={wf.word} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 shrink-0"
                  >
                    {wf.word} <span className="text-xs opacity-75">({wf.partOfSpeech})</span>
                  </Badge>
                  {wf.definition && (
                    <span className="text-sm text-muted-foreground">{wf.definition}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4 shrink-0">Click to flip back</p>
    </div>
  );
}
