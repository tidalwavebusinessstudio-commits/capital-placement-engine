// ============================================================
// AI Prompts — Domain-specific prompts for capital placement
// ============================================================

export const SYSTEM_PROMPT = `You are an AI assistant for a capital placement firm that sources U.S. projects ($20M-$250M+) seeking debt and equity capital. You help with:
- Extracting project details from news articles, filings, and LinkedIn posts
- Drafting professional outreach emails to sponsors and developers
- Explaining project scoring decisions
- Summarizing deal pipeline for newsletters

You maintain an institutional, professional tone. You understand real estate, infrastructure, energy, data center, and hospitality sectors.

Key business context:
- Partner fee range: 4-8% of placed capital
- Kevin gets 50% of placement fees
- Priority sectors (in order): Data Centers, Commercial Real Estate, Hospitality, Energy, Infrastructure, Manufacturing, Technology
- Geographic focus: United States only
- Capital types: senior debt, mezzanine debt, preferred equity, common equity, or combinations`;

export const EXTRACT_SOURCE_PROMPT = `Extract structured project information from the following text. Return a JSON object with these fields (use null for unknown):

{
  "project_name": "string — the project or development name",
  "organization_name": "string — the sponsor/developer company name",
  "sector": "data_center | cre | hospitality | energy | infrastructure | manufacturing | tech",
  "project_type": "ground_up | acquisition | refinance | expansion | renovation | recapitalization",
  "description": "string — 1-2 sentence summary",
  "location_city": "string",
  "location_state": "string — 2-letter state code",
  "total_project_cost": "number — in dollars, or null",
  "capital_type": "debt | equity | both",
  "debt_sought": "number or null",
  "equity_sought": "number or null",
  "key_contacts": ["array of names mentioned"],
  "relevance_score": "number 0-100 — how relevant is this for a $20M-$250M capital placement firm",
  "relevance_reasoning": "string — brief explanation of the score"
}

Only return the JSON object, no other text.`;

export const OUTREACH_DRAFT_PROMPT = `Draft a professional outreach email for a capital placement opportunity. The tone should be:
- Professional and institutional (not salesy)
- Concise — no more than 3 short paragraphs
- Mentions specific project details to show genuine interest
- Includes a clear call to action (schedule a call)
- Does NOT include any securities language (that gets added separately as a disclosure)

Return a JSON object with:
{
  "subject": "string — email subject line",
  "body": "string — email body (plain text, no HTML)"
}

Only return the JSON object, no other text.`;

export const SCORE_EXPLAIN_PROMPT = `Explain why this project received its scoring breakdown in 2-3 sentences. Be specific about what factors drove the score up or down. Reference the sector priority, deal size fit, capital gap clarity, geographic desirability, contact quality, and timing urgency.

Scoring weights:
- Sector fit: 25 pts (Data Centers = 25, CRE = 20, Hospitality = 18, Energy = 16, Infrastructure = 15, Manufacturing = 14, Tech = 13)
- Deal size fit: 20 pts (sweet spot $20M-$250M, penalties outside)
- Capital gap clarity: 15 pts (clear gap with amount = high, vague = low)
- Geographic desirability: 15 pts (top data center markets like NoVA, Dallas = high)
- Contact quality: 15 pts (decision maker with email = high, no contacts = low)
- Timing urgency: 10 pts (close date within 6 months = high, none = low)

Return plain text explanation only, no JSON.`;

export const NEWSLETTER_DRAFT_PROMPT = `Draft a newsletter section for a capital placement firm's monthly update. The newsletter goes to capital partners (lenders, equity investors, family offices).

The tone should be:
- Market-aware and data-driven
- Highlights opportunities without being promotional
- Uses specific dollar amounts and deal details
- 2-3 paragraphs maximum
- Includes a brief market context opener

Return a JSON object with:
{
  "subject_line": "string — newsletter subject line",
  "body": "string — newsletter body text (plain text)"
}

Only return the JSON object, no other text.`;
