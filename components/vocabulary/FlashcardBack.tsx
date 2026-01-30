import type { VocabularyItem } from '@/lib/vocabulary/types';
import Image from 'next/image';

interface FlashcardBackProps {
  item: VocabularyItem;
}

export function FlashcardBack({ item }: FlashcardBackProps) {
  return (
    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col shadow-lg overflow-y-auto">
      <div className="relative w-full h-40 md:h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
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
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Examples</h3>
          <div className="space-y-2">
            {item.examples.map((example, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 mb-1">{example.english}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{example.vietnamese}</p>
              </div>
            ))}
          </div>
        </div>

        {item.collocations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Collocations</h3>
            <div className="flex flex-wrap gap-2">
              {item.collocations.map((collocation) => (
                <span
                  key={collocation}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {collocation}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.synonyms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Synonyms</h3>
            <div className="flex flex-wrap gap-2">
              {item.synonyms.map((synonym) => (
                <span
                  key={synonym}
                  className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.antonyms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Antonyms</h3>
            <div className="flex flex-wrap gap-2">
              {item.antonyms.map((antonym) => (
                <span
                  key={antonym}
                  className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm"
                >
                  {antonym}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.wordFamily.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Word Family</h3>
            <div className="flex flex-wrap gap-2">
              {item.wordFamily.map((wf) => (
                <span
                  key={wf.word}
                  className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {wf.word} <span className="text-xs opacity-75">({wf.partOfSpeech})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-400 mt-4 flex-shrink-0">Click to flip back</p>
    </div>
  );
}
