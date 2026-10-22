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
      className={`rounded-3xl border border-[#e6e0d4] bg-white p-6 sm:p-8 shadow-xs transition-all hover:shadow-sm dark:border-[#323731] dark:bg-[#212520] ${className}`}
    >
      {/* Top Meta & Resolution Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ede8dc] dark:border-[#323731]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs uppercase tracking-wider text-[#c56f4d]">
            {candidate.entity_type}
            {candidate.subtype ? ` · ${candidate.subtype}` : ""}
          </span>
          <span className="text-[#dfd8c8] dark:text-[#323731]">|</span>
          <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
            isResolved
              ? "bg-[#eaf2ee] text-[#193a32] dark:bg-[#1d352b] dark:text-[#b8ded0]"
              : "bg-[#ede8dc] text-[#62685d] dark:bg-[#2e332c] dark:text-[#9da398]"
          }`}>
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
          <span className="rounded-full bg-[#f6f3eb] px-3 py-1 text-xs font-medium text-[#62685d] border border-[#e6e0d4] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#9da398]">
            Not yet evaluated against visit criteria
          </span>
        )}
      </div>

      {/* Main Title & Disambiguation */}
      <div className="mt-5">
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
          {candidate.name}
        </h3>
        {candidate.disambiguation && (
          <p className="mt-2 text-base text-[#62685d] leading-relaxed dark:text-[#9da398]">
            {candidate.disambiguation}
          </p>
        )}
      </div>

      {/* Cultural Tags from Qloo */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Cultural tags">
          {candidate.tags.map((tag) => (
            <span
              key={tag.id || tag.name}
              className="rounded-lg bg-[#ede8dc]/80 px-3 py-1 text-xs font-medium text-[#252923] dark:bg-[#2e332c] dark:text-[#e4ded0]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Visit Summary Highlights preview (if not expanded) */}
      {!isExpanded && (
        <div className="mt-6 space-y-2.5 pt-4 border-t border-[#ede8dc] dark:border-[#323731]">
          {supported_findings.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-[#252923] dark:text-[#e4ded0]">
              <span className="text-[#193a32] dark:text-[#a8d5c4] font-bold select-none">✓</span>
              <span><strong>Verified:</strong> {supported_findings[0]}</span>
            </div>
          )}
          {unresolved_gaps.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-[#8c5914] dark:text-[#f0d496]">
              <span className="font-bold select-none">?</span>
              <span><strong>Needs confirmation:</strong> {unresolved_gaps[0]}</span>
            </div>
          )}
          {!isResolved && (
            <p className="text-sm text-[#62685d] italic dark:text-[#9da398]">
              This space was identified via cultural affinity signals, but verified operational documentation has not yet been cataloged in our Ahmedabad pilot repository.
            </p>
          )}
        </div>
      )}

      {/* Expand/Collapse Action */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#ede8dc] dark:border-[#323731]">
        <Button
          type="button"
          variant={isExpanded ? "outline" : "primary"}
          size="md"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Hide visit plan ↑" : "View visit plan →"}
        </Button>
      </div>

      {/* Expandable Visit Plan Component */}
      {isExpanded && (
        <VisitPlanDetail plan={plan} className="mt-6" />
      )}
    </article>
  );
};
