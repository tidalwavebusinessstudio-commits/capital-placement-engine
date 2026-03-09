import { NextResponse } from "next/server";
import { analyzeCapitalGap, type GapAnalysisInput } from "@/lib/ai/capital-gap";
import { isAIConfigured } from "@/lib/ai/client";

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI service not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as GapAnalysisInput;

    if (!body.project_name || !body.sector) {
      return NextResponse.json(
        { error: "project_name and sector are required" },
        { status: 400 }
      );
    }

    const result = await analyzeCapitalGap(body);

    if (!result) {
      return NextResponse.json(
        { error: "Capital gap analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Capital gap API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze capital gap" },
      { status: 500 }
    );
  }
}
