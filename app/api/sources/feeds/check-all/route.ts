import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkSingleFeed } from "@/lib/sources/rssChecker";
import { DEFAULT_FEEDS } from "@/lib/config/feeds";

interface FeedResult {
  feedName: string;
  newItems: number;
  error?: string;
}

async function runCheckAll(): Promise<{ checked: number; totalNew: number; results: FeedResult[] }> {
  const results: FeedResult[] = [];
  let totalNew = 0;

  // Get enabled feeds
  let feeds: { id: string; name: string; url: string; sector: string }[];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    feeds = DEFAULT_FEEDS.filter((f) => f.enabled).map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      sector: f.sector,
    }));
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feed_configs")
      .select("id, name, url, sector")
      .eq("enabled", true);

    if (error) {
      return { checked: 0, totalNew: 0, results: [{ feedName: "query", newItems: 0, error: error.message }] };
    }
    feeds = data ?? [];
  }

  for (const feed of feeds) {
    try {
      const result = await checkSingleFeed(feed);
      totalNew += result.newItems;

      results.push({
        feedName: feed.name,
        newItems: result.newItems,
        error: result.error,
      });

      // Update last_checked_at
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = await createClient();
        await supabase
          .from("feed_configs")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", feed.id);
      }
    } catch (err) {
      results.push({
        feedName: feed.name,
        newItems: 0,
        error: `Unexpected error: ${err}`,
      });
    }
  }

  return { checked: feeds.length, totalNew, results };
}

// GET — for Vercel Cron
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await runCheckAll();
  return NextResponse.json(data);
}

// POST — for manual UI trigger
export async function POST() {
  const data = await runCheckAll();
  return NextResponse.json(data);
}
