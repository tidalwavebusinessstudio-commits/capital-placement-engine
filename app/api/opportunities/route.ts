import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const data = await getOpportunities();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ...body, id: body.id || `opp-${Date.now()}` }, { status: 201 });
    }

    const supabase = createAdminClient();
    const { id, ...insertData } = body;

    const { data, error } = await supabase
      .from("opportunities")
      .insert(insertData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_log").insert({
      action: "created",
      entity_type: "opportunity",
      entity_id: data.id,
      details: { project_id: data.project_id, amount: data.amount },
    });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
