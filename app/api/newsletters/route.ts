import { NextResponse } from "next/server";
import { getNewsletters } from "@/lib/supabase/db";

export async function GET() {
  try {
    const data = await getNewsletters();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
