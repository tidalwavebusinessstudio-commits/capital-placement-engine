// ============================================================
// AI Outreach Drafter — Generate professional outreach emails
// ============================================================

import { getClaudeClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "./client";
import { SYSTEM_PROMPT, OUTREACH_DRAFT_PROMPT } from "./prompts";

export interface DraftedEmail {
  subject: string;
  body: string;
}

interface OutreachContext {
  contactName: string;
  contactTitle?: string;
  organizationName?: string;
  projectName: string;
  projectSector: string;
  projectCost?: string;
  capitalType?: string;
  fundingGap?: string;
  location?: string;
}

export async function draftOutreachEmail(context: OutreachContext): Promise<DraftedEmail | null> {
  const client = getClaudeClient();
  if (!client) return null;

  const contextText = `
Contact: ${context.contactName}${context.contactTitle ? ` (${context.contactTitle})` : ""}
Organization: ${context.organizationName || "Unknown"}
Project: ${context.projectName}
Sector: ${context.projectSector}
Location: ${context.location || "Unknown"}
Total Project Cost: ${context.projectCost || "Unknown"}
Capital Type Sought: ${context.capitalType || "Unknown"}
Funding Gap: ${context.fundingGap || "Unknown"}
  `.trim();

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${OUTREACH_DRAFT_PROMPT}\n\nContext:\n${contextText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as DraftedEmail;
  } catch (error) {
    console.error("AI outreach draft error:", error);
    return null;
  }
}
