import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow } from '@/lib/workflowStore';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'id parameter is required' },
      { status: 400 }
    );
  }

  const record = getWorkflow(id);
  if (!record) {
    return NextResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(record);
}
