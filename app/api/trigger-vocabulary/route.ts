import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, vocabulariesCount } = body;

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!vocabulariesCount || typeof vocabulariesCount !== 'number') {
      return NextResponse.json(
        { error: 'Vocabulary count is required' },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is not configured' },
        { status: 500 }
      );
    }

    // Forward request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim(), vocabulariesCount }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `n8n webhook failed: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering vocabulary workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
