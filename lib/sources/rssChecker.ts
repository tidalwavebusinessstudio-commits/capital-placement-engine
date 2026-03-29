// ============================================================
// RSS Feed Checker — shared parsing and scoring logic
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import { RELEVANCE_KEYWORDS, EXCLUSION_KEYWORDS } from "@/lib/config/feeds";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export function parseRSSXml(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  const getTagContent = (xml: string, tag: string): string => {
    // Try CDATA first, then plain content
    const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
    const plainRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();
    const plainMatch = plainRegex.exec(xml);
    return (plainMatch?.[1] || "").trim();
  };

  // Try RSS <item> elements
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: getTagContent(itemXml, "title"),
      link: getTagContent(itemXml, "link"),
      pubDate: getTagContent(itemXml, "pubDate") || getTagContent(itemXml, "dc:date"),
      description: getTagContent(itemXml, "description") || getTagContent(itemXml, "summary"),
    });
  }

  // Try Atom <entry> elements if no RSS items found
  if (items.length === 0) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      const linkMatch = /<link[^>]*href=["']([^"']*)["']/i.exec(entryXml);
      items.push({
        title: getTagContent(entryXml, "title"),
        link: linkMatch?.[1] || getTagContent(entryXml, "link"),
        pubDate: getTagContent(entryXml, "published") || getTagContent(entryXml, "updated"),
        description: getTagContent(entryXml, "summary") || getTagContent(entryXml, "content"),
      });
    }
  }

  return items;
}

export function scoreRelevance(title: string, description: string): number {
  const text = (title + " " + description).toLowerCase();
  let score = 0;
  let matchCount = 0;

  for (const keyword of RELEVANCE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
      score += 8;
    }
  }

  for (const keyword of EXCLUSION_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score -= 15;
    }
  }

  if (matchCount >= 3) score += 15;
  if (matchCount >= 5) score += 10;

  return Math.max(0, Math.min(100, score));
}

export async function checkSingleFeed(
  feed: { id: string; name: string; url: string; sector: string }
): Promise<{ newItems: number; totalParsed: number; error?: string }> {
  // Fetch the RSS feed
  let xml: string;
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "MeridianCap-SourceMonitor/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (fetchErr) {
    return { newItems: 0, totalParsed: 0, error: `Failed to fetch feed: ${fetchErr}` };
  }

  const items = parseRSSXml(xml);

  if (items.length === 0) {
    return { newItems: 0, totalParsed: 0 };
  }

  // Score and filter
  const scoredItems = items
    .map((item) => ({ ...item, relevance: scoreRelevance(item.title, item.description) }))
    .filter((item) => item.relevance > 20)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);

  // If Supabase not configured, return counts without persisting
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { newItems: scoredItems.length, totalParsed: items.length };
  }

  const supabase = createAdminClient();
  let newCount = 0;

  for (const item of scoredItems) {
    // Dedup by URL
    if (item.link) {
      const { data: existing } = await supabase
        .from("source_records")
        .select("id")
        .eq("url", item.link)
        .limit(1);

      if (existing && existing.length > 0) continue;
    }

    const { error } = await supabase.from("source_records").insert({
      source_type: "rss",
      title: item.title || `[${feed.name}] New item`,
      url: item.link || null,
      raw_content: item.description || null,
      extracted_data: { feed_id: feed.id, feed_name: feed.name, pub_date: item.pubDate },
      sector_guess: feed.sector,
      relevance_score: item.relevance,
      status: "new",
    });

    if (!error) newCount++;
  }

  if (newCount > 0) {
    await supabase.from("activity_log").insert({
      action: "feed_checked",
      entity_type: "source_record",
      details: { feed_name: feed.name, new_items: newCount, total_parsed: items.length },
    });
  }

  return { newItems: newCount, totalParsed: items.length };
}
