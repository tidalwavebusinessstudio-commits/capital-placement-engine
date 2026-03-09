import { NextResponse } from "next/server";
import { explainScore } from "@/lib/ai/scoring";
import { isAIConfigured } from "@/lib/ai/client";

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI not configured. Set ANTHROPIC_API_KEY in .env.local" },
      { status: 503 }
    );
  }

  try {
    const context = await request.json();
    if (!context.projectName || !context.scoreBreakdown) {
      return NextResponse.json(
        { error: "projectName and scoreBreakdown are required" },
        { status: 400 }
      );
    }

    const explanation = await explainScore(context);
    if (!explanation) {
      return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
    }

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
