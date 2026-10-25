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
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  useVisitorLabel = false,
  icon,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-normal transition-colors";

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      "bg-[#ede8dc] text-[#252923] border border-[#e7e0d3] dark:bg-[#2e332c] dark:text-[#e4ded0] dark:border-[#3d443a]",
    info:
      "bg-[#e7f0e9] text-[#134e3f] border border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
    success:
      "bg-emerald-50 bg-[#e7f0e9] text-[#134e3f] border border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
    warning:
      "bg-amber-50 bg-[#fcf5e8] text-[#784408] border border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
    danger:
      "bg-rose-50 bg-[#fdf0ec] text-[#8b2612] border border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
    VERIFIED_FIT:
      "bg-emerald-50 bg-[#e7f0e9] text-[#134e3f] border border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
    NEEDS_CONFIRMATION:
      "bg-amber-50 bg-[#fcf5e8] text-[#784408] border border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
    REQUIREMENT_CONFLICT:
      "bg-rose-50 bg-[#fdf0ec] text-[#8b2612] border border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
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
      {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
      {displayText}
    </span>
  );
};

export const StatusLabel = Badge;
