import { NextResponse } from "next/server";
import { extractProjectFromText } from "@/lib/ai/extract";
import { isAIConfigured } from "@/lib/ai/client";

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI not configured. Set ANTHROPIC_API_KEY in .env.local" },
      { status: 503 }
    );
  }

  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text field is required" }, { status: 400 });
    }

    const result = await extractProjectFromText(text);
    if (!result) {
      return NextResponse.json({ error: "Failed to extract project data" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
