import { NextResponse } from "next/server";
import { getFeedConfigs } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const data = await getFeedConfigs();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, url, sector, check_interval_minutes } = body;
    if (!name || !url || !sector) {
      return NextResponse.json({ error: "name, url, and sector are required" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        id: `feed-${Date.now()}`,
        name,
        url,
        sector,
        enabled: true,
        check_interval_minutes: check_interval_minutes ?? 60,
        last_checked_at: null,
        created_at: new Date().toISOString(),
      }, { status: 201 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("feed_configs")
      .insert({
        name,
        url,
        sector,
        enabled: true,
        check_interval_minutes: check_interval_minutes ?? 60,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("feed_configs")
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
