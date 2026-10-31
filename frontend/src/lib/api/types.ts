/**
 * TypeScript domain contracts matching the AccessAtlas backend Discovery API.
 *
 * Source of truth:
 * - backend/app/api/v1/schemas.py
 * - backend/app/agent/models.py
 * - backend/app/possibility/models.py
 * - backend/app/evidence/models.py
 * - docs/API.md
 *
 * Must NOT invent confidence ratings, accessibility scores, or frontend-calculated
 * suitability outcomes.
 */

export type EvidenceAttribute =
  | "step_free_entrance"
  | "internal_elevator"
  | "seating_available"
  | "rest_areas"
  | "quiet_space"
  | "audio_description"
  | "assistive_listening"
  | "sensory_adapted_session"
  | "service_animal_policy"
  | "companion_entry_policy"
  | "reservation_required"
  | "step_free_restroom"
  | "accessible_parking"
  | "contact_for_access_info"
  | "wheelchair_access";

export type ClaimScope = "venue" | "experience";

export type RequirementPriority = "mandatory" | "optional";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "is_present";

export type RequirementOutcome =
  | "supported"
  | "contradicted"
  | "missing_evidence"
  | "conflicting_evidence"
  | "expired_evidence"
  | "insufficient_scope"
  | "unsupported_condition";

export type PossibilityOutcome =
  | "VERIFIED_FIT"
  | "NEEDS_CONFIRMATION"
  | "REQUIREMENT_CONFLICT";

export type CandidateResolutionStatus =
  | "resolved"
  | "unmapped"
  | "missing_evidence";

export interface ParticipationRequirement {
  requirement_id: string;
  attribute: EvidenceAttribute;
  scope?: ClaimScope;
  priority?: RequirementPriority;
  operator?: ConditionOperator;
  expected_value?: boolean | string | number;
  description?: string | null;
}

export interface EvidenceSource {
  source_type: string;
  url?: string | null;
  title?: string | null;
  verified_at?: string | null;
}

export interface EvidenceClaim {
  attribute: EvidenceAttribute;
  scope: ClaimScope;
  value: unknown;
  details?: string | null;
  source: EvidenceSource;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface RequirementAssessment {
  requirement_id: string;
  attribute: EvidenceAttribute;
  priority: RequirementPriority;
  scope: ClaimScope;
  outcome: RequirementOutcome;
  explanation: string;
  evidence_references?: EvidenceClaim[];
  confirmation_need?: string | null;
}

export interface PossibilityAssessment {
  venue_id: string;
  experience_id?: string | null;
  aggregate_outcome: PossibilityOutcome;
  evaluation_time: string;
  assessments: RequirementAssessment[];
  summary: string;
}

export interface QlooEntityTag {
  id: string;
  name: string;
  tag_type?: string | null;
}

export interface QlooEntity {
  entity_id: string;
  name: string;
  entity_type: string;
  subtype?: string | null;
  popularity?: number | null;
  disambiguation?: string | null;
  tags?: QlooEntityTag[];
  properties?: Record<string, unknown>;
}

export type ThreadSourceType =
  | "explicit_visitor_selection"
  | "actual_qloo_response"
  | "deterministic_application_mapping";

export type ThreadConnectionType =
  | "explicit_interest_match"
  | "shared_tag"
  | "shared_subtype"
  | "discovered_candidate";

export interface CulturalThreadAnchor {
  interest: string;
  source_type: ThreadSourceType;
  resolved_entity_id?: string | null;
  resolved_entity_name?: string | null;
  matched_tag?: string | null;
}

export interface CulturalThreadConnection {
  connection_type: ThreadConnectionType;
  source_type: ThreadSourceType;
  shared_descriptors: string[];
  rationale: string;
}

export interface CulturalThreadCandidate {
  entity_id: string;
  name: string;
  entity_type: string;
  subtype?: string | null;
  popularity?: number | null;
  mapping_status: CandidateResolutionStatus;
  has_reviewed_evidence: boolean;
  is_evaluation_eligible: boolean;
  venue_id?: string | null;
}

export interface CulturalThread {
  thread_id: string;
  starting_interest: string;
  anchor: CulturalThreadAnchor;
  candidate: CulturalThreadCandidate;
  connection: CulturalThreadConnection;
  provenance: string;
}

export interface CandidateParticipationPlan {
  candidate: QlooEntity;
  resolution_status: CandidateResolutionStatus;
  venue_id?: string | null;
  experience_id?: string | null;
  possibility_assessment?: PossibilityAssessment | null;
  supported_findings: string[];
  unresolved_gaps: string[];
  confirmation_questions: string[];
  suggested_next_actions: string[];
  provenance_sources: EvidenceSource[];
  cultural_thread?: CulturalThread | null;
}

export interface DiscoverRequest {
  city?: string;
  cultural_interests: string[];
  requirements?: ParticipationRequirement[];
  max_candidates?: number;
  evaluation_time?: string | null;
}

export interface DiscoverResponse {
  city: string;
  cultural_interests: string[];
  total_candidates_found: number;
  candidates_evaluated: number;
  plans: CandidateParticipationPlan[];
  cultural_threads?: CulturalThread[];
  discovery_error?: string | null;
  workflow_summary: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiErrorDetail {
  detail:
    | string
    | Array<{ loc?: (string | number)[]; msg?: string; type?: string }>;
}
