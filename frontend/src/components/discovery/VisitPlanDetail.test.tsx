import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VisitPlanDetail } from "./VisitPlanDetail";
import type { CandidateParticipationPlan } from "@/lib/api/types";

const mockPlanWithQuestions: CandidateParticipationPlan = {
  candidate: {
    entity_id: "qloo_sidi_01",
    name: "Sidi Saiyyed Mosque",
    entity_type: "heritage_site",
    disambiguation: "16th-century mosque known for intricate jali lattice stonework.",
    tags: [{ id: "heritage", name: "Heritage" }],
  },
  resolution_status: "resolved",
  venue_id: "sidi_saiyyed",
  possibility_assessment: {
    venue_id: "sidi_saiyyed",
    aggregate_outcome: "NEEDS_CONFIRMATION",
    evaluation_time: "2026-10-21T10:00:00Z",
    summary: "Seating is unrecorded in published records.",
    assessments: [
      {
        requirement_id: "req-seating_available",
        attribute: "seating_available",
        priority: "optional",
        scope: "venue",
        outcome: "missing_evidence",
        explanation: "No published records mention benches or rest seating.",
        evidence_references: [
          {
            attribute: "seating_available",
            scope: "venue",
            value: null,
            source: {
              source_type: "heritage_survey",
              title: "Ahmedabad Heritage Documentation",
              verified_at: "2026-09-01T00:00:00Z",
              url: "https://example.org/heritage-survey",
            },
          },
        ],
      },
    ],
  },
  supported_findings: ["Courtyard entry is level."],
  unresolved_gaps: ["Rest seating availability inside prayer hall."],
  confirmation_questions: ["Is bench or stool seating permitted inside the courtyard?"],
  suggested_next_actions: ["Visit during morning hours for natural light on stone jalis."],
  provenance_sources: [
    {
      source_type: "official_record",
      title: "Archaeological Survey of India Record",
      verified_at: "2026-09-01T00:00:00Z",
      url: "https://asi.nic.in/ahmedabad-circle",
    },
  ],
};

describe("VisitPlanDetail", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders assessments with outcome indicators and citations", () => {
    render(<VisitPlanDetail plan={mockPlanWithQuestions} />);

    expect(screen.getByText("Requirement-by-Requirement Assessment")).toBeInTheDocument();
    expect(screen.getByText("seating_available")).toBeInTheDocument();
    expect(screen.getByText("? Needs confirmation")).toBeInTheDocument();
    expect(
      screen.getByText("No published records mention benches or rest seating.")
    ).toBeInTheDocument();
    expect(screen.getByText("Ahmedabad Heritage Documentation")).toBeInTheDocument();
  });

  it("renders documented findings and unresolved gaps", () => {
    render(<VisitPlanDetail plan={mockPlanWithQuestions} />);

    expect(screen.getByText("Documented Visit Highlights")).toBeInTheDocument();
    expect(screen.getByText("Courtyard entry is level.")).toBeInTheDocument();
    expect(screen.getByText("Details Requiring Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Rest seating availability inside prayer hall.")).toBeInTheDocument();
  });

  it("renders QuestionKit and copies formatted questions to clipboard", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextSpy,
      },
      writable: true,
      configurable: true,
    });

    render(<VisitPlanDetail plan={mockPlanWithQuestions} />);

    expect(screen.getByText("Confirmation Question Kit")).toBeInTheDocument();
    expect(
      screen.getByText("Is bench or stool seating permitted inside the courtyard?")
    ).toBeInTheDocument();

    const copyBtn = screen.getByRole("button", { name: /copy questions to ask/i });
    await user.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining("Questions for Sidi Saiyyed Mosque before visiting:")
    );
    expect(await screen.findByText("✓ Copied to clipboard")).toBeInTheDocument();
  });

  it("renders provenance sources and transparency panel", () => {
    render(<VisitPlanDetail plan={mockPlanWithQuestions} />);

    expect(
      screen.getByText("Official Sources & Records Reviewed")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Archaeological Survey of India Record")
    ).toBeInTheDocument();
    expect(screen.getByText(/How this discovery was prepared:/i)).toBeInTheDocument();
  });

  it("renders VERIFIED_FIT status with explicit scope disclaimer", () => {
    const verifiedPlan: CandidateParticipationPlan = {
      candidate: {
        entity_id: "qloo_calico_01",
        name: "Calico Museum of Textiles",
        entity_type: "museum",
        subtype: "Textile Museum",
      },
      resolution_status: "resolved",
      venue_id: "calico_museum",
      possibility_assessment: {
        venue_id: "calico_museum",
        aggregate_outcome: "VERIFIED_FIT",
        evaluation_time: "2026-10-21T10:00:00Z",
        summary: "Verified match for step-free entrance and accessible parking.",
        assessments: [
          {
            requirement_id: "req_step_free",
            attribute: "step_free_entrance",
            priority: "mandatory",
            scope: "venue",
            outcome: "supported",
            explanation: "Ground-level visitor entry is confirmed step-free.",
          },
        ],
      },
      supported_findings: ["Main entrance is step-free."],
      unresolved_gaps: [],
      confirmation_questions: [],
      suggested_next_actions: ["Advance slot booking is required."],
      provenance_sources: [],
    };

    render(<VisitPlanDetail plan={verifiedPlan} />);

    expect(screen.getByText("Meets your stated requirements")).toBeInTheDocument();
    expect(
      screen.getByText(/Scope notice: This assessment is strictly based on published records matching your evaluated requirements. It is not an accessibility certification or guarantee of universal accommodation./i)
    ).toBeInTheDocument();
  });

  it("renders REQUIREMENT_CONFLICT with dedicated conflict alert section and conflicting evidence", () => {
    const conflictPlan: CandidateParticipationPlan = {
      candidate: {
        entity_id: "qloo_heritage_stepwell",
        name: "Adalaj Stepwell",
        entity_type: "heritage_site",
      },
      resolution_status: "resolved",
      venue_id: "adalaj_stepwell",
      possibility_assessment: {
        venue_id: "adalaj_stepwell",
        aggregate_outcome: "REQUIREMENT_CONFLICT",
        evaluation_time: "2026-10-21T10:00:00Z",
        summary: "Steep historical staircases conflict with step-free entrance requirement.",
        assessments: [
          {
            requirement_id: "req_step_free",
            attribute: "step_free_entrance",
            priority: "mandatory",
            scope: "venue",
            outcome: "contradicted",
            explanation: "Access to the subterranean pavilion requires descending multi-tiered stone stairways.",
          },
          {
            requirement_id: "req_seating",
            attribute: "seating_available",
            priority: "optional",
            scope: "venue",
            outcome: "conflicting_evidence",
            explanation: "Heritage authority report states bench seating is present in the park, but conservation plan notes no seating on historic levels.",
          },
        ],
      },
      supported_findings: [],
      unresolved_gaps: [],
      confirmation_questions: ["Are portable seating sticks permitted on the upper tier?"],
      suggested_next_actions: ["View upper pavilion from perimeter ground level."],
      provenance_sources: [],
    };

    render(<VisitPlanDetail plan={conflictPlan} />);

    expect(screen.getByTestId("visit-plan-conflicts")).toBeInTheDocument();
    expect(
      screen.getByText("Documented Requirement Conflicts & Disagreements")
    ).toBeInTheDocument();
    expect(screen.getByText("A stated requirement may not be met")).toBeInTheDocument();
    expect(screen.getAllByText("✕ Contradicted").length).toBeGreaterThan(0);
    expect(screen.getAllByText("⚠ Conflicting Evidence").length).toBeGreaterThan(0);
  });

  it("renders expired evidence and insufficient scope with distinct scope badges", () => {
    const complexPlan: CandidateParticipationPlan = {
      candidate: {
        entity_id: "qloo_tower_gallery",
        name: "Historic Fort Tower Gallery",
        entity_type: "historic_site",
      },
      resolution_status: "resolved",
      venue_id: "fort_tower",
      possibility_assessment: {
        venue_id: "fort_tower",
        aggregate_outcome: "NEEDS_CONFIRMATION",
        evaluation_time: "2026-10-21T10:00:00Z",
        summary: "Experience-scoped elevator status is unverified.",
        assessments: [
          {
            requirement_id: "req_elevator",
            attribute: "internal_elevator",
            priority: "mandatory",
            scope: "experience",
            outcome: "insufficient_scope",
            explanation: "Elevator is documented in main museum building, but roof terrace gallery access is not verified.",
          },
          {
            requirement_id: "req_parking",
            attribute: "accessible_parking",
            priority: "optional",
            scope: "venue",
            outcome: "expired_evidence",
            explanation: "Parking arrangement documented in 2023 construction notice has expired.",
          },
        ],
      },
      supported_findings: [],
      unresolved_gaps: ["Roof terrace gallery elevator access."],
      confirmation_questions: [],
      suggested_next_actions: [],
      provenance_sources: [],
    };

    render(<VisitPlanDetail plan={complexPlan} />);

    expect(screen.getByText("Experience scope")).toBeInTheDocument();
    expect(screen.getByText("Venue scope")).toBeInTheDocument();
    expect(screen.getByText("⬡ Venue-Level Only")).toBeInTheDocument();
    expect(screen.getByText("⏱ Expired Evidence")).toBeInTheDocument();
  });

  it("renders Cultural Thread pathway when present", () => {
    const planWithThread: CandidateParticipationPlan = {
      ...mockPlanWithQuestions,
      cultural_thread: {
        thread_id: "thread_sidi_craft",
        starting_interest: "Stone carving",
        anchor: {
          interest: "Stone carving",
          source_type: "explicit_visitor_selection",
        },
        candidate: {
          entity_id: "qloo_sidi_01",
          name: "Sidi Saiyyed Mosque",
          entity_type: "heritage_site",
          mapping_status: "resolved",
          has_reviewed_evidence: true,
          is_evaluation_eligible: true,
        },
        connection: {
          connection_type: "shared_tag",
          source_type: "deterministic_application_mapping",
          shared_descriptors: ["Intricate lattice", "Stone masonry"],
          rationale: "Celebrated for intricately carved stone jalis and heritage masonry.",
        },
        provenance: "Deterministic cultural tag overlap from Qloo response.",
      },
    };

    render(<VisitPlanDetail plan={planWithThread} />);

    expect(screen.getByTestId("visit-plan-cultural-relevance")).toBeInTheDocument();
    expect(screen.getByText(/“Stone carving”/)).toBeInTheDocument();
    expect(screen.getByText("Cultural Tag Overlap")).toBeInTheDocument();
    expect(screen.getByText("Intricate lattice")).toBeInTheDocument();
  });

  it("handles unreviewed candidates truthfully without fabricating fit", () => {
    const unreviewedPlan: CandidateParticipationPlan = {
      candidate: {
        entity_id: "qloo_indie_cafe",
        name: "Heritage Haveli Tea Room",
        entity_type: "culinary",
      },
      resolution_status: "unmapped",
      venue_id: null,
      possibility_assessment: null,
      supported_findings: [],
      unresolved_gaps: [],
      confirmation_questions: [],
      suggested_next_actions: [],
      provenance_sources: [],
    };

    render(<VisitPlanDetail plan={unreviewedPlan} />);

    expect(
      screen.getByText("Not yet evaluated against visit criteria")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Independent venue documentation has not yet been reviewed for this space in the Ahmedabad pilot./i)
    ).toBeInTheDocument();
  });
});

