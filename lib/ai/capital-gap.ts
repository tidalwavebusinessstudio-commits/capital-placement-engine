// ============================================================
// Capital Gap AI Analysis — Claude-powered gap inference
// ============================================================

import { getClaudeClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "./client";
import { SYSTEM_PROMPT } from "./prompts";

export interface GapAnalysisInput {
  project_name: string;
  sector: string;
  project_type: string | null;
  location: string;
  total_project_cost: number | null;
  debt_sought: number | null;
  equity_sought: number | null;
  debt_secured: number | null;
  equity_secured: number | null;
  capital_type: string | null;
  description: string | null;
}

export interface GapAnalysisResult {
  estimated_total_cost: number | null;
  estimated_debt_needed: number | null;
  estimated_equity_needed: number | null;
  typical_ltv: number;
  typical_equity_pct: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  comparable_deals: string[];
  risk_factors: string[];
  recommendations: string[];
}

const CAPITAL_GAP_PROMPT = `Analyze this capital project and provide a detailed capital gap assessment. Use your knowledge of typical capital structures for this sector.

For each sector, apply these typical financing benchmarks:
- Data Centers: 55-65% LTV, senior debt + mezzanine common, equity from sponsors + JV partners
- Commercial Real Estate: 60-75% LTV depending on asset class, construction vs perm debt
- Hospitality: 55-65% LTV, franchise brand requirements affect structure
- Energy/Renewables: Project finance 70-80% leverage, tax equity common
- Infrastructure: 75-85% leverage for investment grade, P3 structures common
- Manufacturing: 50-65% LTV, equipment financing layers
- Technology: 40-60% LTV, more equity-heavy structures

Return a JSON object with these fields:
{
  "estimated_total_cost": "number or null — your best estimate of total project cost if not provided",
  "estimated_debt_needed": "number — estimated total debt needed based on typical LTV for this sector",
  "estimated_equity_needed": "number — estimated equity needed",
  "typical_ltv": "number — typical loan-to-value ratio for this sector/type (0-100)",
  "typical_equity_pct": "number — typical equity percentage (0-100)",
  "confidence": "high | medium | low — how confident you are in these estimates",
  "reasoning": "string — 2-3 sentence explanation of the capital structure analysis",
  "comparable_deals": ["array of 2-3 brief comparable deal descriptions with approximate sizes"],
  "risk_factors": ["array of 2-3 key financing risk factors for this deal"],
  "recommendations": ["array of 2-3 actionable next steps to close the gap"]
}

Only return the JSON object, no other text.`;

export async function analyzeCapitalGap(
  input: GapAnalysisInput
): Promise<GapAnalysisResult | null> {
  const client = getClaudeClient();
  if (!client) return null;

  const projectContext = `
Project: ${input.project_name}
Sector: ${input.sector}
Type: ${input.project_type ?? "Unknown"}
Location: ${input.location || "Unknown"}
Total Project Cost: ${input.total_project_cost ? `$${(input.total_project_cost / 1_000_000).toFixed(1)}M` : "Not specified"}
Debt Sought: ${input.debt_sought ? `$${(input.debt_sought / 1_000_000).toFixed(1)}M` : "Not specified"}
Equity Sought: ${input.equity_sought ? `$${(input.equity_sought / 1_000_000).toFixed(1)}M` : "Not specified"}
Debt Secured: ${input.debt_secured ? `$${(input.debt_secured / 1_000_000).toFixed(1)}M` : "$0"}
Equity Secured: ${input.equity_secured ? `$${(input.equity_secured / 1_000_000).toFixed(1)}M` : "$0"}
Capital Type: ${input.capital_type ?? "Not specified"}
Description: ${input.description ?? "No description provided"}
`.trim();

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${CAPITAL_GAP_PROMPT}\n\n${projectContext}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);
    return parsed as GapAnalysisResult;
  } catch (error) {
    console.error("Capital gap analysis failed:", error);
    return null;
  }
}
