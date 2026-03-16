import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getOpportunities();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
