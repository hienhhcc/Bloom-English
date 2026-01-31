import { NextRequest, NextResponse } from 'next/server';
import { checkTranslation, isLLMAvailable, getCurrentProvider } from '@/lib/translationChecker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vietnamese, userTranslation, vocabularyWord } = body;

    // Validate required fields
    if (!vietnamese || !userTranslation || !vocabularyWord) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if LLM provider is available
    const llmAvailable = await isLLMAvailable();
    const provider = getCurrentProvider();

    if (!llmAvailable) {
      return NextResponse.json(
        {
          grammarCorrect: true,
          grammarErrors: [],
          isCorrect: true,
          score: -1,
          feedback: `Translation check unavailable (${provider} not configured)`,
          suggestions: [],
          referenceTranslation: '',
        },
        { status: 200 }
      );
    }

    // Perform comprehensive translation check
    const result = await checkTranslation(
      vietnamese,
      userTranslation,
      vocabularyWord
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation check error:', error);
    return NextResponse.json(
      {
        grammarCorrect: true,
        grammarErrors: [],
        isCorrect: true,
        score: -1,
        feedback: 'An error occurred during translation check',
        suggestions: [],
        referenceTranslation: '',
      },
      { status: 200 } // Return 200 to not break the UI
    );
  }
}
