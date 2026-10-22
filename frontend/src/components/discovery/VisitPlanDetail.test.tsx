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
});
