"use client";

import { formatCurrency } from "@/lib/utils/format";

interface CapitalGapBarProps {
  totalCost: number | null;
  debtSecured: number | null;
  equitySecured: number | null;
}

export default function CapitalGapBar({
  totalCost,
  debtSecured,
  equitySecured,
}: CapitalGapBarProps) {
  if (!totalCost || totalCost <= 0) {
    return (
      <div className="text-sm text-text-secondary">No capital data</div>
    );
  }

  const debt = debtSecured ?? 0;
  const equity = equitySecured ?? 0;
  const secured = debt + equity;
  const gap = Math.max(totalCost - secured, 0);

  const debtPct = (debt / totalCost) * 100;
  const equityPct = (equity / totalCost) * 100;
  const gapPct = (gap / totalCost) * 100;

  return (
    <div className="w-full space-y-1.5">
      {/* Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {debtPct > 0 && (
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${debtPct}%` }}
            title={`Debt: ${formatCurrency(debt)} (${debtPct.toFixed(1)}%)`}
          />
        )}
        {equityPct > 0 && (
          <div
            className="bg-blue-500 transition-all"
            style={{ width: `${equityPct}%` }}
            title={`Equity: ${formatCurrency(equity)} (${equityPct.toFixed(1)}%)`}
          />
        )}
        {gapPct > 0 && (
          <div
            className="bg-slate-400 dark:bg-slate-500 transition-all"
            style={{ width: `${gapPct}%` }}
            title={`Gap: ${formatCurrency(gap)} (${gapPct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Debt {formatCurrency(debt)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          Equity {formatCurrency(equity)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          Gap {formatCurrency(gap)}
        </span>
        <span className="ml-auto font-medium text-text-primary">
          Total {formatCurrency(totalCost)}
        </span>
      </div>
    </div>
  );
}
