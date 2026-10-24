import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CandidateFeedbackMenu } from "./CandidateFeedbackMenu";
import type { CandidateParticipationPlan } from "@/lib/api/types";
import { createInitialTasteMemory, addExplicitInterest, applyUsualInterestsToOuting } from "@/lib/taste";

const mockPlan: CandidateParticipationPlan = {
  candidate: {
    entity_id: "calico_01",
    name: "Calico Museum of Textiles",
    entity_type: "museum",
    disambiguation: "Historic court textiles collection in Shahibaug.",
    tags: [
      { id: "textiles", name: "Textiles" },
      { id: "heritage", name: "Heritage architecture" },
    ],
  },
  resolution_status: "resolved",
  venue_id: "calico_museum",
  supported_findings: ["Level step-free access."],
  unresolved_gaps: [],
  confirmation_questions: [],
  suggested_next_actions: [],
  provenance_sources: [],
};

describe("CandidateFeedbackMenu Component (Issue 09)", () => {
  it("renders compact trigger button initially without overloading the card", () => {
    const memory = createInitialTasteMemory();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Teach my compass/i })).toBeInTheDocument();
    expect(screen.queryByTestId("candidate-feedback-menu")).not.toBeInTheDocument();
  });

  it("opens feedback choices upon clicking trigger and closes on cancel", () => {
    const memory = createInitialTasteMemory();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));

    expect(screen.getByTestId("candidate-feedback-menu")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-more-like-this")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-not-this-trip")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-not-for-me")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-save-later")).toBeInTheDocument();
    expect(screen.getByTestId("feedback-different-direction")).toBeInTheDocument();

    // Cancel closes the menu
    fireEvent.click(screen.getByTestId("feedback-close-btn"));
    expect(screen.queryByTestId("candidate-feedback-menu")).not.toBeInTheDocument();
  });

  it("handles More Like This with disambiguation", () => {
    const memory = createInitialTasteMemory();
    const onApply = vi.fn();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));
    fireEvent.click(screen.getByTestId("feedback-more-like-this"));

    // Disambiguation prompt asking which topic
    expect(
      screen.getByText(/Which cultural interest would you like to explore more of\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-more-like-textiles"));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onApply.mock.calls[0];
    expect(updatedMemory.explicitInterests).toContain("Textiles");
    expect(explanation).toContain('Added "Textiles"');
  });

  it("handles Not this trip: removes from active outing with transparent reassurance", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = applyUsualInterestsToOuting(memory);

    const onApply = vi.fn();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));
    fireEvent.click(screen.getByTestId("feedback-not-this-trip"));

    expect(
      screen.getByText(/Which topic would you like to pause for today's outing\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-not-this-trip-textiles"));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onApply.mock.calls[0];
    expect(updatedMemory.currentOutingInterests).not.toContain("Textiles");
    // General memory intact
    expect(updatedMemory.explicitInterests).toContain("Textiles");
    expect(explanation).toContain("Your general cultural journal is unchanged.");
  });

  it("handles Not for me: asks what specifically and removes topic without broad downranking", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    const onApply = vi.fn();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));
    fireEvent.click(screen.getByTestId("feedback-not-for-me"));

    expect(
      screen.getByText(/What specifically does not interest you\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-not-for-me-textiles"));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onApply.mock.calls[0];
    expect(updatedMemory.excludedInterests).toContain("Textiles");
    expect(updatedMemory.explicitInterests).not.toContain("Textiles");
    // Other topics remain
    expect(updatedMemory.explicitInterests).toContain("Heritage architecture");
    expect(explanation).toContain('Removed "Textiles" from your interests.');
  });

  it("handles Save for another outing", () => {
    const memory = createInitialTasteMemory();
    const onApply = vi.fn();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));
    fireEvent.click(screen.getByTestId("feedback-save-later"));

    fireEvent.click(screen.getByTestId("confirm-save-later-textiles"));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onApply.mock.calls[0];
    expect(updatedMemory.futureTripInterests).toContain("Textiles");
    expect(explanation).toContain('Saved "Textiles" for another outing.');
  });

  it("handles Show a different direction: switches direction and requests refresh", () => {
    const memory = createInitialTasteMemory();
    const onApply = vi.fn();
    render(<CandidateFeedbackMenu plan={mockPlan} memory={memory} onApplyFeedback={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /Teach my compass/i }));
    fireEvent.click(screen.getByTestId("feedback-different-direction"));

    expect(screen.getByText(/Choose an alternative cultural direction/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-direction-modernist-architecture"));

    expect(onApply).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation, triggerRefresh] = onApply.mock.calls[0];
    expect(updatedMemory.currentOutingInterests).toEqual(["Modernist brick architecture"]);
    expect(explanation).toContain("Practical requirements preserved.");
    expect(triggerRefresh).toBe(true);
  });
});
