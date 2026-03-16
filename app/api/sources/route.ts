import { NextResponse } from "next/server";
import { getSourceRecords } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getSourceRecords();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
