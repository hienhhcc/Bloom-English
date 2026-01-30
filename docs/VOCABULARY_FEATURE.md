# Vocabulary Learning Feature - Implementation Plan

> **Status**: IMPLEMENTED - This feature has been fully built. This document serves as the feature specification and architecture reference.

## Overview

Create a vocabulary learning section with interactive flashcards organized by topic. Each flashcard features text-to-speech pronunciation, flip animation, and comprehensive word information.

## Feature Summary

- **Topics Page** (`/vocabulary`) - Grid of vocabulary topics
- **Flashcard Page** (`/vocabulary/[topic]`) - Interactive flashcard learning experience
- **Flashcard Front**: Word, phonetic, part of speech, definitions (EN/VN), audio buttons (normal & slow speed)
- **Flashcard Back**: Image, 2 example sentences, collocations, synonyms, antonyms, word families
- **Navigation**: Next/Previous buttons, progress indicator

---

## File Structure

```
bloom-english/
├── app/
│   ├── vocabulary/
│   │   ├── page.tsx                    # Topics list page
│   │   └── [topic]/
│   │       └── page.tsx                # Flashcard page
│   └── globals.css                     # Add flip animation utilities
├── components/
│   └── vocabulary/
│       ├── TopicCard.tsx               # Topic card for listing
│       ├── FlashcardContainer.tsx      # State management wrapper
│       ├── Flashcard.tsx               # Main card with flip animation
│       ├── FlashcardFront.tsx          # Front side content
│       ├── FlashcardBack.tsx           # Back side content
│       ├── AudioButton.tsx             # TTS button component
│       ├── ProgressIndicator.tsx       # "Word X of Y" display
│       └── NavigationControls.tsx      # Next/Previous buttons
├── hooks/
│   ├── useTextToSpeech.ts              # Web Speech API hook
│   └── useFlashcard.ts                 # Navigation state hook
├── lib/
│   └── vocabulary/
│       ├── types.ts                    # TypeScript interfaces
│       └── data.ts                     # Data loading utilities
├── data/
│   └── vocabulary/
│       ├── topics.json                 # Topics metadata
│       └── [topic].json                # Vocabulary items per topic
└── public/
    └── images/
        └── vocabulary/                 # Images organized by topic
```

---

## TypeScript Interfaces

```typescript
// lib/vocabulary/types.ts

type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' |
                    'conjunction' | 'pronoun' | 'interjection' | 'determiner' | 'phrasal verb';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface ExampleSentence {
  english: string;
  vietnamese: string;
}

interface WordFamilyItem {
  word: string;
  partOfSpeech: PartOfSpeech;
}

interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;                    // IPA e.g., "/dɒɡ/"
  partOfSpeech: PartOfSpeech;
  definitionEnglish: string;
  definitionVietnamese: string;
  difficulty: DifficultyLevel;
  imageUrl: string;
  examples: [ExampleSentence, ExampleSentence];
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  wordFamily: WordFamilyItem[];
}

interface VocabularyTopic {
  id: string;                          // URL slug e.g., "animals"
  name: string;                        // e.g., "Animals"
  nameVietnamese: string;
  description: string;
  icon: string;                        // Emoji
  wordCount: number;
  difficulty: DifficultyLevel;
}
```

---

## Key Implementation Details

### 1. Text-to-Speech (Free - Web Speech API)

Using the browser's built-in Web Speech API:
- Normal speed: `rate: 1`
- Slow speed (2x slower): `rate: 0.5`
- Automatic English voice selection
- Works in all modern browsers

### 2. Card Flip Animation

CSS 3D transforms added to `globals.css`:
```css
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
```

Flip triggered by click/tap with 500ms transition.

### 3. Data Management

Static JSON files imported at build time:
- `data/vocabulary/topics.json` - All topics metadata
- `data/vocabulary/[topic].json` - 20+ vocabulary items per topic
- Dynamic imports for code splitting

---

## Sample Data Structure

```json
{
  "topicId": "animals",
  "items": [
    {
      "id": "animals-001",
      "word": "elephant",
      "phonetic": "/ˈelɪfənt/",
      "partOfSpeech": "noun",
      "definitionEnglish": "A very large animal with thick grey skin, large ears, tusks and a long trunk",
      "definitionVietnamese": "Con voi - loài động vật rất to với da xám dày, tai lớn, ngà và vòi dài",
      "difficulty": "beginner",
      "imageUrl": "/images/vocabulary/animals/elephant.jpg",
      "examples": [
        {
          "english": "The elephant sprayed water with its trunk.",
          "vietnamese": "Con voi phun nước bằng vòi của nó."
        },
        {
          "english": "African elephants are larger than Asian elephants.",
          "vietnamese": "Voi châu Phi to hơn voi châu Á."
        }
      ],
      "collocations": ["elephant herd", "baby elephant", "wild elephant"],
      "synonyms": ["pachyderm", "jumbo"],
      "antonyms": [],
      "wordFamily": []
    }
  ]
}
```

---

## Verification Plan

1. **Topics Page**: Navigate to `/vocabulary`, verify all topics display correctly with icons and difficulty badges
2. **Flashcard Navigation**: Click topic, verify flashcard loads with first word
3. **Card Flip**: Click flashcard, verify smooth 180-degree rotation animation
4. **TTS - Normal Speed**: Click speaker icon, verify word is pronounced at normal speed
5. **TTS - Slow Speed**: Click turtle/slow icon, verify word is pronounced 2x slower
6. **Next/Previous**: Click navigation buttons, verify word changes and progress updates
7. **Back Side Content**: Flip card, verify image, examples, collocations, synonyms, antonyms display
8. **Mobile**: Test on mobile viewport, verify touch interactions and responsive layout
9. **Dark Mode**: Toggle system dark mode, verify colors adapt correctly

---

## Topics

| Topic | Slug | Difficulty | Example Words |
|-------|------|------------|---------------|
| Animals | `animals` | Beginner | dog, cat, elephant, butterfly, dolphin |
| Food & Drinks | `food-drinks` | Beginner | bread, coffee, vegetable, delicious, appetite |
| Travel | `travel` | Intermediate | destination, itinerary, accommodation, departure |
| Family | `family` | Beginner | sibling, nephew, ancestor, relative, generation |
| Weather | `weather` | Beginner | temperature, forecast, humidity, breeze, drought |
| Colors | `colors` | Beginner | scarlet, turquoise, crimson, beige, chartreuse |

Each topic has 20+ vocabulary items mixing basic and advanced words.
