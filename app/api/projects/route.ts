import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProjects } from "@/lib/supabase/db";
import { scoreProject } from "@/lib/scoring/projectScorer";
import { KEVIN_SHARE_PCT } from "@/lib/config/constants";

const DEFAULT_FEE_PCT = 5; // 5% default placement fee

export async function GET() {
  try {
    const data = await getProjects();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Auto-score the project
    const score = scoreProject(body);
    const totalCost = body.total_project_cost || 0;
    const feePct = body.estimated_fee_pct ?? DEFAULT_FEE_PCT;

    const projectData = {
      ...body,
      priority_score: score.total,
      score_breakdown: score,
      estimated_fee_pct: feePct,
      estimated_fee_amount: totalCost ? totalCost * (feePct / 100) : null,
      kevin_share_pct: body.kevin_share_pct ?? KEVIN_SHARE_PCT,
      kevin_estimated_fee: totalCost ? totalCost * (feePct / 100) * (KEVIN_SHARE_PCT / 100) : null,
      stage: body.stage || "discovered",
    };

    // Remove client-generated id if present
    delete projectData.id;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ...projectData, id: `proj-${Date.now()}` }, { status: 201 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Log activity
    const admin = createAdminClient();
    await admin.from("activity_log").insert({
      action: "created",
      entity_type: "project",
      entity_id: data.id,
      details: { name: data.name, sector: data.sector, score: score.total },
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ id, ...updates }, { status: 200 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
