"use client";

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const SIZE_MAP = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

interface BadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
}

export default function Badge({ label, color, size = "sm" }: BadgeProps) {
  const colorClasses = COLOR_MAP[color] ?? COLOR_MAP.slate;
  const sizeClasses = SIZE_MAP[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${colorClasses} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
