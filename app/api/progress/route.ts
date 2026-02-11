import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "progress.json");

export async function GET() {
  try {
    const data = await readFile(FILE_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await writeFile(FILE_PATH, JSON.stringify(body, null, 2) + "\n", "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
