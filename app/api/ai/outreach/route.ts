import { NextResponse } from "next/server";
import { draftOutreachEmail } from "@/lib/ai/outreach";
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
    if (!context.contactName || !context.projectName) {
      return NextResponse.json(
        { error: "contactName and projectName are required" },
        { status: 400 }
      );
    }

    const result = await draftOutreachEmail(context);
    if (!result) {
      return NextResponse.json({ error: "Failed to draft email" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
