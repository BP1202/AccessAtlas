import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CulturalThreadsSection } from "./CulturalThreadsSection";
import type { CulturalThread, CandidateParticipationPlan } from "@/lib/api/types";

const mockThreads: CulturalThread[] = [
  {
    thread_id: "thread_calico_textiles",
    starting_interest: "Textiles",
    anchor: {
      interest: "Textiles",
      source_type: "explicit_visitor_selection",
      resolved_entity_id: "ent_calico_01",
      resolved_entity_name: "Calico Museum of Textiles",
      matched_tag: "Textiles",
    },
    candidate: {
      entity_id: "ent_calico_01",
      name: "Calico Museum of Textiles",
      entity_type: "museum",
      subtype: "Textile Museum",
      popularity: 0.88,
      mapping_status: "resolved",
      has_reviewed_evidence: true,
      is_evaluation_eligible: true,
      venue_id: "calico_museum",
    },
    connection: {
      connection_type: "shared_tag",
      source_type: "deterministic_application_mapping",
      shared_descriptors: ["Textiles", "Heritage crafts"],
      rationale:
        "Shares cultural tag 'Textiles' with your selected interest 'Textiles'.",
    },
    provenance:
      "Deterministic match on entity tag 'Textiles' from Qloo entity response for starting interest 'Textiles'.",
  },
  {
    thread_id: "thread_indie_art",
    starting_interest: "Contemporary Art",
    anchor: {
      interest: "Contemporary Art",
      source_type: "explicit_visitor_selection",
      resolved_entity_id: null,
      resolved_entity_name: null,
      matched_tag: null,
    },
    candidate: {
      entity_id: "ent_indie_art_02",
      name: "Independent Art Space",
      entity_type: "gallery",
      subtype: null,
      popularity: 0.42,
      mapping_status: "unmapped",
      has_reviewed_evidence: false,
      is_evaluation_eligible: false,
      venue_id: null,
    },
    connection: {
      connection_type: "discovered_candidate",
      source_type: "actual_qloo_response",
      shared_descriptors: [],
      rationale:
        "Discovered candidate returned by Qloo for cultural search 'Contemporary Art'.",
    },
    provenance:
      "Discovered candidate from Qloo response for cultural interest 'Contemporary Art'.",
  },
];

const mockPlans: CandidateParticipationPlan[] = [
  {
    candidate: {
      entity_id: "ent_calico_01",
      name: "Calico Museum of Textiles",
      entity_type: "museum",
      subtype: "Textile Museum",
    },
    resolution_status: "resolved",
    venue_id: "calico_museum",
    supported_findings: ["Level entrance"],
    unresolved_gaps: [],
    confirmation_questions: [],
    suggested_next_actions: ["Book advance slot"],
    provenance_sources: [],
  },
  {
    candidate: {
      entity_id: "ent_indie_art_02",
      name: "Independent Art Space",
      entity_type: "gallery",
    },
    resolution_status: "unmapped",
    venue_id: null,
    supported_findings: [],
    unresolved_gaps: ["No verified evidence"],
    confirmation_questions: [],
    suggested_next_actions: [],
    provenance_sources: [],
  },
];

describe("CulturalThreadsSection", () => {
  it("renders empty state truthfully when no threads exist", () => {
    render(<CulturalThreadsSection threads={[]} />);

    expect(screen.getByTestId("cultural-threads-empty")).toBeInTheDocument();
    expect(screen.getByText("No explicit cultural threads linked")).toBeInTheDocument();
    expect(
      screen.getByText(/no specific overlapping tags or subcategories were deterministically established/i)
    ).toBeInTheDocument();
  });

  it("renders supported relationship connections with grounded provenance wording", () => {
    render(
      <CulturalThreadsSection
        threads={mockThreads}
        plans={mockPlans}
      />
    );

    // Section header
    expect(screen.getByTestId("cultural-threads-section")).toBeInTheDocument();
    expect(screen.getByText("How your interests connect to these spaces")).toBeInTheDocument();

    // Node 1: Starting Interest & provenance distinction
    expect(screen.getByText(/“Textiles”/)).toBeInTheDocument();
    expect(
      screen.getAllByText("You selected this starting interest").length
    ).toBeGreaterThan(0);

    // Node 2: Connection pathway with tag overlap badge
    expect(screen.getByText("Cultural Tag Overlap")).toBeInTheDocument();
    expect(
      screen.getByText("AccessAtlas deterministic matching")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Shares cultural tag 'Textiles' with your selected interest 'Textiles'."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Heritage crafts")).toBeInTheDocument();

    // Node 3: Candidate & verification status distinction
    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(screen.getByText("Reviewed Pilot Venue")).toBeInTheDocument();
    expect(screen.getByText(/Global Qloo salience: 88%/i)).toBeInTheDocument();
  });

  it("clearly distinguishes unmapped candidate awaiting participation evidence", () => {
    render(
      <CulturalThreadsSection
        threads={mockThreads}
        plans={mockPlans}
      />
    );

    // Second thread
    expect(screen.getByText("Independent Art Space")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Participation Evidence")).toBeInTheDocument();
    expect(screen.getByText("Qloo Cultural Affinity")).toBeInTheDocument();
    expect(
      screen.getByText("Qloo cultural intelligence response")
    ).toBeInTheDocument();
    expect(screen.getByText(/Global Qloo salience: 42%/i)).toBeInTheDocument();
  });

  it("handles missing optional data gracefully without crashing or fabricating details", () => {
    const threadWithMinimalData: CulturalThread[] = [
      {
        thread_id: "thread_minimal",
        starting_interest: "Architecture",
        anchor: {
          interest: "Architecture",
          source_type: "explicit_visitor_selection",
        },
        candidate: {
          entity_id: "ent_minimal",
          name: "Heritage Complex",
          entity_type: "heritage",
          mapping_status: "unmapped",
          has_reviewed_evidence: false,
          is_evaluation_eligible: false,
        },
        connection: {
          connection_type: "discovered_candidate",
          source_type: "actual_qloo_response",
          shared_descriptors: [],
          rationale: "Discovered for Architecture.",
        },
        provenance: "Basic discovery signal.",
      },
    ];

    render(<CulturalThreadsSection threads={threadWithMinimalData} />);

    expect(screen.getByText("Heritage Complex")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Participation Evidence")).toBeInTheDocument();
    expect(screen.queryByText(/Global Qloo salience/i)).not.toBeInTheDocument();
  });

  it("filters threads by starting interest when multiple interests exist", async () => {
    const user = userEvent.setup();
    render(<CulturalThreadsSection threads={mockThreads} plans={mockPlans} />);

    // Both visible initially
    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(screen.getByText("Independent Art Space")).toBeInTheDocument();

    // Filter to "Contemporary Art"
    const artFilter = screen.getByRole("button", { name: /^Contemporary Art/i });
    await user.click(artFilter);

    expect(screen.queryByText("Calico Museum of Textiles")).not.toBeInTheDocument();
    expect(screen.getByText("Independent Art Space")).toBeInTheDocument();

    // Filter back to "All interests"
    const allFilter = screen.getByRole("button", { name: /^All interests/i });
    await user.click(allFilter);

    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(screen.getByText("Independent Art Space")).toBeInTheDocument();
  });

  it("fires candidate selection callback to navigate to visit plan", async () => {
    const user = userEvent.setup();
    const selectSpy = vi.fn();

    render(
      <CulturalThreadsSection
        threads={mockThreads}
        plans={mockPlans}
        onSelectCandidate={selectSpy}
      />
    );

    const viewPlanBtn = screen.getByRole("button", {
      name: /view verified visit plan for Calico Museum of Textiles/i,
    });
    await user.click(viewPlanBtn);

    expect(selectSpy).toHaveBeenCalledWith("ent_calico_01");
  });
});
