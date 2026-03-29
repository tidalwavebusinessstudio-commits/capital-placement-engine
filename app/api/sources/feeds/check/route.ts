import { NextResponse } from "next/server";
import { checkSingleFeed } from "@/lib/sources/rssChecker";

interface FeedCheckRequest {
  feedId: string;
  feedName: string;
  feedUrl: string;
  sector: string;
}

export async function POST(request: Request) {
  try {
    const { feedId, feedName, feedUrl, sector } = (await request.json()) as FeedCheckRequest;

    if (!feedUrl) {
      return NextResponse.json({ error: "Feed URL required" }, { status: 400 });
    }

    const result = await checkSingleFeed({
      id: feedId,
      name: feedName,
      url: feedUrl,
      sector,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, newItems: 0 },
        { status: 502 }
      );
    }

    return NextResponse.json({
      newItems: result.newItems,
      totalParsed: result.totalParsed,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
