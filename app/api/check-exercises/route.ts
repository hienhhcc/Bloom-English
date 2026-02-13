import { NextRequest, NextResponse } from 'next/server';
import { checkExercises } from '@/lib/exerciseChecker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    if (mode === 'text') {
      const { answersText, answerKeyText, questionsText } = body;
      if (!answersText || !answerKeyText) {
        return NextResponse.json(
          { error: 'Both answers text and answer key text are required' },
          { status: 400 }
        );
      }
      const result = await checkExercises({
        mode: 'text',
        answersText,
        answerKeyText,
        questionsText,
      });
      return NextResponse.json(result);
    } else {
      const { answersImage, answerKeyImage, questionImage } = body;
      if (!answersImage || !answerKeyImage) {
        return NextResponse.json(
          { error: 'Both answer image and answer key image are required' },
          { status: 400 }
        );
      }
      const result = await checkExercises({
        mode: 'image',
        answersImage,
        answerKeyImage,
        questionImage,
      });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Exercise check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during exercise check' },
      { status: 500 }
    );
  }
}
