import type { PossibilityOutcome, CandidateResolutionStatus } from "@/lib/api/types";

/**
 * Visitor-facing translations for internal evaluation states.
 *
 * Ground rules:
 * - Never change the underlying API outcome values.
 * - Never present an unresolved candidate as VERIFIED_FIT.
 * - Meeting stated requirements is not a guarantee of universal accessibility or current availability.
 */

export const OUTCOME_LABELS: Record<PossibilityOutcome, string> = {
  VERIFIED_FIT: "Meets your stated requirements",
  NEEDS_CONFIRMATION: "Some details need checking",
  REQUIREMENT_CONFLICT: "A stated requirement may not be met",
};

export const OUTCOME_SHORT_LABELS: Record<PossibilityOutcome, string> = {
  VERIFIED_FIT: "Verified match",
  NEEDS_CONFIRMATION: "Needs checking",
  REQUIREMENT_CONFLICT: "Requirement conflict",
};

export const OUTCOME_DESCRIPTIONS: Record<PossibilityOutcome, string> = {
  VERIFIED_FIT:
    "Available published evidence from official venue records confirms this detail.",
  NEEDS_CONFIRMATION:
    "This detail is unrecorded, ambiguous, or needs direct checking with the venue.",
  REQUIREMENT_CONFLICT:
    "Published information indicates this requirement cannot currently be accommodated.",
};

export const RESOLUTION_LABELS: Record<CandidateResolutionStatus, string> = {
  resolved: "Visit information reviewed",
  unmapped: "Visit information not yet reviewed",
  missing_evidence: "Visit information not yet reviewed",
};

export const PROVENANCE_LABEL = "Where this information comes from";

export const DISCLAIMER_NOTE =
  "Meeting your stated requirements is based on independently sourced published evidence, not a guarantee of universal accessibility or live ticket availability.";
