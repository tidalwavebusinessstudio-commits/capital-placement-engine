import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreProject } from "@/lib/scoring/projectScorer";

const VALID_SECTORS = ['data_center', 'cre', 'hospitality', 'energy', 'infrastructure', 'manufacturing', 'tech'];
const VALID_CAPITAL_TYPES = ['debt', 'equity', 'both'];

interface CSVRow {
  name: string;
  sector: string;
  location_city: string;
  location_state: string;
  total_project_cost: string;
  debt_sought: string;
  equity_sought: string;
  capital_type: string;
  description: string;
  source_url: string;
}

export async function POST(request: Request) {
  try {
    const { rows } = await request.json() as { rows: CSVRow[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    // If Supabase not configured, return mock results
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const mockResults = rows.map((row, i) => ({
        id: `proj-import-${Date.now()}-${i}`,
        name: row.name,
        status: "created",
      }));
      return NextResponse.json({ imported: mockResults.length, failed: 0, results: mockResults }, { status: 201 });
    }

    const supabase = createAdminClient();
    const imported: { id: string; name: string; status: string }[] = [];
    const failed: { name: string; error: string }[] = [];

    for (const row of rows) {
      try {
        const sector = VALID_SECTORS.includes(row.sector?.toLowerCase())
          ? row.sector.toLowerCase()
          : "cre";

        const capitalType = VALID_CAPITAL_TYPES.includes(row.capital_type?.toLowerCase())
          ? row.capital_type.toLowerCase()
          : "both";

        const totalCost = parseFloat(row.total_project_cost) || null;
        const debtSought = parseFloat(row.debt_sought) || null;
        const equitySought = parseFloat(row.equity_sought) || null;

        const projectData = {
          name: row.name || "Untitled Project",
          sector,
          location_city: row.location_city || null,
          location_state: row.location_state || null,
          total_project_cost: totalCost,
          debt_sought: debtSought,
          equity_sought: equitySought,
          capital_type: capitalType,
          description: row.description || null,
          source_url: row.source_url || null,
          source_type: "csv_import" as const,
          stage: "discovered" as const,
        };

        // Score the project
        const score = scoreProject(projectData as any);
        const projectWithScore = {
          ...projectData,
          priority_score: score.total,
          score_breakdown: score,
          estimated_fee_pct: 5.00,
          estimated_fee_amount: totalCost ? totalCost * 0.05 : null,
          kevin_share_pct: 50.00,
          kevin_estimated_fee: totalCost ? totalCost * 0.025 : null,
        };

        const { data, error } = await supabase
          .from("projects")
          .insert(projectWithScore)
          .select("id, name")
          .single();

        if (error) {
          failed.push({ name: row.name, error: error.message });
          continue;
        }

        // Create source record
        await supabase.from("source_records").insert({
          source_type: "csv_import",
          title: `CSV Import: ${row.name}`,
          url: row.source_url || null,
          raw_content: JSON.stringify(row),
          sector_guess: sector,
          relevance_score: score.total,
          status: "converted",
          converted_project_id: data.id,
        });

        // Log activity
        await supabase.from("activity_log").insert({
          action: "csv_import",
          entity_type: "project",
          entity_id: data.id,
          details: { name: data.name, source: "csv_import", score: score.total },
        });

        imported.push({ id: data.id, name: data.name, status: "created" });
      } catch (err) {
        failed.push({ name: row.name || "Unknown", error: String(err) });
      }
    }

    return NextResponse.json({
      imported: imported.length,
      failed: failed.length,
      results: imported,
      errors: failed,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
