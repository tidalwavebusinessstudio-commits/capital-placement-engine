import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getResendClient,
  isResendConfigured,
  getFirmDisclosure,
  getFirmName,
} from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const { to, subject, body, contactId, projectId } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 }
      );
    }

    const disclosure = getFirmDisclosure();
    const firmName = getFirmName();

    // Append disclosure to email body
    const fullBody = body + "\n\n---\n" + disclosure;

    let emailResult: { id: string; mock?: boolean } | null = null;

    // Send via Resend if configured
    if (isResendConfigured()) {
      const resend = getResendClient();
      if (resend) {
        try {
          const { data, error } = await resend.emails.send({
            from: `${firmName} <outreach@${process.env.RESEND_DOMAIN || "meridian-cap.com"}>`,
            to: [to],
            subject,
            text: fullBody,
          });

          if (error) {
            console.error("Resend error:", error);
            return NextResponse.json(
              { error: "Email send failed: " + error.message },
              { status: 500 }
            );
          }
          emailResult = data;
        } catch (err) {
          console.error("Resend exception:", err);
          return NextResponse.json(
            { error: "Email service error" },
            { status: 500 }
          );
        }
      }
    } else {
      // No Resend key — log but don't actually send
      emailResult = { id: "mock-" + Date.now(), mock: true };
      console.log(
        "[Email] Resend not configured. Would send to:",
        to,
        "Subject:",
        subject
      );
    }

    // Log to Supabase if configured
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = createAdminClient();

      // Create outreach record
      await supabase.from("outreach").insert({
        contact_id: contactId || null,
        project_id: projectId || null,
        channel: "email",
        direction: "outbound",
        subject,
        body: fullBody,
        status: isResendConfigured() ? "sent" : "draft",
        sent_at: isResendConfigured() ? new Date().toISOString() : null,
        compliance_approved: true,
        compliance_approved_at: new Date().toISOString(),
      });

      // Create compliance log entry
      await supabase.from("compliance_log").insert({
        action: "outreach_sent",
        entity_type: "outreach",
        details: {
          to,
          subject,
          email_id: emailResult?.id,
          contact_id: contactId,
          project_id: projectId,
        },
        disclosure_text: disclosure,
        firm_approval_required: true,
        firm_approved: null,
      });

      // Log activity
      await supabase.from("activity_log").insert({
        action: "email_sent",
        entity_type: "outreach",
        details: {
          to,
          subject,
          via: isResendConfigured() ? "resend" : "mock",
        },
      });
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult?.id,
      mock: !isResendConfigured(),
      message: isResendConfigured()
        ? "Email sent successfully"
        : "Email logged (Resend not configured — no actual email sent)",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
