"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/store/ToastContext";
import { SECTOR_LIST } from "@/lib/config/sectors";

interface ParsedRow {
  name: string;
  sector: string;
  location_city: string;
  location_state: string;
  total_project_cost: string;
  debt_sought: string;
  equity_sought: string;
  capital_type: string;
  description: string;
  source_url: string;
  [key: string]: string;
}

export default function CSVImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const { toast } = useToast();

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImported(false);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      const hdrs = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
      setHeaders(hdrs);

      const parsed: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        hdrs.forEach((h, idx) => {
          row[h] = vals[idx] ?? "";
        });
        parsed.push(row as ParsedRow);
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/sources/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Import failed", "error");
        return;
      }

      setImported(true);
      setImportResult({ imported: data.imported, failed: data.failed });
      toast(`Imported ${data.imported} projects${data.failed > 0 ? ` (${data.failed} failed)` : ""}`);
    } catch {
      toast("Import failed — server error", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/sources" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Sources
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Import Projects from CSV</h1>
        <p className="text-sm text-text-secondary mt-1">
          Upload a CSV file with project data. Expected columns: name, sector, location_city, location_state, total_project_cost, debt_sought, equity_sought, capital_type, description, source_url
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm font-medium text-text-primary">
              {fileName ? fileName : "Click to upload CSV"}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {rows.length > 0 ? `${rows.length} rows parsed` : "CSV files only"}
            </p>
          </label>
        </div>
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Preview ({rows.length} projects)
            </h2>
            {!imported && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-brand text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import All"}
              </button>
            )}
            {imported && importResult && (
              <span className="text-sm text-green-600 font-medium">
                ✓ {importResult.imported} imported{importResult.failed > 0 ? `, ${importResult.failed} failed` : ""}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  {headers.slice(0, 8).map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-text-secondary whitespace-nowrap">
                      {h.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    {headers.slice(0, 8).map((h) => (
                      <td key={h} className="px-3 py-2 text-text-primary whitespace-nowrap max-w-[200px] truncate">
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length > 10 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-2 text-text-muted text-center">
                      ...and {rows.length - 10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sample CSV */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Sample CSV Format</h3>
        <pre className="text-xs text-text-secondary bg-surface-secondary rounded-lg p-3 overflow-x-auto">
{`name,sector,location_city,location_state,total_project_cost,debt_sought,equity_sought,capital_type,description,source_url
"Phoenix DC Campus",data_center,Phoenix,AZ,150000000,100000000,50000000,both,"50MW data center campus",https://example.com
"Marina Bay Apartments",cre,Tampa,FL,85000000,60000000,25000000,both,"280-unit luxury multifamily",`}
        </pre>
      </div>
    </div>
  );
}
