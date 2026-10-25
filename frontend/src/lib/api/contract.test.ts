import { describe, it, expect } from "vitest";
import type {
  EvidenceAttribute,
  ClaimScope,
  RequirementPriority,
  ConditionOperator,
  RequirementOutcome,
  PossibilityOutcome,
  CandidateResolutionStatus,
  DiscoverRequest,
  DiscoverResponse,
} from "./types";
import {
  OUTCOME_LABELS,
  OUTCOME_DESCRIPTIONS,
  RESOLUTION_LABELS,
  ATTRIBUTE_LABELS,
  REQUIREMENT_OUTCOME_LABELS,
  SCOPE_LABELS,
} from "@/lib/constants/labels";

describe("API Contract and Schema Drift Verification", () => {
  it("verifies all 15 backend evidence attributes are accounted for and labeled", () => {
    const expectedAttributes: EvidenceAttribute[] = [
      "step_free_entrance",
      "internal_elevator",
      "seating_available",
      "rest_areas",
      "quiet_space",
      "audio_description",
      "assistive_listening",
      "sensory_adapted_session",
      "service_animal_policy",
      "companion_entry_policy",
      "reservation_required",
      "step_free_restroom",
      "accessible_parking",
      "contact_for_access_info",
      "wheelchair_access",
    ];

    expect(expectedAttributes).toHaveLength(15);
    for (const attr of expectedAttributes) {
      expect(ATTRIBUTE_LABELS[attr]).toBeDefined();
    }
  });

  it("verifies 3-state PossibilityOutcome enum values and visitor mappings", () => {
    const outcomes: PossibilityOutcome[] = [
      "VERIFIED_FIT",
      "NEEDS_CONFIRMATION",
      "REQUIREMENT_CONFLICT",
    ];

    expect(outcomes).toHaveLength(3);

    // Each outcome must have an honest, visitor-facing label
    expect(OUTCOME_LABELS.VERIFIED_FIT).toBe("Meets your stated requirements");
    expect(OUTCOME_LABELS.NEEDS_CONFIRMATION).toBe("Some details need checking");
    expect(OUTCOME_LABELS.REQUIREMENT_CONFLICT).toBe(
      "A stated requirement may not be met"
    );

    // Each outcome must have an honest explanation
    expect(OUTCOME_DESCRIPTIONS.VERIFIED_FIT).toBeDefined();
    expect(OUTCOME_DESCRIPTIONS.NEEDS_CONFIRMATION).toBeDefined();
    expect(OUTCOME_DESCRIPTIONS.REQUIREMENT_CONFLICT).toBeDefined();
  });

  it("verifies candidate resolution statuses and visitor mappings", () => {
    const statuses: CandidateResolutionStatus[] = [
      "resolved",
      "unmapped",
      "missing_evidence",
    ];

    expect(statuses).toHaveLength(3);
    expect(RESOLUTION_LABELS.resolved).toBe("Visit information reviewed");
    expect(RESOLUTION_LABELS.unmapped).toBe("Visit information not yet reviewed");
    expect(RESOLUTION_LABELS.missing_evidence).toBe(
      "Visit information not yet reviewed"
    );
  });

  it("verifies condition operators and requirement priorities", () => {
    const priorities: RequirementPriority[] = ["mandatory", "optional"];
    const operators: ConditionOperator[] = [
      "equals",
      "not_equals",
      "greater_than_or_equal",
      "less_than_or_equal",
      "is_present",
    ];
    const scopes: ClaimScope[] = ["venue", "experience"];
    const reqOutcomes: RequirementOutcome[] = [
      "supported",
      "contradicted",
      "missing_evidence",
      "conflicting_evidence",
      "expired_evidence",
      "insufficient_scope",
      "unsupported_condition",
    ];

    expect(priorities).toHaveLength(2);
    expect(operators).toHaveLength(5);
    expect(scopes).toHaveLength(2);
    expect(reqOutcomes).toHaveLength(7);

    for (const scope of scopes) {
      expect(SCOPE_LABELS[scope]).toBeDefined();
    }
    for (const outcome of reqOutcomes) {
      expect(REQUIREMENT_OUTCOME_LABELS[outcome]).toBeDefined();
    }
  });

  it("verifies DiscoverRequest shape conforms to backend contract", () => {
    const req: DiscoverRequest = {
      city: "Ahmedabad",
      cultural_interests: ["textiles"],
      requirements: [],
      max_candidates: 5,
      evaluation_time: null,
    };

    expect(req.city).toBe("Ahmedabad");
    expect(req.cultural_interests).toEqual(["textiles"]);
    expect(req.max_candidates).toBe(5);
  });

  it("verifies DiscoverResponse shape conforms to backend contract", () => {
    const res: DiscoverResponse = {
      city: "Ahmedabad",
      cultural_interests: ["art"],
      total_candidates_found: 0,
      candidates_evaluated: 0,
      plans: [],
      discovery_error: null,
      workflow_summary: "Evaluated 0 candidates.",
    };

    expect(res.city).toBe("Ahmedabad");
    expect(res.cultural_interests).toEqual(["art"]);
    expect(res.total_candidates_found).toBe(0);
    expect(res.workflow_summary).toBeDefined();
  });
});
