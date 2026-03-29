import { NextResponse } from "next/server";
import { convert } from "html-to-text";
import { extractProjectFromText } from "@/lib/ai/extract";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, sourceId } = body as { url: string; sourceId?: string };

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if AI is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI not configured — add ANTHROPIC_API_KEY to .env.local" },
        { status: 503 },
      );
    }

    // Fetch the URL
    let html: string;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: {
          "User-Agent": "MeridianCap-Scraper/1.0",
        },
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${res.status} ${res.statusText}` },
          { status: 502 },
        );
      }
      html = await res.text();
    } catch (fetchErr) {
      const message = fetchErr instanceof Error ? fetchErr.message : "Fetch failed";
      return NextResponse.json({ error: `Could not fetch URL: ${message}` }, { status: 502 });
    }

    // Convert HTML to plain text
    const plainText = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" },
        { selector: "script", format: "skip" },
        { selector: "style", format: "skip" },
      ],
    });

    const truncatedText = plainText.slice(0, 8000);

    // Extract project data via AI
    const extracted = await extractProjectFromText(truncatedText);

    if (!extracted) {
      return NextResponse.json(
        { error: "AI extraction returned no results" },
        { status: 422 },
      );
    }

    // If sourceId provided and Supabase configured, update the source record
    if (
      sourceId &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = await createClient();
      await supabase
        .from("source_records")
        .update({
          extracted_data: extracted as unknown as Record<string, unknown>,
          raw_content: plainText.slice(0, 5000),
          sector_guess: extracted.sector || null,
          amount_guess: extracted.total_project_cost || null,
          relevance_score: extracted.relevance_score || 50,
        })
        .eq("id", sourceId);
    }

    return NextResponse.json({ extracted, textLength: plainText.length });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
