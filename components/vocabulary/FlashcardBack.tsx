import { Badge } from '@/components/ui/badge';
import type { VocabularyItem } from '@/lib/vocabulary/types';

interface FlashcardBackProps {
  item: VocabularyItem;
}

export function FlashcardBack({ item }: FlashcardBackProps) {
  return (
    <div className="[grid-area:1/1] backface-hidden rotate-y-180 bg-card rounded-2xl p-4 flex flex-col border shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]">

      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Examples</h3>
          <div className="space-y-1.5">
            {item.examples.slice(0, -1).map((example, index) => (
              <div key={index} className="px-3 py-2 bg-muted rounded-lg">
                <p className="text-sm text-foreground mb-0.5">{example.english}</p>
                <p className="text-xs text-muted-foreground">{example.vietnamese}</p>
              </div>
            ))}
          </div>
        </div>

        {item.collocations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Collocations</h3>
            <div className="flex flex-wrap gap-1.5">
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
            <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Synonyms</h3>
            <div className="flex flex-wrap gap-1.5">
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
            <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Antonyms</h3>
            <div className="flex flex-wrap gap-1.5">
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
            <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Word Family</h3>
            <div className="space-y-1.5">
              {item.wordFamily.map((wf) => (
                <div key={`${wf.word}-${wf.partOfSpeech}`} className="flex items-start gap-2">
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
    </div>
  );
}
