import React from "react";
import type { PossibilityOutcome } from "@/lib/api/types";
import { OUTCOME_SHORT_LABELS } from "@/lib/constants/labels";

export type BadgeVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | PossibilityOutcome;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  useVisitorLabel?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  useVisitorLabel = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-normal transition-colors";

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700",
    info: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700",
    success:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    danger:
      "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
    VERIFIED_FIT:
      "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800",
    NEEDS_CONFIRMATION:
      "bg-amber-50 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300 dark:border-amber-800",
    REQUIREMENT_CONFLICT:
      "bg-rose-50 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 border border-rose-300 dark:border-rose-800",
  };

  const displayText =
    useVisitorLabel &&
    (variant === "VERIFIED_FIT" ||
      variant === "NEEDS_CONFIRMATION" ||
      variant === "REQUIREMENT_CONFLICT")
      ? OUTCOME_SHORT_LABELS[variant]
      : children;

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {displayText}
    </span>
  );
};
