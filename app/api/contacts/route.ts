import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContacts } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getContacts();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ...body, id: `con-${Date.now()}` }, { status: 201 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert(body)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
