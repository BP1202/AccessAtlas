import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CulturalCompassReveal } from "./CulturalCompassReveal";
import { deriveCulturalDirection, type SignalProvenance } from "@/lib/compass";

const MOCK_PROVENANCE: SignalProvenance[] = [
  {
    interest: "textiles",
    sourceQuestionId: "textiles_vs_contemporary_studio",
    sourceOptionId: "historic_textile_workshop",
    choice: "option_a",
    rationale: "Selected Historic textile workshop",
  },
  {
    interest: "craft traditions",
    sourceQuestionId: "textiles_vs_contemporary_studio",
    sourceOptionId: "historic_textile_workshop",
    choice: "option_a",
    rationale: "Selected Historic textile workshop",
  },
];

describe("CulturalCompassReveal Component — Editable Direction & Discovery Handoff", () => {
  it("renders the provisional direction title, description, and derived topics", () => {
    const handleContinue = vi.fn();
    const handleRevise = vi.fn();
    const handleExit = vi.fn();

    render(
      <CulturalCompassReveal
        initialInterests={["textiles", "craft traditions"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        onConfirmAndContinue={handleContinue}
        onReviseAnswers={handleRevise}
        onExitToManual={handleExit}
      />
    );

    // Header and badges
    expect(screen.getByTestId("cultural-compass-reveal")).toBeInTheDocument();
    expect(screen.getByText(/Provisional Direction/i)).toBeInTheDocument();

    // Deterministic title
    const titleEl = screen.getByTestId("cultural-direction-title");
    expect(titleEl).toHaveTextContent("Living Craft & Artisan Heritage");

    // Starting point non-verdict disclaimer
    expect(screen.getByText(/Starting point, not a verdict/i)).toBeInTheDocument();

    // Initial derived topics rendered
    expect(screen.getByText("textiles")).toBeInTheDocument();
    expect(screen.getByText("craft traditions")).toBeInTheDocument();

    // Primary handoff button is enabled
    const continueBtn = screen.getByRole("button", {
      name: /continue to visit preferences →/i,
    });
    expect(continueBtn).toBeEnabled();
  });

  it("handles empty answers / all skipped gracefully with open curiosity fallback", () => {
    render(
      <CulturalCompassReveal
        initialInterests={[]}
        provenance={[]}
        answers={{}}
        onConfirmAndContinue={vi.fn()}
        onReviseAnswers={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const titleEl = screen.getByTestId("cultural-direction-title");
    expect(titleEl).toHaveTextContent("Open Cultural Curiosity");

    // Zero interests prompt
    expect(
      screen.getByText(/No cultural topics selected/i)
    ).toBeInTheDocument();

    // Continue button must be disabled when 0 topics
    const continueBtn = screen.getByRole("button", {
      name: /continue to visit preferences →/i,
    });
    expect(continueBtn).toBeDisabled();
  });

  it("allows removing a suggested topic", async () => {
    const user = userEvent.setup();
    const handleContinue = vi.fn();

    render(
      <CulturalCompassReveal
        initialInterests={["textiles", "craft traditions"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        onConfirmAndContinue={handleContinue}
        onReviseAnswers={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    expect(screen.getByText("textiles")).toBeInTheDocument();

    // Remove "textiles"
    const removeBtn = screen.getByRole("button", { name: /remove interest textiles/i });
    await user.click(removeBtn);

    // "textiles" chip is removed
    expect(screen.queryByText("textiles")).not.toBeInTheDocument();
    expect(screen.getByText("craft traditions")).toBeInTheDocument();

    // Continue with remaining topic
    const continueBtn = screen.getByRole("button", {
      name: /continue to visit preferences →/i,
    });
    await user.click(continueBtn);

    expect(handleContinue).toHaveBeenCalledWith(["craft traditions"]);
  });

  it("allows adding a custom topic and submitting it with the confirmed payload", async () => {
    const user = userEvent.setup();
    const handleContinue = vi.fn();

    render(
      <CulturalCompassReveal
        initialInterests={["textiles"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        onConfirmAndContinue={handleContinue}
        onReviseAnswers={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/add an additional topic/i);
    await user.type(input, "Stepwells");

    const addBtn = screen.getByRole("button", { name: /\+ add topic/i });
    await user.click(addBtn);

    // New topic appears
    expect(screen.getByText("Stepwells")).toBeInTheDocument();

    // Click continue
    const continueBtn = screen.getByRole("button", {
      name: /continue to visit preferences →/i,
    });
    await user.click(continueBtn);

    expect(handleContinue).toHaveBeenCalledWith(["textiles", "Stepwells"]);
  });

  it("preserves manual entries and clearly identifies manual provenance", () => {
    render(
      <CulturalCompassReveal
        initialInterests={["Court textiles", "textiles"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        manualInterests={["Court textiles"]}
        onConfirmAndContinue={vi.fn()}
        onReviseAnswers={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    // Manual interest displayed with manual provenance
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Manual entry")).toBeInTheDocument();

    // Compass interest displayed with choice provenance
    expect(screen.getByText("textiles")).toBeInTheDocument();
  });

  it("enforces the 1–5 interest limit and disables continue when exceeding 5 topics", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompassReveal
        initialInterests={[
          "Topic 1",
          "Topic 2",
          "Topic 3",
          "Topic 4",
          "Topic 5",
          "Topic 6",
        ]}
        provenance={[]}
        answers={{}}
        onConfirmAndContinue={vi.fn()}
        onReviseAnswers={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    // Capacity alert is shown
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Discovery capacity limit reached/i)).toBeInTheDocument();

    // Continue button must be disabled
    const continueBtn = screen.getByRole("button", {
      name: /continue to visit preferences →/i,
    });
    expect(continueBtn).toBeDisabled();

    // Remove one topic
    const removeBtn = screen.getByRole("button", { name: /remove interest topic 6/i });
    await user.click(removeBtn);

    // Now 5 topics remain -> alert clears and continue button is enabled
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(continueBtn).toBeEnabled();
  });

  it("triggers onReviseAnswers when 'Revise compass comparisons' is clicked", async () => {
    const user = userEvent.setup();
    const handleRevise = vi.fn();

    render(
      <CulturalCompassReveal
        initialInterests={["textiles"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        onConfirmAndContinue={vi.fn()}
        onReviseAnswers={handleRevise}
        onExitToManual={vi.fn()}
      />
    );

    const reviseBtn = screen.getByRole("button", {
      name: /↺ revise compass comparisons/i,
    });
    await user.click(reviseBtn);

    expect(handleRevise).toHaveBeenCalledTimes(1);
  });

  it("triggers onExitToManual when exit button is clicked", async () => {
    const user = userEvent.setup();
    const handleExit = vi.fn();

    render(
      <CulturalCompassReveal
        initialInterests={["textiles"]}
        provenance={MOCK_PROVENANCE}
        answers={{ textiles_vs_contemporary_studio: "option_a" }}
        onConfirmAndContinue={vi.fn()}
        onReviseAnswers={vi.fn()}
        onExitToManual={handleExit}
      />
    );

    const exitBtn = screen.getByRole("button", { name: /exit to manual entry ✕/i });
    await user.click(exitBtn);

    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});

describe("deriveCulturalDirection Helper — Deterministic Title Rules", () => {
  it("derives Living Craft & Artisan Heritage for craft/textiles", () => {
    const dir = deriveCulturalDirection(["textiles", "craft traditions"]);
    expect(dir.id).toBe("living_craft_traditions");
    expect(dir.title).toBe("Living Craft & Artisan Heritage");
  });

  it("derives Historic Architecture & Urban Memory for heritage architecture", () => {
    const dir = deriveCulturalDirection(["heritage architecture", "history"]);
    expect(dir.id).toBe("historic_architecture_and_memory");
    expect(dir.title).toBe("Historic Architecture & Urban Memory");
  });

  it("derives Contemporary Form & Spatial Design for contemporary art & design", () => {
    const dir = deriveCulturalDirection(["contemporary art", "modernist architecture"]);
    expect(dir.id).toBe("contemporary_design_and_form");
    expect(dir.title).toBe("Contemporary Form & Spatial Design");
  });

  it("derives Textile Heritage & Modern Form for mixed craft + modernist", () => {
    const dir = deriveCulturalDirection(["textiles", "modernist architecture"]);
    expect(dir.id).toBe("craft_and_contemporary_dialogue");
    expect(dir.title).toBe("Textile Heritage & Modern Form");
  });

  it("derives Visual Art & Communal Celebration for fine art + festivals", () => {
    const dir = deriveCulturalDirection(["visual arts", "cultural festivals"]);
    expect(dir.id).toBe("visual_and_performing_dialogue");
    expect(dir.title).toBe("Visual Art & Communal Celebration");
  });

  it("derives Open Cultural Curiosity when empty", () => {
    const dir = deriveCulturalDirection([]);
    expect(dir.id).toBe("open_curiosity");
    expect(dir.title).toBe("Open Cultural Curiosity");
  });
});
