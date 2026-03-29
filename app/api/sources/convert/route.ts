import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreProject } from "@/lib/scoring/projectScorer";
import { KEVIN_SHARE_PCT } from "@/lib/config/constants";
import type { ExtractedProject } from "@/lib/ai/extract";
import type { Sector } from "@/lib/types";

const DEFAULT_FEE_PCT = 5;

const VALID_SECTORS: Sector[] = [
  "data_center", "cre", "hospitality", "energy",
  "infrastructure", "manufacturing", "tech",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { extracted, sourceId, sourceText } = body as {
      extracted: ExtractedProject;
      sourceId?: string;
      sourceText?: string;
    };

    if (!extracted) {
      return NextResponse.json({ error: "Missing extracted data" }, { status: 400 });
    }

    // Guard: if Supabase not configured, return mock response
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mockId = `proj-${Date.now()}`;
      return NextResponse.json({
        project: { id: mockId, name: extracted.project_name || "AI Extracted Project" },
        sourceRecord: { id: `src-${Date.now()}`, status: "converted" },
      }, { status: 201 });
    }

    const admin = await createClient();

    // --- Step 1: Create source_record ---
    const { data: sourceRecord, error: srcError } = await admin
      .from("source_records")
      .insert({
        source_type: "news",
        title: extracted.project_name || "AI Extracted Source",
        raw_content: sourceText ? sourceText.slice(0, 5000) : null,
        extracted_data: extracted as unknown as Record<string, unknown>,
        sector_guess: extracted.sector && VALID_SECTORS.includes(extracted.sector as Sector)
          ? extracted.sector
          : null,
        amount_guess: extracted.total_project_cost || null,
        relevance_score: extracted.relevance_score || 50,
        status: "converted",
      })
      .select()
      .single();

    if (srcError) {
      return NextResponse.json({ error: srcError.message }, { status: 400 });
    }

    // --- Step 2: Create project with same scoring logic as /api/projects ---
    const sector: Sector = extracted.sector && VALID_SECTORS.includes(extracted.sector as Sector)
      ? (extracted.sector as Sector)
      : "cre";

    const projectInput = {
      name: extracted.project_name || "AI Extracted Project",
      sector,
      location_city: extracted.location_city || null,
      location_state: extracted.location_state || null,
      total_project_cost: extracted.total_project_cost || null,
      debt_sought: extracted.debt_sought || null,
      equity_sought: extracted.equity_sought || null,
      capital_type: extracted.capital_type || null,
      description: extracted.description || null,
      project_type: extracted.project_type || null,
      stage: "discovered" as const,
      source_type: "news" as const,
      source_record_id: sourceRecord.id,
    };

    // Auto-score the project
    const score = scoreProject(projectInput as never);
    const totalCost = projectInput.total_project_cost || 0;
    const feePct = DEFAULT_FEE_PCT;

    const projectData = {
      ...projectInput,
      priority_score: score.total,
      score_breakdown: score,
      estimated_fee_pct: feePct,
      estimated_fee_amount: totalCost ? totalCost * (feePct / 100) : null,
      kevin_share_pct: KEVIN_SHARE_PCT,
      kevin_estimated_fee: totalCost ? totalCost * (feePct / 100) * (KEVIN_SHARE_PCT / 100) : null,
    };

    const { data: project, error: projError } = await admin
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (projError) {
      return NextResponse.json({ error: projError.message }, { status: 400 });
    }

    // --- Step 3: Update source_record with converted_project_id ---
    await admin
      .from("source_records")
      .update({ converted_project_id: project.id })
      .eq("id", sourceRecord.id);

    // --- Step 4: If sourceId provided, update that existing source too ---
    if (sourceId) {
      await admin
        .from("source_records")
        .update({ status: "converted", converted_project_id: project.id })
        .eq("id", sourceId);
    }

    // --- Step 5: Log activity entries ---
    await admin.from("activity_log").insert([
      {
        action: "created",
        entity_type: "source_record",
        entity_id: sourceRecord.id,
        details: { title: sourceRecord.title, source: "ai_convert" },
      },
      {
        action: "created",
        entity_type: "project",
        entity_id: project.id,
        details: { name: project.name, sector: project.sector, score: score.total, source: "ai_convert" },
      },
    ]);

    return NextResponse.json({ project, sourceRecord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
