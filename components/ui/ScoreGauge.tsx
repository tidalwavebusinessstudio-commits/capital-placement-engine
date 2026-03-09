"use client";

const SCORE_COLORS = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function getScoreColor(score: number): keyof typeof SCORE_COLORS {
  if (score >= 80) return "green";
  if (score >= 60) return "blue";
  if (score >= 40) return "amber";
  return "red";
}

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const colorKey = getScoreColor(score);
  const colorClasses = SCORE_COLORS[colorKey];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${colorClasses}`}
    >
      {score}
    </span>
  );
}
