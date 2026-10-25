/**
 * Contract fixtures for AccessAtlas Discovery API.
 *
 * Derived strictly from backend Pydantic models:
 * - DiscoverRequest (app.api.v1.schemas.DiscoverRequest)
 * - DiscoverResponse (app.api.v1.schemas.DiscoverResponse)
 * - CandidateParticipationPlan (app.agent.models.CandidateParticipationPlan)
 * - ParticipationRequirement (app.possibility.models.ParticipationRequirement)
 * - CulturalThread (app.agent.models.CulturalThread)
 *
 * Used for automated boundary verification and contract-drift prevention.
 */

import type {
  CandidateParticipationPlan,
  CulturalThread,
  DiscoverRequest,
  DiscoverResponse,
} from "../types";

export const validDiscoverRequest: DiscoverRequest = {
  city: "Ahmedabad",
  cultural_interests: ["Textiles", "Heritage Architecture"],
  requirements: [
    {
      requirement_id: "req_reservation",
      attribute: "reservation_required",
      priority: "mandatory",
      scope: "venue",
      operator: "equals",
      expected_value: true,
      description: "Mandatory reservation verification",
    },
    {
      requirement_id: "req_seating",
      attribute: "seating_available",
      priority: "optional",
      scope: "venue",
      operator: "equals",
      expected_value: true,
      description: "Optional rest seating preference",
    },
  ],
  max_candidates: 5,
  evaluation_time: "2026-10-19T12:00:00Z",
};

export const fixtureVerifiedFitPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "783C0235-681D-4235-BA4D-A57992F7C97A",
    name: "Calico Museum of Textiles",
    entity_type: "urn:entity:place",
    subtype: "Textile Museum",
    disambiguation: "Premier textile museum in Ahmedabad with historic fabric collections.",
    popularity: 0.92,
    tags: [
      { id: "textiles", name: "Textiles" },
      { id: "heritage", name: "Heritage" },
    ],
  },
  resolution_status: "resolved",
  venue_id: "ven_in_ahm_calico",
  possibility_assessment: {
    venue_id: "ven_in_ahm_calico",
    aggregate_outcome: "VERIFIED_FIT",
    evaluation_time: "2026-10-19T12:00:00Z",
    summary: "Verified fit: all mandatory requirements are supported for 'Calico Museum of Textiles'.",
    assessments: [
      {
        requirement_id: "req_reservation",
        attribute: "reservation_required",
        priority: "mandatory",
        scope: "venue",
        outcome: "supported",
        explanation: "Prior online registration required; booking window opens 90 days in advance.",
        evidence_references: [
          {
            attribute: "reservation_required",
            scope: "venue",
            value: true,
            source: {
              source_type: "official_venue_website",
              title: "Sarabhai Foundation — Calico Museum Tour Guidelines",
              url: "https://www.calicomuseum.org/tour-guidelines/",
              verified_at: "2026-10-18T10:55:00Z",
            },
          },
        ],
      },
    ],
  },
  supported_findings: [
    "Reservation required: supported by verified evidence (venue scope).",
  ],
  unresolved_gaps: [],
  confirmation_questions: [],
  suggested_next_actions: [
    "Verified fit: all mandatory requirements are supported for 'Calico Museum of Textiles'.",
    "Review official venue schedule and booking requirements prior to visit.",
  ],
  provenance_sources: [
    {
      source_type: "official_venue_website",
      title: "Sarabhai Foundation — Calico Museum Tour Guidelines",
      url: "https://www.calicomuseum.org/tour-guidelines/",
      verified_at: "2026-10-18T10:55:00Z",
    },
  ],
};

export const fixtureNeedsConfirmationPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "36537424-5653-418C-A39E-33C17214D423",
    name: "Kasturbhai Lalbhai Museum",
    entity_type: "urn:entity:place",
    subtype: "Art & Heritage Museum",
    disambiguation: "Museum complex displaying Indian art and ancestral home.",
    popularity: 0.81,
    tags: [{ id: "art", name: "Art" }],
  },
  resolution_status: "resolved",
  venue_id: "ven_in_ahm_kasturbhai",
  possibility_assessment: {
    venue_id: "ven_in_ahm_kasturbhai",
    aggregate_outcome: "NEEDS_CONFIRMATION",
    evaluation_time: "2026-10-19T12:00:00Z",
    summary: "Step-free entrance is unrecorded on official channels.",
    assessments: [
      {
        requirement_id: "req_step_free",
        attribute: "step_free_entrance",
        priority: "mandatory",
        scope: "venue",
        outcome: "missing_evidence",
        explanation: "Ramp provision to ancestral home is unrecorded on official channels.",
        confirmation_need: "confirm ramp provision and physical threshold to ancestral home",
        evidence_references: [],
      },
    ],
  },
  supported_findings: [],
  unresolved_gaps: [
    "Step free entrance: missing_evidence — Ramp provision is unrecorded.",
  ],
  confirmation_questions: [
    "Confirm step free entrance: confirm ramp provision and physical threshold to ancestral home",
  ],
  suggested_next_actions: [
    "Needs confirmation: mandatory details for 'Kasturbhai Lalbhai Museum' require verification.",
    "Contact venue accessibility coordinator to resolve the confirmation questions above.",
  ],
  provenance_sources: [
    {
      source_type: "official_venue_website",
      title: "Kasturbhai Lalbhai Museum — Guidelines & FAQ",
      url: "https://kasturbhailalbhaimuseum.com/",
      verified_at: "2026-10-18T10:55:00Z",
    },
  ],
};

export const fixtureRequirementConflictPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "783C0235-681D-4235-BA4D-A57992F7C97A",
    name: "Calico Museum of Textiles",
    entity_type: "urn:entity:place",
    subtype: "Textile Museum",
    disambiguation: "Premier textile museum in Ahmedabad with historic fabric collections.",
    popularity: 0.92,
  },
  resolution_status: "resolved",
  venue_id: "ven_in_ahm_calico",
  possibility_assessment: {
    venue_id: "ven_in_ahm_calico",
    aggregate_outcome: "REQUIREMENT_CONFLICT",
    evaluation_time: "2026-10-19T12:00:00Z",
    summary: "Wheelchair access requirement contradicts published operational policy.",
    assessments: [
      {
        requirement_id: "req_wheelchair",
        attribute: "wheelchair_access",
        priority: "mandatory",
        scope: "venue",
        outcome: "contradicted",
        explanation: "Official statement: The Foundation is currently unable to offer wheelchair access.",
        evidence_references: [
          {
            attribute: "wheelchair_access",
            scope: "venue",
            value: false,
            source: {
              source_type: "official_venue_website",
              title: "Sarabhai Foundation — Tour Guidelines",
              url: "https://www.calicomuseum.org/tour-guidelines/",
              verified_at: "2026-10-18T10:55:00Z",
            },
          },
        ],
      },
    ],
  },
  supported_findings: [],
  unresolved_gaps: [
    "Wheelchair access: contradicted — Foundation is currently unable to offer wheelchair access.",
  ],
  confirmation_questions: [],
  suggested_next_actions: [
    "Identified conflict: mandatory requirements are contradicted for 'Calico Museum of Textiles'.",
    "Consider alternative cultural experiences that satisfy your stated requirements.",
  ],
  provenance_sources: [
    {
      source_type: "official_venue_website",
      title: "Sarabhai Foundation — Tour Guidelines",
      url: "https://www.calicomuseum.org/tour-guidelines/",
      verified_at: "2026-10-18T10:55:00Z",
    },
  ],
};

export const fixtureUnmappedPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "unmapped_cafe_99",
    name: "Old City Heritage Tea Haven",
    entity_type: "urn:entity:place",
    subtype: "Tea Room",
    disambiguation: "Traditional tea stall in old haveli quarter.",
    popularity: 0.65,
    tags: [{ id: "culinary", name: "Culinary" }],
  },
  resolution_status: "unmapped",
  venue_id: null,
  experience_id: null,
  possibility_assessment: null,
  supported_findings: [],
  unresolved_gaps: [
    "No independently verified venue evidence is mapped for this cultural entity.",
  ],
  confirmation_questions: [
    "Confirm whether 'Old City Heritage Tea Haven' operates at a physical venue and verify applicable access attributes directly.",
  ],
  suggested_next_actions: [
    "Cultural interest matches 'Old City Heritage Tea Haven', but practical access information is unverified. Consult official venue sources directly before planning attendance.",
  ],
  provenance_sources: [],
};

export const fixtureMissingEvidencePlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "missing_ev_candidate_01",
    name: "Historic Stepwell Exhibit",
    entity_type: "urn:entity:place",
    subtype: "Historic Site",
  },
  resolution_status: "missing_evidence",
  venue_id: "ven_missing_id_999",
  experience_id: null,
  possibility_assessment: null,
  supported_findings: [],
  unresolved_gaps: [
    "Mapped venue identifier 'ven_missing_id_999' was not found in the local evidence repository.",
  ],
  confirmation_questions: [
    "Confirm practical entrance and participation conditions directly with 'Historic Stepwell Exhibit' staff.",
  ],
  suggested_next_actions: [
    "Evidence repository record is missing. Direct confirmation with venue staff is required prior to travel.",
  ],
  provenance_sources: [],
};

export const fixtureCulturalThread: CulturalThread = {
  thread_id: "thread_calico_textiles",
  starting_interest: "Textiles",
  anchor: {
    interest: "Textiles",
    source_type: "explicit_visitor_selection",
    resolved_entity_id: "783C0235-681D-4235-BA4D-A57992F7C97A",
    resolved_entity_name: "Calico Museum of Textiles",
    matched_tag: "Textiles",
  },
  candidate: {
    entity_id: "783C0235-681D-4235-BA4D-A57992F7C97A",
    name: "Calico Museum of Textiles",
    entity_type: "urn:entity:place",
    subtype: "Textile Museum",
    popularity: 0.92,
    mapping_status: "resolved",
    has_reviewed_evidence: true,
    is_evaluation_eligible: true,
    venue_id: "ven_in_ahm_calico",
  },
  connection: {
    connection_type: "shared_tag",
    source_type: "deterministic_application_mapping",
    shared_descriptors: ["Textiles"],
    rationale: "Shares cultural tag 'Textiles' with your selected interest 'Textiles'.",
  },
  provenance: "Deterministic match on entity tag 'Textiles' from Qloo entity response for starting interest 'Textiles'.",
};

export const validDiscoverResponse: DiscoverResponse = {
  city: "Ahmedabad",
  cultural_interests: ["Textiles", "Heritage Architecture"],
  total_candidates_found: 4,
  candidates_evaluated: 4,
  plans: [
    fixtureVerifiedFitPlan,
    fixtureNeedsConfirmationPlan,
    fixtureRequirementConflictPlan,
    fixtureUnmappedPlan,
  ],
  cultural_threads: [fixtureCulturalThread],
  discovery_error: null,
  workflow_summary: "Evaluated 4 candidates against verified records.",
};

export const fixtureError400 = {
  status: 400,
  payload: {
    detail: "Unsupported pilot city 'Mumbai'. Only 'Ahmedabad' is supported in the current pilot release.",
  },
};

export const fixtureError422 = {
  status: 422,
  payload: {
    detail: [
      {
        loc: ["body", "cultural_interests"],
        msg: "cultural_interests must contain at least one item.",
        type: "value_error",
      },
    ],
  },
};

export const fixtureError429 = {
  status: 429,
  payload: {
    detail: "Upstream cultural discovery rate limit exceeded. Please try again later.",
  },
};

export const fixtureError502 = {
  status: 502,
  payload: {
    detail: "Upstream cultural discovery provider error.",
  },
};

export const fixtureError503 = {
  status: 503,
  payload: {
    detail: "Cultural discovery service is not configured.",
  },
};

export const fixtureError504 = {
  status: 504,
  payload: {
    detail: "Upstream cultural discovery request timed out. Please retry.",
  },
};
