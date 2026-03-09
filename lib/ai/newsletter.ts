// ============================================================
// AI Newsletter Drafter — Generate newsletter content from pipeline data
// ============================================================

import { getClaudeClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "./client";
import { SYSTEM_PROMPT, NEWSLETTER_DRAFT_PROMPT } from "./prompts";

export interface DraftedNewsletter {
  subject_line: string;
  body: string;
}

interface NewsletterContext {
  sectorFocus: string[];
  activeDeals: { name: string; sector: string; amount: string; location: string; stage: string }[];
  recentActivity: string[];
  monthYear: string;
}

export async function draftNewsletter(context: NewsletterContext): Promise<DraftedNewsletter | null> {
  const client = getClaudeClient();
  if (!client) return null;

  const contextText = `
Sector Focus: ${context.sectorFocus.join(", ")}
Month: ${context.monthYear}

Active Deals:
${context.activeDeals.map((d) => `- ${d.name} (${d.sector}) — ${d.amount}, ${d.location}, Stage: ${d.stage}`).join("\n")}

Recent Activity:
${context.recentActivity.map((a) => `- ${a}`).join("\n")}
  `.trim();

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${NEWSLETTER_DRAFT_PROMPT}\n\nContext:\n${contextText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as DraftedNewsletter;
  } catch (error) {
    console.error("AI newsletter draft error:", error);
    return null;
  }
}
