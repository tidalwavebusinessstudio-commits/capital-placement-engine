"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/lib/store/ToastContext";
import { useData } from "@/lib/store/DataContext";
import { RELEVANCE_KEYWORDS } from "@/lib/config/feeds";
import { SECTORS } from "@/lib/config/sectors";
import Badge from "@/components/ui/Badge";
import type { FeedConfig, Sector, SourceRecord } from "@/lib/types";

export default function FeedsPage() {
  const { addSourceRecord } = useData();
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<FeedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch feeds from API on mount
  useEffect(() => {
    async function loadFeeds() {
      try {
        const res = await fetch("/api/sources/feeds");
        if (res.ok) {
          const data = await res.json();
          setFeeds(data);
        }
      } catch {
        toast("Failed to load feeds", "error");
      } finally {
        setLoading(false);
      }
    }
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleFeed(id: string) {
    const feed = feeds.find((f) => f.id === id);
    if (!feed) return;

    const newEnabled = !feed.enabled;

    // Optimistic update
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: newEnabled } : f))
    );

    try {
      const res = await fetch("/api/sources/feeds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: newEnabled }),
      });

      if (!res.ok) {
        // Revert on failure
        setFeeds((prev) =>
          prev.map((f) => (f.id === id ? { ...f, enabled: !newEnabled } : f))
        );
        toast("Failed to update feed", "error");
        return;
      }

      toast(newEnabled ? `${feed.name} enabled` : `${feed.name} disabled`);
    } catch {
      setFeeds((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabled: !newEnabled } : f))
      );
      toast("Failed to update feed", "error");
    }
  }

  async function checkFeed(feed: FeedConfig) {
    setChecking(feed.id);

    try {
      const res = await fetch("/api/sources/feeds/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedId: feed.id,
          feedName: feed.name,
          feedUrl: feed.url,
          sector: feed.sector,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Fallback to simulated check if fetch fails
        const sectorConfig = SECTORS[feed.sector as Sector];
        const mockTitle = `[${sectorConfig?.label ?? feed.sector}] New deal spotted via ${feed.name}`;
        const record: SourceRecord = {
          id: `src-${Date.now()}`,
          source_type: "rss",
          title: mockTitle,
          url: feed.url,
          raw_content: `Auto-discovered from RSS feed: ${feed.name}. Feed check returned: ${data.error || "error"}`,
          extracted_data: { feed_id: feed.id, feed_name: feed.name },
          sector_guess: feed.sector as Sector,
          location_guess: null,
          amount_guess: null,
          relevance_score: Math.floor(Math.random() * 40) + 40,
          status: "new",
          converted_project_id: null,
          dismissed_reason: null,
          created_at: new Date().toISOString(),
        };
        addSourceRecord(record);
        toast(`${feed.name}: Feed fetch failed, added simulated entry`, "info");
      } else {
        toast(`Checked ${feed.name} — ${data.newItems} new source${data.newItems === 1 ? "" : "s"} added`);
      }

      // Update last_checked_at via PATCH
      const now = new Date().toISOString();
      await fetch("/api/sources/feeds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: feed.id, last_checked_at: now }),
      });

      setFeeds((prev) =>
        prev.map((f) =>
          f.id === feed.id ? { ...f, last_checked_at: now } : f
        )
      );
    } catch {
      toast(`Failed to check ${feed.name}`, "error");
    } finally {
      setChecking(null);
    }
  }

  async function checkAllFeeds() {
    setCheckingAll(true);
    try {
      const res = await fetch("/api/sources/feeds/check-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.ok) {
        toast(`Checked ${data.checked} feeds — ${data.totalNew} new sources added`);
        // Refresh feeds to get updated last_checked_at
        const feedsRes = await fetch("/api/sources/feeds");
        if (feedsRes.ok) {
          const updatedFeeds = await feedsRes.json();
          setFeeds(updatedFeeds);
        }
      } else {
        toast("Failed to check all feeds", "error");
      }
    } catch {
      toast("Failed to check all feeds", "error");
    } finally {
      setCheckingAll(false);
    }
  }

  async function handleAddFeed(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || "Custom Feed";
    const url = (form.get("url") as string) || "";
    const sector = (form.get("sector") as string) || "cre";

    try {
      const res = await fetch("/api/sources/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, sector }),
      });

      if (!res.ok) {
        toast("Failed to add feed", "error");
        return;
      }

      const newFeed = await res.json();
      setFeeds((prev) => [...prev, newFeed]);
      setShowAddForm(false);
      toast(`Feed "${newFeed.name}" added`);
    } catch {
      toast("Failed to add feed", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-text-muted">Loading feeds...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/sources" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            &larr; Sources
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mt-2">Source Monitors</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {feeds.filter((f) => f.enabled).length} active feeds &middot; RSS and news auto-intake
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkAllFeeds}
            disabled={checkingAll}
            className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-40"
          >
            {checkingAll ? "Checking..." : "Check All Feeds"}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            + Add Feed
          </button>
        </div>
      </div>

      {/* Add Feed Form */}
      {showAddForm && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Add Custom Feed</h3>
          <form onSubmit={handleAddFeed} className="grid grid-cols-3 gap-3">
            <input
              name="name"
              type="text"
              required
              placeholder="Feed name"
              className="px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <input
              name="url"
              type="url"
              required
              placeholder="https://example.com/rss"
              className="px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <div className="flex gap-2">
              <select
                name="sector"
                className="flex-1 px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {Object.entries(SECTORS).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed list */}
      <div className="space-y-2">
        {feeds.map((feed) => {
          const sectorConfig = SECTORS[feed.sector as Sector];
          return (
            <div
              key={feed.id}
              className={`bg-surface rounded-xl border p-4 transition-colors ${
                feed.enabled ? "border-border" : "border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFeed(feed.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      feed.enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                        feed.enabled ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{feed.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {sectorConfig && (
                        <Badge label={sectorConfig.label} color="slate" size="sm" />
                      )}
                      <span className="text-xs text-text-muted">
                        Every {feed.check_interval_minutes}min
                      </span>
                      {feed.last_checked_at && (
                        <span className="text-xs text-green-600">
                          Last: {new Date(feed.last_checked_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkFeed(feed)}
                    disabled={!feed.enabled || checking === feed.id}
                    className="text-xs font-medium text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {checking === feed.id ? "Checking..." : "Check Now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keywords reference */}
      <div className="mt-6 bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Relevance Keywords</h3>
        <p className="text-xs text-text-muted mb-3">
          Sources are scored based on the presence of these deal-signal keywords:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RELEVANCE_KEYWORDS.slice(0, 20).map((kw) => (
            <span
              key={kw}
              className="text-xs bg-surface-secondary text-text-secondary px-2 py-0.5 rounded"
            >
              {kw}
            </span>
          ))}
          <span className="text-xs text-text-muted">
            +{RELEVANCE_KEYWORDS.length - 20} more
          </span>
        </div>
      </div>
    </div>
  );
}
