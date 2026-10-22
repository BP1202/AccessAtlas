import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExplorePage from "./page";
import { defaultApiClient, ApiClientError } from "@/lib/api/client";
import type { DiscoverResponse } from "@/lib/api/types";

const mockDiscoverResponse: DiscoverResponse = {
  city: "Ahmedabad",
  cultural_interests: ["Textiles"],
  total_candidates_found: 1,
  candidates_evaluated: 1,
  plans: [
    {
      candidate: {
        entity_id: "qloo_calico_01",
        name: "Calico Museum of Textiles",
        entity_type: "museum",
        disambiguation: "Historic textile collection.",
        tags: [{ id: "textiles", name: "Textiles" }],
      },
      resolution_status: "resolved",
      venue_id: "calico_museum",
      possibility_assessment: {
        venue_id: "calico_museum",
        aggregate_outcome: "VERIFIED_FIT",
        evaluation_time: "2026-10-21T10:00:00Z",
        summary: "Verified match against stated requirements.",
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
      supported_findings: ["Main entrance is step-free."],
      unresolved_gaps: [],
      confirmation_questions: [],
      suggested_next_actions: ["Advance registration required."],
      provenance_sources: [
        {
          source_type: "official_website",
          title: "Calico Official Site",
          verified_at: "2026-10-15T00:00:00Z",
        },
      ],
    },
  ],
  workflow_summary: "Evaluated 1 candidate against verified records.",
};

describe("ExplorePage Integration Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("completes the 2-stage discovery journey and renders results", async () => {
    const user = userEvent.setup();
    const discoverSpy = vi
      .spyOn(defaultApiClient, "discover")
      .mockResolvedValue(mockDiscoverResponse);

    render(<ExplorePage />);

    // Stage 1: Interests
    expect(screen.getByText("What cultural experiences spark your curiosity?")).toBeInTheDocument();
    const textilesChip = screen.getByRole("button", { name: /textiles/i });
    await user.click(textilesChip);

    const continueBtn = screen.getByRole("button", { name: /continue to visit preferences/i });
    expect(continueBtn).toBeEnabled();
    await user.click(continueBtn);

    // Stage 2: Preferences
    expect(screen.getByText("What matters for your visit?")).toBeInTheDocument();

    // Select Essential for step_free_entrance
    const essentialBtn = screen.getAllByRole("radio", { name: "Essential" })[0];
    await user.click(essentialBtn);

    // Submit search
    const searchBtn = screen.getByRole("button", { name: /find cultural experiences/i });
    await user.click(searchBtn);

    // API verified
    expect(discoverSpy).toHaveBeenCalledWith({
      city: "Ahmedabad",
      cultural_interests: ["Textiles"],
      requirements: [
        {
          requirement_id: "req-step_free_entrance",
          attribute: "step_free_entrance",
          priority: "mandatory",
          expected_value: true,
        },
      ],
      max_candidates: 5,
    });

    // Stage 3: Results
    await waitFor(() => {
      expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    });

    expect(screen.getByText("Meets your stated requirements")).toBeInTheDocument();
    expect(
      screen.getByText(/1 cultural candidate found for “Textiles”/i)
    ).toBeInTheDocument();
  });

  it("handles discovery API errors with sanitized message and retry option", async () => {
    const user = userEvent.setup();
    const discoverSpy = vi
      .spyOn(defaultApiClient, "discover")
      .mockRejectedValue(new ApiClientError(503, "Discovery service temporarily unavailable"));

    render(<ExplorePage />);

    // Select interest
    await user.click(screen.getByRole("button", { name: /textiles/i }));
    await user.click(screen.getByRole("button", { name: /continue to visit preferences/i }));

    // Submit
    await user.click(screen.getByRole("button", { name: /find cultural experiences/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Discovery service temporarily unavailable")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();

    // Retry recovery
    discoverSpy.mockResolvedValueOnce(mockDiscoverResponse);
    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    });
  });

  it("allows navigating back to edit interests or refine preferences", async () => {
    const user = userEvent.setup();
    vi.spyOn(defaultApiClient, "discover").mockResolvedValue(mockDiscoverResponse);

    render(<ExplorePage />);

    // Stage 1 -> Stage 2
    await user.click(screen.getByRole("button", { name: /textiles/i }));
    await user.click(screen.getByRole("button", { name: /continue to visit preferences/i }));
    expect(screen.getByText("What matters for your visit?")).toBeInTheDocument();

    // Go back to interests
    await user.click(screen.getByRole("button", { name: /back to interests/i }));
    expect(screen.getByText("What cultural experiences spark your curiosity?")).toBeInTheDocument();

    // Re-continue and submit to results
    await user.click(screen.getByRole("button", { name: /continue to visit preferences/i }));
    await user.click(screen.getByRole("button", { name: /find cultural experiences/i }));

    await waitFor(() => {
      expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    });

    // From results, refine preferences
    const adjustPrefsBtn = screen.getByRole("button", { name: /adjust preferences/i });
    await user.click(adjustPrefsBtn);
    expect(screen.getByText("What matters for your visit?")).toBeInTheDocument();
  });
});
