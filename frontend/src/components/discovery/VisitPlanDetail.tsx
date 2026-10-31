import React from "react";
import type {
  CandidateParticipationPlan,
  RequirementAssessment,
  RequirementOutcome,
  ThreadConnectionType,
} from "@/lib/api/types";
import {
  OUTCOME_LABELS,
  OUTCOME_DESCRIPTIONS,
  ATTRIBUTE_LABELS,
  REQUIREMENT_OUTCOME_LABELS,
  SCOPE_LABELS,
  RESOLUTION_LABELS,
  DISCLAIMER_NOTE,
} from "@/lib/constants/labels";
import { QuestionKit } from "./QuestionKit";

export interface VisitPlanDetailProps {
  plan: CandidateParticipationPlan;
  className?: string;
}

function getThreadConnectionBadge(connectionType: ThreadConnectionType) {
  switch (connectionType) {
    case "shared_tag":
      return {
        label: "Cultural Tag Overlap",
        colorClass:
          "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
      };
    case "shared_subtype":
      return {
        label: "Shared Space Subtype",
        colorClass:
          "bg-[#f6f3eb] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
      };
    case "explicit_interest_match":
      return {
        label: "Direct Keyword Match",
        colorClass:
          "bg-[#ede8dc] text-[#252923] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#f4f1ea] dark:border-[#384941]",
      };
    case "discovered_candidate":
    default:
      return {
        label: "Qloo Cultural Affinity",
        colorClass:
          "bg-[#fdf0ec] text-[#c56f4d] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
      };
  }
}

export function renderOutcomeBadge(outcome: RequirementOutcome) {
  const meta = REQUIREMENT_OUTCOME_LABELS[outcome];
  if (!meta) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#ede8dc] text-[#62685d] border border-[#dfd8c8]">
        ? Needs confirmation
      </span>
    );
  }

  // To preserve exact existing test string expectations:
  let displayText = `${meta.icon} ${meta.badge}`;
  if (outcome === "missing_evidence") {
    displayText = "? Needs confirmation";
  } else if (outcome === "contradicted") {
    displayText = "✕ Contradicted";
  } else if (outcome === "supported") {
    displayText = "✓ Supported";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${meta.colorClass}`}
    >
      <span>{displayText}</span>
    </span>
  );
}

export type NextActionCategory =
  | "reconsider_conflict"
  | "confirm_venue"
  | "booking_guidance"
  | "review_source"
  | "explore_alternative"
  | "operational_advisory"
  | "general";

export interface CategorizedAction {
  category: NextActionCategory;
  badgeLabel: string;
  badgeColorClass: string;
  icon: string;
  text: string;
}

export function categorizeNextAction(action: string): CategorizedAction {
  const lower = action.toLowerCase();
  if (
    lower.includes("conflict") ||
    lower.includes("contradicted") ||
    lower.includes("incompatible")
  ) {
    return {
      category: "reconsider_conflict",
      badgeLabel: "Reconsider Essential Conflict",
      badgeColorClass:
        "bg-[#fdf0ec] text-[#a84422] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
      icon: "✕",
      text: action,
    };
  }
  if (
    lower.includes("alternative") ||
    lower.includes("another supported") ||
    lower.includes("consider alternative")
  ) {
    return {
      category: "explore_alternative",
      badgeLabel: "Explore Another Supported Candidate",
      badgeColorClass:
        "bg-[#f6f3eb] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
      icon: "✦",
      text: action,
    };
  }
  if (lower.includes("venue advisory") || lower.includes("operational policy")) {
    return {
      category: "operational_advisory",
      badgeLabel: "Operational Advisory",
      badgeColorClass:
        "bg-[#fdf0ec] text-[#c56f4d] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
      icon: "ℹ",
      text: action,
    };
  }
  if (
    lower.includes("booking") ||
    lower.includes("reservation") ||
    lower.includes("schedule and booking")
  ) {
    return {
      category: "booking_guidance",
      badgeLabel: "Review Booking Guidance",
      badgeColorClass:
        "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
      icon: "📅",
      text: action,
    };
  }
  if (
    lower.includes("contact venue") ||
    lower.includes("direct confirmation") ||
    lower.includes("needs confirmation") ||
    lower.includes("inquire")
  ) {
    return {
      category: "confirm_venue",
      badgeLabel: "Confirm Directly with Venue",
      badgeColorClass:
        "bg-[#fcf5e8] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
      icon: "?",
      text: action,
    };
  }
  if (
    lower.includes("consult official") ||
    lower.includes("official venue sources") ||
    lower.includes("source") ||
    lower.includes("review documentation")
  ) {
    return {
      category: "review_source",
      badgeLabel: "Review Source",
      badgeColorClass:
        "bg-[#ede8dc] text-[#252923] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#f4f1ea] dark:border-[#384941]",
      icon: "📄",
      text: action,
    };
  }
  return {
    category: "general",
    badgeLabel: "Action Note",
    badgeColorClass:
      "bg-[#ede8dc] text-[#62685d] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#9da398] dark:border-[#384941]",
    icon: "→",
    text: action,
  };
}

export const VisitPlanDetail: React.FC<VisitPlanDetailProps> = ({
  plan,
  className = "",
}) => {
  const {
    candidate,
    resolution_status,
    possibility_assessment,
    supported_findings = [],
    unresolved_gaps = [],
    confirmation_questions = [],
    suggested_next_actions = [],
    provenance_sources = [],
    cultural_thread,
  } = plan;

  const isResolved = resolution_status === "resolved";
  const outcome = possibility_assessment?.aggregate_outcome;
  const assessments: RequirementAssessment[] =
    possibility_assessment?.assessments || [];

  // Identify conflict assessments for dedicated conflict alert section
  const conflictAssessments = assessments.filter(
    (a) => a.outcome === "contradicted" || a.outcome === "conflicting_evidence"
  );
  const hasMandatoryConflict = conflictAssessments.some(
    (a) => a.priority === "mandatory"
  );

  return (
    <div
      data-testid={`visit-plan-detail-${candidate.entity_id}`}
      className={`space-y-8 pt-6 border-t border-[#ede8dc] dark:border-[#323731] ${className}`}
    >
      {/* ====================================================================
          1. EXPERIENCE IDENTITY & CONTEXT
      ==================================================================== */}
      <section
        aria-label="Experience Identity"
        data-testid="visit-plan-identity"
        className="rounded-3xl border border-[#e6e0d4] bg-[#faf8f5] p-6 sm:p-8 dark:border-[#323731] dark:bg-[#191c19]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ede8dc] pb-4 dark:border-[#323731]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#c56f4d]">
              {candidate.entity_type}
              {candidate.subtype ? ` · ${candidate.subtype}` : ""}
            </span>
            <span className="text-[#dfd8c8] dark:text-[#323731]" aria-hidden="true">|</span>
            <span className="text-xs font-medium text-[#62685d] dark:text-[#9da398]">
              Ahmedabad Pilot Collection
            </span>
          </div>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-medium border ${
              isResolved
                ? "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]"
                : "bg-[#ede8dc] text-[#62685d] border-[#dfd8c8] dark:bg-[#2e332c] dark:text-[#9da398] dark:border-[#384941]"
            }`}
          >
            {RESOLUTION_LABELS[resolution_status]}
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#62685d] dark:text-[#9da398]">
            Outing Participation Plan
          </span>
          <h4 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
            {candidate.name}
          </h4>
          {candidate.disambiguation && (
            <p className="mt-2 text-sm sm:text-base text-[#62685d] leading-relaxed dark:text-[#9da398]">
              {candidate.disambiguation}
            </p>
          )}
        </div>
      </section>

      {/* ====================================================================
          2. CULTURAL RELEVANCE & PROVENANCE
      ==================================================================== */}
      <section
        aria-label="Cultural Relevance"
        data-testid="visit-plan-cultural-relevance"
        className="rounded-3xl border border-[#e6e0d4] bg-white p-6 sm:p-8 shadow-2xs dark:border-[#323731] dark:bg-[#212520]"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-[#ede8dc] dark:border-[#323731]">
          <span className="text-base select-none" aria-hidden="true">🧵</span>
          <h5 className="font-serif text-lg font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Cultural Relevance &amp; Discovery Rationale
          </h5>
        </div>

        {cultural_thread ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs">
                <span className="text-[#62685d] dark:text-[#9da398]">Connected from your selection: </span>
                <strong className="text-[#252923] dark:text-[#f4f1ea]">
                  &ldquo;{cultural_thread.starting_interest}&rdquo;
                </strong>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  getThreadConnectionBadge(cultural_thread.connection.connection_type).colorClass
                }`}
              >
                {getThreadConnectionBadge(cultural_thread.connection.connection_type).label}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
              {cultural_thread.connection.rationale}
            </p>

            {cultural_thread.connection.shared_descriptors.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-mono text-[#62685d] dark:text-[#9da398]">
                  Shared cultural descriptors:
                </span>
                {cultural_thread.connection.shared_descriptors.map((desc) => (
                  <span
                    key={desc}
                    className="rounded bg-[#ede8dc] px-2.5 py-0.5 text-xs font-medium text-[#252923] dark:bg-[#2e332c] dark:text-[#e4ded0]"
                  >
                    {desc}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 text-[11px] font-mono text-[#62685d] dark:text-[#9da398]">
              <strong>Provenance signal:</strong> {cultural_thread.provenance}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-[#62685d] leading-relaxed dark:text-[#9da398]">
            <p>
              Identified through aggregate cultural taste mapping from Qloo for Ahmedabad cultural experiences.
              AccessAtlas preserves this distinction without inventing individual affinity percentages.
            </p>
          </div>
        )}
      </section>

      {/* ====================================================================
          3. OVERALL PARTICIPATION ASSESSMENT
      ==================================================================== */}
      <section
        aria-label="Overall Participation Assessment"
        data-testid="visit-plan-overall-assessment"
        className="rounded-3xl border border-[#e6e0d4] bg-[#faf8f5] p-6 sm:p-8 dark:border-[#323731] dark:bg-[#191c19]"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
          Deterministic Evaluation Outcome
        </span>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {isResolved && outcome ? (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border ${
                outcome === "VERIFIED_FIT"
                  ? "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]"
                  : outcome === "REQUIREMENT_CONFLICT"
                  ? "bg-[#fdf0ec] text-[#a84422] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]"
                  : "bg-[#fcf5e8] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]"
              }`}
            >
              <span>{outcome === "VERIFIED_FIT" ? "✓" : outcome === "REQUIREMENT_CONFLICT" ? "✕" : "?"}</span>
              <span>{OUTCOME_LABELS[outcome]}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border bg-[#ede8dc] text-[#62685d] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#9da398] dark:border-[#384941]">
              <span>ℹ</span>
              <span>Not yet evaluated against visit criteria</span>
            </span>
          )}
        </div>

        {/* Visitor-facing description */}
        <p className="mt-3 text-sm text-[#252923] leading-relaxed dark:text-[#e4ded0]">
          {isResolved && outcome
            ? OUTCOME_DESCRIPTIONS[outcome]
            : "This space was identified via cultural affinity signals, but verified operational documentation has not yet been cataloged in our Ahmedabad pilot repository."}
        </p>

        {/* Possibility Assessment Summary Note */}
        {possibility_assessment?.summary && (
          <div className="mt-4 rounded-xl border border-[#ede8dc] bg-white p-4 text-xs text-[#252923] dark:border-[#323731] dark:bg-[#212520] dark:text-[#e4ded0]">
            <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">Evaluation summary: </span>
            <span>{possibility_assessment.summary}</span>
          </div>
        )}

        {/* Scope caveat note: Never present verified fit as universal certification */}
        <p className="mt-3 text-xs text-[#62685d] italic dark:text-[#9da398]">
          {isResolved && outcome === "VERIFIED_FIT"
            ? "Scope notice: This assessment is strictly based on published records matching your evaluated requirements. It is not an accessibility certification or guarantee of universal accommodation."
            : "Meeting stated requirements is evaluated deterministically against independent published documentation, not an on-site audit."}
        </p>
      </section>

      {/* ====================================================================
          4. CONFLICTS (WHEN PRESENT)
      ==================================================================== */}
      {conflictAssessments.length > 0 && (
        <section
          aria-label="Requirement Conflicts"
          data-testid="visit-plan-conflicts"
          className="rounded-3xl border border-[#f3c2b2] bg-[#fdf0ec]/60 p-6 sm:p-8 dark:border-[#582a20] dark:bg-[#3a1d17]/40"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#f3c2b2] dark:border-[#582a20]">
            <span className="text-base select-none" aria-hidden="true">✕</span>
            <h5 className="font-serif text-lg font-semibold text-[#a84422] dark:text-[#f6b4a1]">
              Documented Requirement Conflicts &amp; Disagreements
            </h5>
          </div>

          {/* Essential requirement conflict prominent alert */}
          {hasMandatoryConflict && (
            <div
              data-testid="essential-conflict-banner"
              className="mt-4 rounded-2xl border-2 border-[#a84422] bg-[#fdf0ec] p-5 dark:border-[#f6b4a1] dark:bg-[#3a1d17] space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#a84422] dark:text-[#f6b4a1]" aria-hidden="true">⚠️</span>
                <h6 className="font-serif text-base font-bold text-[#a84422] dark:text-[#f6b4a1]">
                  Essential Requirement Conflict
                </h6>
              </div>
              <p className="text-xs sm:text-sm text-[#252923] dark:text-[#e4ded0] leading-relaxed">
                Published documentation indicates that one or more of your <strong>mandatory (essential) requirements</strong> cannot be accommodated at this venue.
              </p>
              <p className="text-xs text-[#a84422] dark:text-[#f6b4a1] font-medium leading-relaxed">
                AccessAtlas does not offer unverified workarounds or silently downgrade essential requirements. We recommend reconsidering this outing or exploring another supported candidate that satisfies your essential participation needs.
              </p>
            </div>
          )}

          <div className="mt-4 divide-y divide-[#f3c2b2] dark:divide-[#582a20]">
            {conflictAssessments.map((a, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-base font-semibold text-[#252923] dark:text-[#f4f1ea]">
                      {ATTRIBUTE_LABELS[a.attribute] || a.attribute.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#ede8dc] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]">
                      {a.attribute}
                    </span>
                    <span className="font-mono text-xs uppercase text-[#a84422] dark:text-[#f6b4a1]">
                      ({a.priority})
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#f6f3eb] text-[#62685d] border border-[#e6e0d4] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#9da398]">
                      {SCOPE_LABELS[a.scope]?.badge || a.scope}
                    </span>
                  </div>
                  <div>{renderOutcomeBadge(a.outcome)}</div>
                </div>

                <p className="text-sm text-[#252923] leading-relaxed dark:text-[#e4ded0]">
                  {a.explanation}
                </p>

                {a.evidence_references && a.evidence_references.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#62685d] dark:text-[#9da398] pt-1">
                    <span className="font-semibold text-[#a84422] dark:text-[#f6b4a1]">Documented citation:</span>
                    {a.evidence_references.map((claim, cIdx) => (
                      <span key={cIdx} className="inline-flex items-center gap-1">
                        {claim.source.url ? (
                          <a
                            href={claim.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#a84422] font-medium"
                          >
                            {claim.source.title || claim.source.source_type} ↗
                          </a>
                        ) : (
                          <span>{claim.source.title || claim.source.source_type}</span>
                        )}
                        {claim.source.verified_at && (
                          <span>(verified {new Date(claim.source.verified_at).toLocaleDateString()})</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          5. REQUIREMENT-BY-REQUIREMENT ASSESSMENT
      ==================================================================== */}
      <section
        aria-label="Requirement-by-Requirement Evidence"
        data-testid="visit-plan-assessments"
        className="rounded-3xl border border-[#e6e0d4] bg-white p-6 sm:p-8 shadow-2xs dark:border-[#323731] dark:bg-[#212520]"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-4 border-b border-[#ede8dc] dark:border-[#323731]">
          <h4 className="font-serif text-xl sm:text-2xl font-semibold text-[#252923] dark:text-[#f4f1ea]">
            Requirement-by-Requirement Assessment
          </h4>
          <span className="text-xs text-[#62685d] dark:text-[#9da398]">
            Evaluated deterministically against verified records
          </span>
        </div>

        {assessments.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#f6f3eb] p-6 text-sm text-[#62685d] dark:bg-[#191c19] dark:text-[#9da398] border border-[#e6e0d4] dark:border-[#323731]">
            {isResolved
              ? "No specific practical preferences were evaluated for this space."
              : "Independent venue documentation has not yet been reviewed for this space in the Ahmedabad pilot."}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-[#ede8dc] dark:divide-[#323731]">
            {assessments.map((a, idx) => {
              const scopeMeta = SCOPE_LABELS[a.scope];
              const attrLabel = ATTRIBUTE_LABELS[a.attribute] || a.attribute.replace(/_/g, " ");

              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-semibold text-[#252923] dark:text-[#f4f1ea]">
                        {attrLabel}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#ede8dc] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]">
                        {a.attribute}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
                        ({a.priority})
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded bg-[#f6f3eb] text-[#62685d] border border-[#e6e0d4] dark:bg-[#191c19] dark:border-[#323731] dark:text-[#9da398]"
                        title={scopeMeta?.description}
                      >
                        {scopeMeta?.badge || a.scope}
                      </span>
                    </div>
                    <div>{renderOutcomeBadge(a.outcome)}</div>
                  </div>

                  <p className="text-sm leading-relaxed text-[#252923] dark:text-[#e4ded0]">
                    {a.explanation}
                  </p>

                  {/* Evidence citations */}
                  {a.evidence_references && a.evidence_references.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#62685d] dark:text-[#9da398] pt-1">
                      <span className="font-semibold text-[#193a32] dark:text-[#a8d5c4]">
                        Evidence citations:
                      </span>
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

                  {/* Confirmation need note if present */}
                  {a.confirmation_need && (
                    <div className="rounded-lg bg-[#fcf5e8] p-2.5 text-xs text-[#8c5914] border border-[#eed49c] dark:bg-[#382b17]/50 dark:text-[#f0d496] dark:border-[#544122]">
                      <strong>Confirmation needed:</strong> {a.confirmation_need}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ====================================================================
          6. DOCUMENTED FINDINGS & UNRESOLVED GAPS (DUAL COLUMN)
      ==================================================================== */}
      {(supported_findings.length > 0 || unresolved_gaps.length > 0) && (
        <div className="grid gap-6 sm:grid-cols-2">
          {supported_findings.length > 0 && (
            <div
              data-testid="visit-plan-documented-highlights"
              className="rounded-3xl border border-[#bcd6cb] bg-[#eaf2ee]/50 p-6 dark:border-[#2f5545] dark:bg-[#1d352b]/40"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#193a32] dark:text-[#a8d5c4]">
                  Documented Visit Highlights
                </span>
              </div>
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
            <div
              data-testid="visit-plan-unresolved-gaps"
              className="rounded-3xl border border-[#eed49c] bg-[#fcf5e8]/60 p-6 dark:border-[#544122] dark:bg-[#382b17]/40"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8c5914] dark:text-[#f0d496]">
                  Details Requiring Confirmation
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
                {unresolved_gaps.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8c5914] dark:text-[#f0d496] font-bold select-none">?</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-[#62685d] italic dark:text-[#9da398]">
                Absence in published records does not mean an accommodation is impossible, but verification is required before travel.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          7. SUGGESTED NEXT ACTIONS
      ==================================================================== */}
      {suggested_next_actions.length > 0 && (
        <section
          aria-label="Suggested Next Actions"
          data-testid="visit-plan-next-actions"
          className="rounded-3xl border border-[#e6e0d4] bg-white p-6 sm:p-8 shadow-2xs dark:border-[#323731] dark:bg-[#212520]"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-4 border-b border-[#ede8dc] dark:border-[#323731]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              Suggested Next Actions
            </span>
            <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
              Grounded in current evaluation and published findings
            </span>
          </div>

          <ul className="mt-4 space-y-3 text-sm text-[#252923] dark:text-[#e4ded0]" role="list">
            {suggested_next_actions.map((act, idx) => {
              const cat = categorizeNextAction(act);
              return (
                <li
                  key={idx}
                  data-testid={`next-action-item-${idx}`}
                  className="rounded-2xl border border-[#ede8dc] bg-[#faf8f5] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 dark:border-[#323731] dark:bg-[#191c19]"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-bold select-none text-base mt-0.5" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                  <span
                    className={`self-start sm:self-auto shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cat.badgeColorClass}`}
                  >
                    {cat.badgeLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ====================================================================
          8. CONFIRMATION QUESTION KIT
      ==================================================================== */}
      <QuestionKit
        venueName={candidate.name}
        questions={confirmation_questions}
        assessments={assessments}
        hasUnresolvedEvidence={
          unresolved_gaps.length > 0 ||
          assessments.some((a) => a.outcome !== "supported")
        }
      />

      {/* ====================================================================
          9. OFFICIAL SOURCES & REVIEW INFORMATION
      ==================================================================== */}
      {provenance_sources && provenance_sources.length > 0 && (
        <section
          aria-label="Official Sources & Records"
          data-testid="visit-plan-provenance-sources"
          className="rounded-3xl border border-[#e6e0d4] bg-[#f6f3eb] p-6 sm:p-8 dark:border-[#323731] dark:bg-[#191c19]"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-3 border-b border-[#ede8dc] dark:border-[#323731]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#62685d] dark:text-[#9da398]">
              Official Sources &amp; Records Reviewed
            </span>
            <span className="text-[11px] text-[#62685d] dark:text-[#9da398]">
              Independently sourced published documentation
            </span>
          </div>

          {/* Source-backed research vs. on-site inspection notice */}
          <p className="mt-3 text-xs leading-relaxed text-[#62685d] dark:text-[#9da398]">
            Source-backed research is based on published institutional documentation, conservation reports, and official portals. It is not equivalent to an on-site accessibility inspection or real-time booking confirmation.
          </p>

          <ul className="mt-4 divide-y divide-[#ede8dc] dark:divide-[#323731] text-xs" role="list">
            {provenance_sources.map((src, idx) => {
              const isBookingOrGuidelines = Boolean(
                src.url &&
                  (src.url.includes("tour-guidelines") ||
                    src.url.includes("booking") ||
                    src.url.includes("reservation") ||
                    (src.title && src.title.toLowerCase().includes("guidelines")) ||
                    (src.title && src.title.toLowerCase().includes("booking")))
              );

              return (
                <li key={idx} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-[#252923] dark:text-[#f4f1ea]">
                      {src.title || src.source_type}
                    </span>
                    <span className="rounded-md bg-[#ede8dc] px-2 py-0.5 font-mono text-[11px] text-[#62685d] dark:bg-[#262a25] dark:text-[#9da398]">
                      {src.source_type}
                    </span>
                    {isBookingOrGuidelines && (
                      <span className="rounded-md bg-[#eaf2ee] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#193a32] border border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]">
                        Booking &amp; Guidelines Portal
                      </span>
                    )}
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
                        className="text-[#193a32] underline hover:text-[#c56f4d] font-semibold dark:text-[#a8d5c4] inline-flex items-center gap-0.5"
                      >
                        <span>{isBookingOrGuidelines ? "Open Booking & Guidelines" : "Official Link"}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Contact and booking honesty callout */}
          <div
            data-testid="contact-booking-honesty"
            className="mt-4 rounded-xl border border-[#dfd8c8] bg-white p-4 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#212520] dark:text-[#9da398] space-y-1"
          >
            <span className="font-semibold text-[#252923] dark:text-[#f4f1ea]">
              Direct Contact &amp; Booking Notice:
            </span>
            <p className="leading-relaxed">
              No direct phone numbers, personal email addresses, or automated booking forms are cataloged in repository records. AccessAtlas does not claim to have contacted the venue or conduct autonomous booking or outreach. Visitors should consult the official links above directly.
            </p>
          </div>
        </section>
      )}

      {/* ====================================================================
          10. INTEGRITY & METHODOLOGY PANEL
      ==================================================================== */}
      <div
        data-testid="visit-plan-transparency-panel"
        className="rounded-3xl border border-[#dfd8c8] bg-[#ede8dc]/50 p-6 text-xs text-[#62685d] dark:border-[#323731] dark:bg-[#212520]/50 dark:text-[#9da398] space-y-2"
      >
        <span className="font-semibold text-sm text-[#252923] dark:text-[#f4f1ea]">
          How this discovery was prepared:
        </span>
        <p className="leading-relaxed">
          AccessAtlas discovered &ldquo;{candidate.name}&rdquo; via Qloo cultural taste mapping, resolved its official Ahmedabad venue identity, and evaluated its published documentation deterministically without inferring or fabricating unrecorded access policies.
        </p>
        <p className="leading-relaxed font-medium">
          <strong>Integrity Note:</strong> {DISCLAIMER_NOTE}
        </p>
      </div>
    </div>
  );
};
