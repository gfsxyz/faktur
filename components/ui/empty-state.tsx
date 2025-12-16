"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  description?: string;
  icon?: ReactNode;
  cta?: ReactNode;
}

export default function EmptyState({
  description = "No data to display",
  icon,
  cta,
}: EmptyStateProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="space-y-3 text-center text-muted-foreground">
        {icon && (
          <div
            aria-hidden="true"
            className="mx-auto flex justify-center opacity-40"
          >
            {icon}
          </div>
        )}

        <p className="text-xs">{description}</p>

        {cta && <div className="mx-auto">{cta}</div>}
      </div>
    </div>
  );
}
