import React, { useState } from "react";
import type { CandidateParticipationPlan } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  OUTCOME_LABELS,
  RESOLUTION_LABELS,
} from "@/lib/constants/labels";
import { VisitPlanDetail } from "./VisitPlanDetail";

export interface CandidateCardProps {
  plan: CandidateParticipationPlan;
  className?: string;
  defaultExpanded?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  plan,
  className = "",
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const {
    candidate,
    resolution_status,
    possibility_assessment,
    supported_findings,
    unresolved_gaps,
  } = plan;

  const isResolved = resolution_status === "resolved";
  const outcome = possibility_assessment?.aggregate_outcome;

  return (
    <article
      aria-label={`Cultural candidate: ${candidate.name}`}
      className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {candidate.entity_type}
            {candidate.subtype ? ` · ${candidate.subtype}` : ""}
          </span>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {RESOLUTION_LABELS[resolution_status]}
          </span>
        </div>

        {/* Outcome Badge if resolved and evaluated */}
        {isResolved && outcome && (
          <Badge variant={outcome}>
            {OUTCOME_LABELS[outcome]}
          </Badge>
        )}

        {!isResolved && (
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
            Not yet evaluated against visit criteria
          </span>
        )}
      </div>

      {/* Main Title & Disambiguation */}
      <div className="mt-4">
        <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">
          {candidate.name}
        </h3>
        {candidate.disambiguation && (
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {candidate.disambiguation}
          </p>
        )}
      </div>

      {/* Cultural Tags */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Cultural tags">
          {candidate.tags.map((tag) => (
            <span
              key={tag.id || tag.name}
              className="rounded-md bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Visit Summary Highlights preview (if not expanded) */}
      {!isExpanded && (
        <div className="mt-4 space-y-2">
          {supported_findings.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold select-none">✓</span>
              <span>{supported_findings[0]}</span>
            </div>
          )}
          {unresolved_gaps.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
              <span className="text-amber-600 dark:text-amber-400 font-bold select-none">?</span>
              <span>Needs checking: {unresolved_gaps[0]}</span>
            </div>
          )}
          {!isResolved && (
            <p className="text-xs text-stone-500 italic">
              This space was identified via cultural affinity signals, but verified operational documentation has not yet been cataloged for Ahmedabad.
            </p>
          )}
        </div>
      )}

      {/* Expand/Collapse Action */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
        <Button
          type="button"
          variant={isExpanded ? "outline" : "primary"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Hide visit plan ↑" : "View visit plan →"}
        </Button>
      </div>

      {/* Expandable Visit Plan Component */}
      {isExpanded && (
        <VisitPlanDetail plan={plan} className="mt-4" />
      )}
    </article>
  );
};
