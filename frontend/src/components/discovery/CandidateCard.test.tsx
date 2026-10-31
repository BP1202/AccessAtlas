import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CandidateCard } from "./CandidateCard";
import type { CandidateParticipationPlan } from "@/lib/api/types";

const mockResolvedPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "qloo_calico_01",
    name: "Calico Museum of Textiles",
    entity_type: "museum",
    disambiguation: "Historic textile collection housed in heritage haveli compounds.",
    tags: [
      { id: "tag_textiles", name: "Textiles" },
      { id: "tag_history", name: "History" },
    ],
  },
  resolution_status: "resolved",
  venue_id: "calico_museum",
  possibility_assessment: {
    venue_id: "calico_museum",
    aggregate_outcome: "VERIFIED_FIT",
    evaluation_time: "2026-10-21T10:00:00Z",
    summary: "All stated requirements satisfied by published records.",
    assessments: [
      {
        requirement_id: "req-step_free_entrance",
        attribute: "step_free_entrance",
        priority: "mandatory",
        scope: "venue",
        outcome: "supported",
        explanation: "Ground floor entry is level.",
      },
    ],
  },
  supported_findings: ["Main entrance is step-free from visitor gate."],
  unresolved_gaps: [],
  confirmation_questions: [],
  suggested_next_actions: ["Book guided tour slots 4 weeks in advance."],
  provenance_sources: [
    {
      source_type: "official_website",
      title: "Calico Museum Visitor Guidelines",
      url: "https://calicomuseum.org/visit",
      verified_at: "2026-10-15T00:00:00Z",
    },
  ],
};

const mockUnmappedPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "qloo_unknown_01",
    name: "Independent Art Atelier",
    entity_type: "gallery",
    disambiguation: "Local art space.",
    tags: [{ id: "art", name: "Art" }],
  },
  resolution_status: "unmapped",
  venue_id: null,
  possibility_assessment: null,
  supported_findings: [],
  unresolved_gaps: ["No verified operational documentation available."],
  confirmation_questions: ["Does the venue offer step-free access?"],
  suggested_next_actions: ["Contact venue directly."],
  provenance_sources: [],
};

describe("CandidateCard", () => {
  it("renders candidate information and outcome badge for resolved candidate", () => {
    render(<CandidateCard plan={mockResolvedPlan} />);

    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(
      screen.getByText(/Historic textile collection housed in heritage haveli compounds/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Meets your stated requirements")).toBeInTheDocument();
    expect(screen.getByText("Visit information reviewed")).toBeInTheDocument();
  });

  it("renders unmapped candidate without fabricating an outcome badge", () => {
    render(<CandidateCard plan={mockUnmappedPlan} />);

    expect(screen.getByText("Independent Art Atelier")).toBeInTheDocument();
    expect(screen.getByText("Visit information not yet reviewed")).toBeInTheDocument();
    expect(
      screen.getByText("Not yet evaluated against visit criteria")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Meets your stated requirements")
    ).not.toBeInTheDocument();
  });

  it("expands and collapses visit plan on button click", async () => {
    const user = userEvent.setup();
    render(<CandidateCard plan={mockResolvedPlan} />);

    expect(
      screen.queryByText("Requirement-by-Requirement Assessment")
    ).not.toBeInTheDocument();

    const viewPlanBtn = screen.getByRole("button", { name: /view visit plan/i });
    await user.click(viewPlanBtn);

    expect(
      screen.getByText("Requirement-by-Requirement Assessment")
    ).toBeInTheDocument();
    expect(screen.getByText("Ground floor entry is level.")).toBeInTheDocument();

    const hidePlanBtn = screen.getByRole("button", { name: /hide visit plan/i });
    await user.click(hidePlanBtn);

    expect(
      screen.queryByText("Requirement-by-Requirement Assessment")
    ).not.toBeInTheDocument();
  });

  it("renders cultural thread callout when present on the plan", () => {
    const planWithThread: CandidateParticipationPlan = {
      ...mockResolvedPlan,
      cultural_thread: {
        thread_id: "thread_calico_textiles",
        starting_interest: "Textiles",
        anchor: {
          interest: "Textiles",
          source_type: "explicit_visitor_selection",
        },
        candidate: {
          entity_id: "qloo_calico_01",
          name: "Calico Museum of Textiles",
          entity_type: "museum",
          mapping_status: "resolved",
          has_reviewed_evidence: true,
          is_evaluation_eligible: true,
        },
        connection: {
          connection_type: "shared_tag",
          source_type: "deterministic_application_mapping",
          shared_descriptors: ["Textiles"],
          rationale: "Shares cultural tag 'Textiles' with your selected interest.",
        },
        provenance: "Deterministic tag overlap.",
      },
    };

    render(<CandidateCard plan={planWithThread} />);

    expect(
      screen.getByTestId("candidate-cultural-thread-qloo_calico_01")
    ).toBeInTheDocument();
    expect(screen.getByText(/Cultural Thread:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Shares cultural tag 'Textiles' with your selected interest/i)
    ).toBeInTheDocument();
  });

  it("honors external isExpanded and onToggleExpand props", async () => {
    const user = userEvent.setup();
    const toggleSpy = vi.fn();

    const { rerender } = render(
      <CandidateCard
        plan={mockResolvedPlan}
        isExpanded={false}
        onToggleExpand={toggleSpy}
      />
    );

    expect(
      screen.queryByText("Requirement-by-Requirement Assessment")
    ).not.toBeInTheDocument();

    const viewPlanBtn = screen.getByRole("button", { name: /view visit plan/i });
    await user.click(viewPlanBtn);
    expect(toggleSpy).toHaveBeenCalledTimes(1);

    // Rerender as expanded
    rerender(
      <CandidateCard
        plan={mockResolvedPlan}
        isExpanded={true}
        onToggleExpand={toggleSpy}
      />
    );

    expect(
      screen.getByText("Requirement-by-Requirement Assessment")
    ).toBeInTheDocument();
  });
});

