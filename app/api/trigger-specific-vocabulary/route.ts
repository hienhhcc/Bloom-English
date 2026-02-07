import { NextRequest, NextResponse } from 'next/server';
import { createWorkflow } from '@/lib/workflowStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, vocabularies, mode = 'existing' } = body;

    // Validate input
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(vocabularies) || vocabularies.length === 0) {
      return NextResponse.json(
        { error: 'Vocabularies array is required and must not be empty' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_SPECIFIC_VOCABULARIES_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is not configured' },
        { status: 500 }
      );
    }

    // Generate workflow tracking ID and callback URL
    const workflowId = crypto.randomUUID();
    const origin = process.env.APP_URL || request.nextUrl.origin;
    const callbackUrl = `${origin}/api/workflow-callback`;

    // Store pending workflow record
    const wordList = vocabularies.join(', ');
    createWorkflow(workflowId, 'specific-vocabulary', `Words: ${wordList}`);

    // Forward request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        vocabularies,
        mode,
        workflowId,
        callbackUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `n8n webhook failed: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, workflowId });
  } catch (error) {
    console.error('Error triggering specific vocabulary workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
