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
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          ✓ Supported
        </span>
      );
    case "contradicted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
          ✕ Contradicted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
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
    <div className={`space-y-6 pt-4 border-t border-stone-200 dark:border-stone-800 ${className}`}>
      {/* 1. Requirement-by-Requirement Evidence */}
      <div>
        <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
          Requirement-by-Requirement Assessment
        </h4>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Evaluated deterministically by the Possibility Engine against verified venue records.
        </p>

        {assessments.length === 0 ? (
          <div className="mt-3 rounded-lg bg-stone-50 p-4 text-xs text-stone-600 dark:bg-stone-800/40 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
            {resolution_status === "resolved"
              ? "No specific practical preferences were evaluated for this space."
              : "Independent venue documentation has not yet been reviewed for this space."}
          </div>
        ) : (
          <div className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900/50">
            {assessments.map((a, idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-stone-900 dark:text-stone-100 font-mono">
                      {a.attribute}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      ({a.priority})
                    </span>
                  </div>
                  <div>{getOutcomeBadge(a.outcome)}</div>
                </div>

                <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                  {a.explanation}
                </p>

                {/* Evidence references */}
                {a.evidence_references && a.evidence_references.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="font-medium">Evidence citations:</span>
                    {a.evidence_references.map((claim, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-1">
                        {claim.source.url ? (
                          <a
                            href={claim.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 underline hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            {claim.source.title || claim.source.source_type}
                          </a>
                        ) : (
                          <span>{claim.source.title || claim.source.source_type}</span>
                        )}
                        {claim.source.verified_at && (
                          <span className="text-stone-400">
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
        <div className="grid gap-4 sm:grid-cols-2">
          {supported_findings.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Documented Visit Highlights
              </span>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700 dark:text-stone-300" role="list">
                {supported_findings.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 select-none">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unresolved_gaps.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Details Requiring Confirmation
              </span>
              <ul className="mt-2 space-y-1.5 text-xs text-stone-700 dark:text-stone-300" role="list">
                {unresolved_gaps.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 select-none">?</span>
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
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Suggested Next Actions
          </span>
          <ul className="mt-2 space-y-1.5 text-xs text-stone-800 dark:text-stone-200" role="list">
            {suggested_next_actions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-stone-400 select-none">→</span>
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
        <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Official Sources & Records Reviewed
          </span>
          <ul className="mt-2 divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs" role="list">
            {provenance_sources.map((src, idx) => (
              <li key={idx} className="py-1.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {src.title || src.source_type}
                  </span>
                  <span className="rounded bg-stone-200/70 px-1.5 py-0.2 font-mono text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    {src.source_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400">
                  {src.verified_at && (
                    <span>Verified: {new Date(src.verified_at).toLocaleDateString()}</span>
                  )}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 underline hover:text-teal-800 dark:text-teal-400"
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
      <div className="rounded-xl border border-stone-200 bg-stone-100/50 p-4 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/30 dark:text-stone-400 space-y-1">
        <span className="font-semibold text-stone-800 dark:text-stone-200">
          How this discovery was prepared:
        </span>
        <p className="leading-relaxed">
          AccessAtlas discovered &ldquo;{candidate.name}&rdquo; via Qloo cultural taste mapping, resolved its official Ahmedabad venue identity, and evaluated its published documentation deterministically without inferring or fabricating unrecorded access policies.
        </p>
      </div>
    </div>
  );
};
