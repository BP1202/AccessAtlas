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
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e7e0d3] bg-[#f6f3eb]/60 p-8 sm:p-10 text-center dark:border-[#323731] dark:bg-[#191c19]/40 ${className}`}
    >
      <div
        className="mb-4 rounded-full bg-[#ede8dc] p-3.5 text-[#193a32] dark:bg-[#262a25] dark:text-[#a8d5c4]"
        aria-hidden="true"
      >
        <svg
          className="h-7 w-7"
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
      <h3 className="mb-2 font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">
        {title}
      </h3>
      <p className="max-w-md text-sm leading-relaxed text-[#53594e] dark:text-[#a3aba0]">
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
