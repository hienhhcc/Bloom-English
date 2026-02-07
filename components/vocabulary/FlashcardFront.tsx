import type { VocabularyItem } from '@/lib/vocabulary/types';
import { normalizeVietnameseDefinitions, getPartOfSpeechColor } from '@/lib/vocabulary/utils';
import { AudioButton } from './AudioButton';
import { Badge } from '@/components/ui/badge';

interface FlashcardFrontProps {
  item: VocabularyItem;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function parsePartsOfSpeech(pos: string): string[] {
  return pos.split(/[;,]/).map(p => p.trim()).filter(p => p.length > 0);
}

export function FlashcardFront({ item }: FlashcardFrontProps) {
  return (
    <div className="absolute inset-0 backface-hidden bg-card rounded-2xl p-6 flex flex-col shadow-lg">
      <div className="flex justify-start items-start mb-4">
        <Badge variant="secondary" className={getDifficultyColor(item.difficulty)}>
          {item.difficulty}
        </Badge>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-2">{item.word}</h2>
        <p className="text-lg text-muted-foreground mb-2">{item.phonetic}</p>

        {/* Part of Speech */}
        <div className="flex gap-2 flex-wrap justify-center mb-3">
          {parsePartsOfSpeech(item.partOfSpeech).map((pos) => (
            <Badge
              key={pos}
              variant="secondary"
              className={getPartOfSpeechColor(pos)}
            >
              {pos}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <AudioButton text={item.word} />
          <AudioButton text={item.word} slow />
        </div>

        <div className="space-y-3 w-full max-w-md">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">English</p>
            <p className="text-foreground">{item.definitionEnglish}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Vietnamese</p>
            <div className="space-y-1.5">
              {normalizeVietnameseDefinitions(item.definitionVietnamese).map((def, i) => (
                <div key={i} className="flex items-start gap-2">
                  {def.type && (
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${getPartOfSpeechColor(def.type)}`}>
                      {def.type}
                    </span>
                  )}
                  <p className="text-foreground">{def.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">Click to flip</p>
    </div>
  );
}
