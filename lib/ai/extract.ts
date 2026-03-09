// ============================================================
// AI Source Extraction — Extract project data from articles/posts
// ============================================================

import { getClaudeClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "./client";
import { SYSTEM_PROMPT, EXTRACT_SOURCE_PROMPT } from "./prompts";

export interface ExtractedProject {
  project_name: string | null;
  organization_name: string | null;
  sector: string | null;
  project_type: string | null;
  description: string | null;
  location_city: string | null;
  location_state: string | null;
  total_project_cost: number | null;
  capital_type: string | null;
  debt_sought: number | null;
  equity_sought: number | null;
  key_contacts: string[];
  relevance_score: number;
  relevance_reasoning: string | null;
}

export async function extractProjectFromText(text: string): Promise<ExtractedProject | null> {
  const client = getClaudeClient();
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${EXTRACT_SOURCE_PROMPT}\n\n---\n\n${text.slice(0, 4000)}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return null;

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as ExtractedProject;
    return parsed;
  } catch (error) {
    console.error("AI extraction error:", error);
    return null;
  }
}
