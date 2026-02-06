import { getWorkflow, updateWorkflow } from "@/lib/workflowStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, status, message } = body;

    if (!workflowId || typeof workflowId !== "string") {
      return NextResponse.json(
        { error: "workflowId is required" },
        { status: 400 },
      );
    }

    if (status !== "completed" && status !== "failed") {
      return NextResponse.json(
        { error: 'status must be "completed" or "failed"' },
        { status: 400 },
      );
    }

    const record = getWorkflow(workflowId);
    if (!record) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 },
      );
    }

    const updated = updateWorkflow(workflowId, status, message);
    return NextResponse.json({ success: true, workflow: updated });
  } catch (error) {
    console.error("Error in workflow callback:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
