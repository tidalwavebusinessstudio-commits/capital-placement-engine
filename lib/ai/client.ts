// ============================================================
// Claude SDK Client — Server-side only
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getClaudeClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Default model for all AI operations
export const AI_MODEL = "claude-sonnet-4-20250514";

// Token limits
export const MAX_INPUT_TOKENS = 4096;
export const MAX_OUTPUT_TOKENS = 2048;
