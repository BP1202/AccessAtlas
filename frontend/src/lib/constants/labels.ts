import type {
  PossibilityOutcome,
  CandidateResolutionStatus,
  EvidenceAttribute,
  ClaimScope,
  RequirementOutcome,
} from "@/lib/api/types";

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

export const ATTRIBUTE_LABELS: Record<EvidenceAttribute, string> = {
  step_free_entrance: "Step-free entrance",
  internal_elevator: "Internal elevator",
  seating_available: "Seating available throughout",
  rest_areas: "Dedicated rest areas",
  quiet_space: "Quiet / sensory retreat space",
  audio_description: "Audio description services",
  assistive_listening: "Assistive listening devices",
  sensory_adapted_session: "Sensory-adapted sessions",
  service_animal_policy: "Service animal policy",
  companion_entry_policy: "Companion entry policy",
  reservation_required: "Advance reservation required",
  step_free_restroom: "Step-free accessible restroom",
  accessible_parking: "Designated accessible parking",
  contact_for_access_info: "Direct access contact available",
  wheelchair_access: "Wheelchair accessibility policy",
};

export interface OutcomeLabelMeta {
  label: string;
  badge: string;
  icon: string;
  description: string;
  colorClass: string;
}

export const REQUIREMENT_OUTCOME_LABELS: Record<RequirementOutcome, OutcomeLabelMeta> = {
  supported: {
    label: "Verified by published evidence",
    badge: "Supported",
    icon: "✓",
    description: "Published official documentation confirms this requirement is accommodated.",
    colorClass:
      "bg-[#eaf2ee] text-[#193a32] border-[#bcd6cb] dark:bg-[#1d352b] dark:text-[#b8ded0] dark:border-[#2f5545]",
  },
  contradicted: {
    label: "Published evidence indicates requirement cannot be met",
    badge: "Requirement Conflict",
    icon: "✕",
    description: "Published records indicate this requirement cannot currently be accommodated.",
    colorClass:
      "bg-[#fdf0ec] text-[#a84422] border-[#f3c2b2] dark:bg-[#3a1d17] dark:text-[#f6b4a1] dark:border-[#582a20]",
  },
  missing_evidence: {
    label: "Information unrecorded in published records",
    badge: "Needs Confirmation",
    icon: "?",
    description:
      "This detail is not documented in published records; direct confirmation with the venue is needed.",
    colorClass:
      "bg-[#fcf5e8] text-[#8c5914] border-[#eed49c] dark:bg-[#382b17] dark:text-[#f0d496] dark:border-[#544122]",
  },
  conflicting_evidence: {
    label: "Independent published sources disagree",
    badge: "Conflicting Evidence",
    icon: "⚠",
    description: "Multiple independent published sources report conflicting facts on this detail.",
    colorClass:
      "bg-[#fdf3e7] text-[#9c5112] border-[#f4cda5] dark:bg-[#392212] dark:text-[#f6b77d] dark:border-[#5c371d]",
  },
  expired_evidence: {
    label: "Published evidence has expired",
    badge: "Expired Evidence",
    icon: "⏱",
    description: "The published record has passed its stated validity date and requires re-confirmation.",
    colorClass:
      "bg-[#f8f4ec] text-[#745f41] border-[#dfd2be] dark:bg-[#2b251d] dark:text-[#d3c0a5] dark:border-[#43392c]",
  },
  insufficient_scope: {
    label: "Documented for venue overall, but unverified for this specific experience",
    badge: "Venue-Level Only",
    icon: "⬡",
    description:
      "Documentation exists at the general facility level, but does not confirm this specific tour or gallery.",
    colorClass:
      "bg-[#f4f2f7] text-[#553c7b] border-[#d8cce8] dark:bg-[#271d37] dark:text-[#cfbde8] dark:border-[#473461]",
  },
  unsupported_condition: {
    label: "Condition cannot be evaluated deterministically",
    badge: "Unsupported Condition",
    icon: "ℹ",
    description:
      "The requirement condition cannot be deterministically evaluated against the unstructured claim.",
    colorClass:
      "bg-[#ede8dc] text-[#62685d] border-[#dfd8c8] dark:bg-[#262a25] dark:text-[#9da398] dark:border-[#384941]",
  },
};

export const SCOPE_LABELS: Record<ClaimScope, { label: string; badge: string; description: string }> = {
  venue: {
    label: "Venue-wide facility record",
    badge: "Venue scope",
    description: "Pertains to the overall building or site grounds.",
  },
  experience: {
    label: "Specific experience / event record",
    badge: "Experience scope",
    description: "Pertains specifically to this designated exhibition, tour, or gallery.",
  },
};
