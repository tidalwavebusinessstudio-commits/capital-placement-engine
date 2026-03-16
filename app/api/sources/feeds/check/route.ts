import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RELEVANCE_KEYWORDS, EXCLUSION_KEYWORDS } from "@/lib/config/feeds";

interface FeedCheckRequest {
  feedId: string;
  feedName: string;
  feedUrl: string;
  sector: string;
}

function parseRSSXml(xml: string): { title: string; link: string; pubDate: string; description: string }[] {
  const items: { title: string; link: string; pubDate: string; description: string }[] = [];

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

function scoreRelevance(title: string, description: string): number {
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

export async function POST(request: Request) {
  try {
    const { feedId, feedName, feedUrl, sector } = (await request.json()) as FeedCheckRequest;

    if (!feedUrl) {
      return NextResponse.json({ error: "Feed URL required" }, { status: 400 });
    }

    // Fetch the RSS feed
    let xml: string;
    try {
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "MeridianCap-SourceMonitor/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      xml = await res.text();
    } catch (fetchErr) {
      return NextResponse.json(
        { error: `Failed to fetch feed: ${fetchErr}`, newItems: 0 },
        { status: 502 }
      );
    }

    const items = parseRSSXml(xml);

    if (items.length === 0) {
      return NextResponse.json({ newItems: 0, message: "No items found in feed" });
    }

    // Score and filter
    const scoredItems = items
      .map((item) => ({ ...item, relevance: scoreRelevance(item.title, item.description) }))
      .filter((item) => item.relevance > 20)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    // If Supabase not configured, return without persisting
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        newItems: scoredItems.length,
        items: scoredItems.map((item) => ({
          title: item.title,
          url: item.link,
          relevance: item.relevance,
          sector,
        })),
      });
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
        title: item.title || `[${feedName}] New item`,
        url: item.link || null,
        raw_content: item.description || null,
        extracted_data: { feed_id: feedId, feed_name: feedName, pub_date: item.pubDate },
        sector_guess: sector,
        relevance_score: item.relevance,
        status: "new",
      });

      if (!error) newCount++;
    }

    if (newCount > 0) {
      await supabase.from("activity_log").insert({
        action: "feed_checked",
        entity_type: "source_record",
        details: { feed_name: feedName, new_items: newCount, total_parsed: items.length },
      });
    }

    return NextResponse.json({
      newItems: newCount,
      totalParsed: items.length,
      relevantFound: scoredItems.length,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
