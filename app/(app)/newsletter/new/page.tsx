"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { SECTORS, SECTOR_LIST } from "@/lib/config/sectors";
import { STAGES } from "@/lib/config/stages";
import { formatCurrency } from "@/lib/utils/format";
import type { Newsletter, Sector } from "@/lib/types";

export default function NewNewsletterPage() {
  const router = useRouter();
  const { projects, addNewsletter } = useData();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [sectorFocus, setSectorFocus] = useState<Sector[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleSector(sector: Sector) {
    setSectorFocus((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  }

  async function handleAIDraft() {
    if (sectorFocus.length === 0) {
      toast("Select at least one sector focus", "error");
      return;
    }

    setGenerating(true);

    const activeDeals = projects
      .filter((p) => p.stage !== "dead" && !p.archived_at)
      .filter((p) => sectorFocus.length === 0 || sectorFocus.includes(p.sector))
      .slice(0, 8)
      .map((p) => ({
        name: p.name,
        sector: SECTORS[p.sector]?.label ?? p.sector,
        amount: p.total_project_cost ? formatCurrency(p.total_project_cost) : "TBD",
        location: p.location_city && p.location_state ? `${p.location_city}, ${p.location_state}` : "TBD",
        stage: STAGES[p.stage]?.label ?? p.stage,
      }));

    try {
      const res = await fetch("/api/ai/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectorFocus: sectorFocus.map((s) => SECTORS[s]?.label ?? s),
          activeDeals,
          recentActivity: [
            `${activeDeals.length} active deals in selected sectors`,
            `Pipeline value: ${formatCurrency(
              projects
                .filter((p) => sectorFocus.includes(p.sector) && p.stage !== "dead")
                .reduce((s, p) => s + (p.total_project_cost ?? 0), 0)
            )}`,
          ],
          monthYear: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "AI drafting failed", "error");
        return;
      }

      const draft = await res.json();
      setSubjectLine(draft.subject_line);
      setBodyText(draft.body);
      if (!title) {
        setTitle(
          `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} ${sectorFocus.map((s) => SECTORS[s]?.label).join(" & ")} Update`
        );
      }
      toast("AI newsletter draft generated");
    } catch {
      toast("AI service unavailable — draft manually", "error");
    } finally {
      setGenerating(false);
    }
  }

  function handleSave(status: "draft" | "review") {
    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }
    setSaving(true);

    const newsletter: Newsletter = {
      id: `nl-${Date.now()}`,
      title,
      subject_line: subjectLine || null,
      body_html: null,
      body_text: bodyText || null,
      sector_focus: sectorFocus,
      status,
      ai_draft: bodyText ? { generated_at: new Date().toISOString() } : {},
      editor_notes: null,
      recipient_count: 0,
      sent_at: null,
      scheduled_at: null,
      approved_by: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addNewsletter(newsletter);
    toast(status === "review" ? "Newsletter submitted for review" : "Newsletter draft saved");
    router.push("/newsletter");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/newsletter" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Newsletter
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">New Newsletter</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Create a newsletter edition with AI-assisted drafting
        </p>
      </div>

      <div className="space-y-4">
        {/* Sector Focus */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Sector Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {SECTOR_LIST.map((sec) => {
              const config = SECTORS[sec.id];
              const selected = sectorFocus.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  onClick={() => toggleSector(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    selected
                      ? "bg-brand/10 border-brand/40 text-brand"
                      : "border-border text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleAIDraft}
            disabled={generating || sectorFocus.length === 0}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:bg-brand/10 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating draft...
              </>
            ) : (
              <>🤖 Generate AI Draft from Pipeline</>
            )}
          </button>
        </div>

        {/* Newsletter Content */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="e.g. Q1 2026 Data Center Capital Markets Update"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">
              Subject Line
            </label>
            <input
              id="subject"
              type="text"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="Email subject line for recipients"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-text-primary mb-1">
              Body
            </label>
            <textarea
              id="body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
              placeholder="Newsletter content..."
            />
          </div>
        </div>

        {/* Compliance notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Compliance:</span> All newsletters require partner
            approval before sending. Securities disclosures will be auto-appended. Sending is logged
            to the immutable compliance trail.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("review")}
            disabled={saving || !title.trim()}
            className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            Submit for Review
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !title.trim()}
            className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            Save Draft
          </button>
          <Link href="/newsletter" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
