// ============================================================
// AI Score Explanation — Explain project scoring decisions
// ============================================================

import { getClaudeClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "./client";
import { SYSTEM_PROMPT, SCORE_EXPLAIN_PROMPT } from "./prompts";
import type { ScoreBreakdown } from "@/lib/types";

interface ScoreContext {
  projectName: string;
  sector: string;
  totalCost: number | null;
  fundingGap: number | null;
  location: string | null;
  hasContacts: boolean;
  hasDecisionMaker: boolean;
  targetCloseDate: string | null;
  scoreBreakdown: ScoreBreakdown;
}

export async function explainScore(context: ScoreContext): Promise<string | null> {
  const client = getClaudeClient();
  if (!client) return null;

  const contextText = `
Project: ${context.projectName}
Sector: ${context.sector}
Total Cost: ${context.totalCost ? `$${(context.totalCost / 1000000).toFixed(0)}M` : "Unknown"}
Funding Gap: ${context.fundingGap ? `$${(context.fundingGap / 1000000).toFixed(0)}M` : "Unknown"}
Location: ${context.location || "Unknown"}
Has Contacts: ${context.hasContacts ? "Yes" : "No"}
Decision Maker Contact: ${context.hasDecisionMaker ? "Yes" : "No"}
Target Close: ${context.targetCloseDate || "Not set"}

Score Breakdown (total: ${context.scoreBreakdown.total}/100):
- Sector Fit: ${context.scoreBreakdown.sector_fit}/25
- Deal Size Fit: ${context.scoreBreakdown.deal_size_fit}/20
- Capital Gap Clarity: ${context.scoreBreakdown.capital_gap_clarity}/15
- Geographic Desirability: ${context.scoreBreakdown.geographic_desirability}/15
- Contact Quality: ${context.scoreBreakdown.contact_quality}/15
- Timing Urgency: ${context.scoreBreakdown.timing_urgency}/10
  `.trim();

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${SCORE_EXPLAIN_PROMPT}\n\n${contextText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;
    return content.text.trim();
  } catch (error) {
    console.error("AI score explanation error:", error);
    return null;
  }
}
