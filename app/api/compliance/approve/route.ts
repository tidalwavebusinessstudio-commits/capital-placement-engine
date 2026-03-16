import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { complianceEntryId, approvedBy } = await request.json();

    if (!complianceEntryId) {
      return NextResponse.json({ error: "complianceEntryId required" }, { status: 400 });
    }

    // If Supabase not configured, return mock success
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        id: complianceEntryId,
        approved: true,
        approved_at: new Date().toISOString(),
      });
    }

    const supabase = createAdminClient();

    // Since compliance_log is immutable (trigger prevents UPDATE/DELETE),
    // we create a NEW compliance_log entry recording the approval action.
    // The original entry stays unchanged — immutability preserved.
    const { data: original, error: fetchErr } = await supabase
      .from("compliance_log")
      .select("*")
      .eq("id", complianceEntryId)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: "Compliance entry not found" }, { status: 404 });
    }

    // Insert a new approval record
    const { data: approval, error: insertErr } = await supabase
      .from("compliance_log")
      .insert({
        actor_id: null,
        action: "firm_approval_granted",
        entity_type: original.entity_type,
        entity_id: original.entity_id,
        details: {
          original_compliance_id: complianceEntryId,
          original_action: original.action,
          approved_by: approvedBy || "Kevin Pham",
          ...(typeof original.details === "object" ? original.details : {}),
        },
        disclosure_text: original.disclosure_text,
        firm_approval_required: false,
        firm_approved: true,
        firm_approved_by: approvedBy || "Kevin Pham",
        firm_approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Log activity
    await supabase.from("activity_log").insert({
      action: "compliance_approved",
      entity_type: "compliance_log",
      entity_id: complianceEntryId,
      details: { approved_by: approvedBy || "Kevin Pham", original_action: original.action },
    });

    return NextResponse.json({
      id: complianceEntryId,
      approvalId: approval?.id,
      approved: true,
      approved_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
