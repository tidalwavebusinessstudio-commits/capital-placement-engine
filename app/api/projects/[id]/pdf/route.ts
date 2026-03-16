import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMockProject } from "@/lib/mock-data";
import { getSectorConfig } from "@/lib/config/sectors";
import { getStageConfig } from "@/lib/config/stages";
import type { Sector, ProjectStage } from "@/lib/types";
import { jsPDF } from "jspdf";

function fmt(val: number | null | undefined): string {
  if (val == null) return "—";
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
}

function fmtFull(val: number | null | undefined): string {
  if (val == null) return "—";
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPct(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val.toFixed(1)}%`;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let project: Record<string, unknown> | null = null;

  // Try Supabase first
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase.from("projects").select("*").eq("id", id).single();
      if (data) project = data;
    } catch {
      // fall through to mock
    }
  }

  // Fallback to mock
  if (!project) {
    const mock = getMockProject(id);
    if (mock) project = mock as unknown as Record<string, unknown>;
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const sectorCfg = getSectorConfig((project.sector as Sector) || "cre");
  const stageCfg = getStageConfig((project.stage as ProjectStage) || "discovered");
  const sb = (project.score_breakdown as Record<string, number>) || {};

  // Build PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const marginL = 15;
  const marginR = 15;
  const contentW = pageW - marginL - marginR;
  let y = 15;

  // Colors
  const brandColor: [number, number, number] = [37, 99, 235]; // blue-600
  const textPrimary: [number, number, number] = [17, 24, 39];
  const textMuted: [number, number, number] = [107, 114, 128];
  const lineColor: [number, number, number] = [229, 231, 235];

  // ===== HEADER =====
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pageW, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("MERIDIAN CAP — DEAL SUMMARY", marginL, 10);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const name = String(project.name || "Untitled Project");
  doc.text(name.length > 50 ? name.substring(0, 50) + "..." : name, marginL, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitle = `${sectorCfg.label} | ${stageCfg.label} | Score: ${project.priority_score ?? "—"}/100`;
  doc.text(subtitle, marginL, 28);

  // Date on right
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, pageW - marginR, 10, { align: "right" });

  y = 42;

  // ===== DESCRIPTION =====
  if (project.description) {
    doc.setTextColor(...textMuted);
    doc.setFontSize(8);
    const desc = String(project.description);
    const lines = doc.splitTextToSize(desc, contentW);
    doc.text(lines.slice(0, 3), marginL, y);
    y += Math.min(lines.length, 3) * 4 + 4;
  }

  // ===== CAPITAL STRUCTURE =====
  doc.setTextColor(...brandColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CAPITAL STRUCTURE", marginL, y);
  y += 2;
  doc.setDrawColor(...lineColor);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;

  const capitalData = [
    ["Total Project Cost", fmtFull(project.total_project_cost as number)],
    ["Debt Sought", fmtFull(project.debt_sought as number)],
    ["Equity Sought", fmtFull(project.equity_sought as number)],
    ["Debt Secured", fmtFull(project.debt_secured as number)],
    ["Equity Secured", fmtFull(project.equity_secured as number)],
    ["Funding Gap", fmtFull(project.funding_gap as number)],
    ["Capital Type", String(project.capital_type || "—").toUpperCase()],
  ];

  doc.setFontSize(9);
  const colW = contentW / 2;
  for (let i = 0; i < capitalData.length; i += 2) {
    // Left column
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(capitalData[i][0], marginL, y);
    doc.setTextColor(...textPrimary);
    doc.setFont("helvetica", "bold");
    doc.text(capitalData[i][1], marginL + 40, y);

    // Right column
    if (i + 1 < capitalData.length) {
      doc.setTextColor(...textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(capitalData[i + 1][0], marginL + colW, y);
      doc.setTextColor(...textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text(capitalData[i + 1][1], marginL + colW + 40, y);
    }
    y += 6;
  }

  y += 4;

  // ===== SCORE BREAKDOWN =====
  doc.setTextColor(...brandColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SCORE BREAKDOWN", marginL, y);
  y += 2;
  doc.setDrawColor(...lineColor);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;

  const scoreItems = [
    ["Sector Fit", sb.sector_fit, 25],
    ["Deal Size Fit", sb.deal_size_fit, 20],
    ["Capital Gap Clarity", sb.capital_gap_clarity, 15],
    ["Geographic Desirability", sb.geographic_desirability, 15],
    ["Contact Quality", sb.contact_quality, 15],
    ["Timing Urgency", sb.timing_urgency, 10],
  ];

  doc.setFontSize(9);
  const barX = marginL + 48;
  const barW = 80;
  const barH = 4;

  for (const [label, val, max] of scoreItems) {
    const v = Number(val) || 0;
    const m = Number(max) || 1;
    const pct = Math.min(v / m, 1);

    // Label
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(String(label), marginL, y);

    // Background bar
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(barX, y - 3, barW, barH, 1, 1, "F");

    // Fill bar
    const fillColor: [number, number, number] = pct >= 0.8 ? [34, 197, 94] : pct >= 0.6 ? [59, 130, 246] : pct >= 0.4 ? [245, 158, 11] : [248, 113, 113];
    doc.setFillColor(...fillColor);
    if (pct > 0) {
      doc.roundedRect(barX, y - 3, barW * pct, barH, 1, 1, "F");
    }

    // Score text
    doc.setTextColor(...textPrimary);
    doc.setFont("helvetica", "bold");
    doc.text(`${v}/${m}`, barX + barW + 4, y);

    y += 7;
  }

  // Total
  doc.setDrawColor(...lineColor);
  doc.line(barX, y - 3, barX + barW + 15, y - 3);
  doc.setTextColor(...brandColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", marginL, y + 2);
  doc.text(`${project.priority_score ?? 0}/100`, barX + barW + 4, y + 2);
  y += 10;

  // ===== FEE ESTIMATE =====
  doc.setTextColor(...brandColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FEE ESTIMATE", marginL, y);
  y += 2;
  doc.setDrawColor(...lineColor);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;

  const feeData = [
    ["Fee %", fmtPct(project.estimated_fee_pct as number)],
    ["Total Fee", fmtFull(project.estimated_fee_amount as number)],
    ["Your Share %", fmtPct(project.kevin_share_pct as number)],
    ["Your Commission", fmtFull(project.kevin_estimated_fee as number)],
  ];

  doc.setFontSize(9);
  for (let i = 0; i < feeData.length; i += 2) {
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(feeData[i][0], marginL, y);
    doc.setTextColor(...textPrimary);
    doc.setFont("helvetica", "bold");
    doc.text(feeData[i][1], marginL + 40, y);

    if (i + 1 < feeData.length) {
      doc.setTextColor(...textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(feeData[i + 1][0], marginL + colW, y);
      doc.setTextColor(...textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text(feeData[i + 1][1], marginL + colW + 40, y);
    }
    y += 6;
  }

  y += 4;

  // ===== PROJECT DETAILS =====
  doc.setTextColor(...brandColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT DETAILS", marginL, y);
  y += 2;
  doc.setDrawColor(...lineColor);
  doc.line(marginL, y, marginL + contentW, y);
  y += 6;

  const location = [project.location_city, project.location_state].filter(Boolean).join(", ") || "—";
  const detailData = [
    ["Sector", sectorCfg.label],
    ["Location", location],
    ["Project Type", String(project.project_type || "—")],
    ["Source", String(project.source_type || "—")],
    ["Target Close", fmtDate(project.target_close_date as string)],
    ["Created", fmtDate(project.created_at as string)],
  ];

  doc.setFontSize(9);
  for (let i = 0; i < detailData.length; i += 2) {
    doc.setTextColor(...textMuted);
    doc.setFont("helvetica", "normal");
    doc.text(detailData[i][0], marginL, y);
    doc.setTextColor(...textPrimary);
    doc.setFont("helvetica", "bold");
    doc.text(detailData[i][1], marginL + 40, y);

    if (i + 1 < detailData.length) {
      doc.setTextColor(...textMuted);
      doc.setFont("helvetica", "normal");
      doc.text(detailData[i + 1][0], marginL + colW, y);
      doc.setTextColor(...textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text(detailData[i + 1][1], marginL + colW + 40, y);
    }
    y += 6;
  }

  // ===== FOOTER =====
  const footerY = 280;
  doc.setDrawColor(...lineColor);
  doc.line(marginL, footerY, marginL + contentW, footerY);
  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const firmName = process.env.FIRM_NAME || "Meridian Cap";
  const disclosure = process.env.FIRM_DISCLOSURE_TEXT || "Securities offered through Meridian Cap. For informational purposes only.";
  doc.text(`${firmName} — Confidential`, marginL, footerY + 4);
  const disclosureLines = doc.splitTextToSize(disclosure, contentW);
  doc.text(disclosureLines.slice(0, 2), marginL, footerY + 8);

  // Generate buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const safeName = name.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="deal-summary-${safeName}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
