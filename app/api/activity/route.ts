import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getRecentActivity();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
