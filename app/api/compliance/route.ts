import { NextResponse } from "next/server";
import { getComplianceLog } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getComplianceLog();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
