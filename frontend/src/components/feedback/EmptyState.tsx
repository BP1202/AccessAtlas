import React from "react";
import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Cultural Candidates Found",
  description = "No cultural venues or experiences matched your query in the current pilot scope.",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      role="region"
      aria-label="Empty state"
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700 ${className}`}
    >
      <div
        className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        aria-hidden="true"
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
