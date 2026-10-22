import React from "react";
import type {
  CandidateParticipationPlan,
  RequirementAssessment,
  RequirementOutcome,
} from "@/lib/api/types";
import { QuestionKit } from "./QuestionKit";

export interface VisitPlanDetailProps {
  plan: CandidateParticipationPlan;
  className?: string;
}

function getOutcomeBadge(outcome: RequirementOutcome) {
  switch (outcome) {
    case "supported":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf2ee] px-3 py-1 text-xs font-semibold text-[#193a32] border border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]">
          ✓ Supported
        </span>
      );
    case "contradicted":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0ec] px-3 py-1 text-xs font-semibold text-[#a84422] border border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]">
          ✕ Contradicted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcf5e8] px-3 py-1 text-xs font-semibold text-[#8c5914] border border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]">
          ? Needs confirmation
        </span>
      );
  }
}

export const VisitPlanDetail: React.FC<VisitPlanDetailProps> = ({
  plan,
  className = "",
}) => {
  const {
    candidate,
    resolution_status,
    possibility_assessment,
    supported_findings,
    unresolved_gaps,
    confirmation_questions,
    suggested_next_actions,
    provenance_sources,
  } = plan;

  const assessments: RequirementAssessment[] =
    possibility_assessment?.assessments || [];

  return (
    <div className={`space-y-8 pt-6 border-t border-[#ede8dc] dark:border-[#323731] ${className}`}>
      {/* 1. Requirement-by-Requirement Evidence */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-3">
          <h4 className="font-serif text-xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Requirement-by-Requirement Assessment
          </h4>
          <span className="text-xs text-[#62685d] dark:text-[#9da398]">
            Evaluated deterministically against verified records
          </span>
        </div>

        {assessments.length === 0 ? (
          <div className="rounded-2xl bg-[#f6f3eb] p-6 text-sm text-[#62685d] dark:bg-[#191c19] dark:text-[#9da398] border border-[#e6e0d4] dark:border-[#323731]">
            {resolution_status === "resolved"
              ? "No specific practical preferences were evaluated for this space."
              : "Independent venue documentation has not yet been reviewed for this space in the Ahmedabad pilot."}
          </div>
        ) : (
          <div className="divide-y divide-[#ede8dc] rounded-2xl border border-[#e6e0d4] bg-[#faf8f5] dark:divide-[#323731] dark:border-[#323731] dark:bg-[#191c19]">
            {assessments.map((a, idx) => (
              <div key={idx} className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif text-base font-semibold text-[#252923] dark:text-[#f4f1ea] capitalize">
                      {a.attribute.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#ede8dc] dark:bg-[#262a25] text-[#62685d] dark:text-[#9da398]">
                      {a.attribute}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
                      ({a.priority})
                    </span>
                  </div>
                  <div>{getOutcomeBadge(a.outcome)}</div>
                </div>

                <p className="text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
                  {a.explanation}
                </p>

                {/* Evidence citations */}
                {a.evidence_references && a.evidence_references.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#62685d] dark:text-[#9da398]">
                    <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">Evidence citations:</span>
                    {a.evidence_references.map((claim, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-1.5">
                        {claim.source.url ? (
                          <a
                            href={claim.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#193a32] underline hover:text-[#c56f4d] font-medium dark:text-[#a8d5c4] inline-flex items-center gap-0.5"
                          >
                            <span>{claim.source.title || claim.source.source_type}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <span>{claim.source.title || claim.source.source_type}</span>
                        )}
                        {claim.source.verified_at && (
                          <span className="text-[#9da398]">
                            (verified {new Date(claim.source.verified_at).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Key Findings & Unresolved Details */}
      {(supported_findings.length > 0 || unresolved_gaps.length > 0) && (
        <div className="grid gap-6 sm:grid-cols-2">
          {supported_findings.length > 0 && (
            <div className="rounded-2xl border border-[#bcd6cb] bg-[#eaf2ee]/40 p-6 dark:border-[#2f5545] dark:bg-[#1d352b]/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
                Documented Visit Highlights
              </span>
              <ul className="mt-3 space-y-2 text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
                {supported_findings.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#193a32] dark:text-[#a8d5c4] font-bold select-none">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unresolved_gaps.length > 0 && (
            <div className="rounded-2xl border border-[#eed49c] bg-[#fcf5e8]/50 p-6 dark:border-[#544122] dark:bg-[#382b17]/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">
                Details Requiring Confirmation
              </span>
              <ul className="mt-3 space-y-2 text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
                {unresolved_gaps.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8c5914] dark:text-[#f0d496] font-bold select-none">?</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Suggested Next Actions */}
      {suggested_next_actions.length > 0 && (
        <div className="rounded-2xl border border-[#e6e0d4] bg-white p-6 shadow-xs dark:border-[#323731] dark:bg-[#212520]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
            Suggested Next Actions
          </span>
          <ul className="mt-3 space-y-2 text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
            {suggested_next_actions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-[#c56f4d] font-bold select-none">→</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Ask the Venue Question Kit */}
      <QuestionKit
        venueName={candidate.name}
        questions={confirmation_questions}
      />

      {/* 5. Provenance Sources */}
      {provenance_sources && provenance_sources.length > 0 && (
        <div className="rounded-2xl border border-[#e6e0d4] bg-[#f6f3eb] p-6 dark:border-[#323731] dark:bg-[#191c19]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
            Official Sources & Records Reviewed
          </span>
          <ul className="mt-3 divide-y divide-[#ede8dc] dark:divide-[#323731] text-xs" role="list">
            {provenance_sources.map((src, idx) => (
              <li key={idx} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#252923] dark:text-[#f4f1ea]">
                    {src.title || src.source_type}
                  </span>
                  <span className="rounded-md bg-[#ede8dc] px-2 py-0.5 font-mono text-[11px] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]">
                    {src.source_type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#62685d] dark:text-[#9da398]">
                  {src.verified_at && (
                    <span>Verified: {new Date(src.verified_at).toLocaleDateString()}</span>
                  )}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#193a32] underline hover:text-[#c56f4d] font-medium dark:text-[#a8d5c4]"
                    >
                      Official Link ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Transparency Panel */}
      <div className="rounded-2xl border border-[#dfd8c8] bg-[#ede8dc]/50 p-6 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#212520]/50 dark:text-[#9da398] space-y-1.5">
        <span className="font-semibold text-sm text-[#252923] dark:text-[#f4f1ea]">
          How this discovery was prepared:
        </span>
        <p className="leading-relaxed">
          AccessAtlas discovered &ldquo;{candidate.name}&rdquo; via Qloo cultural taste mapping, resolved its official Ahmedabad venue identity, and evaluated its published documentation deterministically without inferring or fabricating unrecorded access policies.
        </p>
      </div>
    </div>
  );
};
