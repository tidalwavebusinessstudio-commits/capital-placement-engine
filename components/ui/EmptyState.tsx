"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4" role="img" aria-label={title}>
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
