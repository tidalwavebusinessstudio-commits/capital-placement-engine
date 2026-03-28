import { NextResponse } from "next/server";
import { getSourceRecords } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const data = await getSourceRecords();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ...body, id: body.id || `src-${Date.now()}` }, { status: 201 });
    }

    const supabase = createAdminClient();
    const { id, ...insertData } = body;

    const { data, error } = await supabase
      .from("source_records")
      .insert(insertData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_log").insert({
      action: "source_added",
      entity_type: "source_record",
      entity_id: data.id,
      details: { title: data.title, source_type: data.source_type },
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

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ id, ...updates }, { status: 200 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("source_records")
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
