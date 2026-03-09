import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/client";
import { draftNewsletter } from "@/lib/ai/newsletter";

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { sectorFocus, activeDeals, recentActivity, monthYear } = body;

    if (!sectorFocus || !activeDeals) {
      return NextResponse.json(
        { error: "sectorFocus and activeDeals are required" },
        { status: 400 }
      );
    }

    const result = await draftNewsletter({
      sectorFocus,
      activeDeals,
      recentActivity: recentActivity ?? [],
      monthYear: monthYear ?? new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    });

    if (!result) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
