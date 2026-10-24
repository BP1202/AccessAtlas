import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasteMemoryPanel } from "./TasteMemoryPanel";
import { createInitialTasteMemory, addExplicitInterest, addCurrentOutingInterest, setCompassState } from "@/lib/taste";

describe("TasteMemoryPanel Component — Inspection & Editing Controls", () => {
  it("renders compact panel with total count pill", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addCurrentOutingInterest(memory, "Textiles");

    render(<TasteMemoryPanel memory={memory} onUpdateMemory={vi.fn()} />);

    expect(screen.getByText(/Your Cultural Journal/i)).toBeInTheDocument();
    expect(screen.getByText(/1 saved/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /review your cultural notes ↓/i })).toBeInTheDocument();
  });

  it("expands to reveal all 4 separated categories and allows collapsing", async () => {
    const user = userEvent.setup();
    const memory = createInitialTasteMemory();

    render(<TasteMemoryPanel memory={memory} onUpdateMemory={vi.fn()} />);

    const toggleBtn = screen.getByRole("button", { name: /review your cultural notes ↓/i });
    await user.click(toggleBtn);

    expect(screen.getByText(/1\. Focus for This Outing/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. My Stated Interests/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Suggested from Cultural Compass/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Saved for Another Outing/i)).toBeInTheDocument();

    // Collapse
    const hideBtn = screen.getByRole("button", { name: /hide journal ↑/i });
    await user.click(hideBtn);

    expect(screen.queryByText(/1\. Focus for This Outing/i)).not.toBeInTheDocument();
  });

  it("allows adding a custom general interest and fires onUpdateMemory", async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    const memory = createInitialTasteMemory();

    render(
      <TasteMemoryPanel
        memory={memory}
        onUpdateMemory={handleUpdate}
        defaultExpanded={true}
      />
    );

    const input = screen.getByPlaceholderText(/add another cultural interest\.\.\./i);
    await user.type(input, "Stepwell geometry");

    const addBtn = screen.getByRole("button", { name: /\+ add/i });
    await user.click(addBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updated = handleUpdate.mock.calls[0][0];
    expect(updated.explicitInterests).toContain("Stepwell geometry");
  });

  it("allows adding an interest to this outing and saving for later", async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Haveli woodwork");

    render(
      <TasteMemoryPanel
        memory={memory}
        onUpdateMemory={handleUpdate}
        defaultExpanded={true}
      />
    );

    // Click "+ This outing" on general interest
    const addToOutingBtn = screen.getByRole("button", { name: /\+ this outing/i });
    await user.click(addToOutingBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updated = handleUpdate.mock.calls[0][0];
    expect(updated.currentOutingInterests).toContain("Haveli woodwork");
  });

  it("displays compass suggested interests with provenance badges", () => {
    let memory = createInitialTasteMemory();
    memory = setCompassState(
      memory,
      { textiles_vs_contemporary_studio: "option_a" },
      {
        interests: ["Textiles"],
        provenance: [
          {
            interest: "Textiles",
            sourceQuestionId: "textiles_vs_contemporary_studio",
            sourceOptionId: "historic_textile_workshop",
            choice: "option_a",
            rationale: "Selected workshop",
          },
        ],
        totalQuestionsAnswered: 1,
        hasAnswers: true,
        exceedsDiscoveryLimit: false,
        discoveryLimit: 5,
        advisories: [],
      }
    );

    render(
      <TasteMemoryPanel
        memory={memory}
        onUpdateMemory={vi.fn()}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText("Textiles")).toBeInTheDocument();
    expect(screen.getByText(/From: Compass/i)).toBeInTheDocument();
  });

  it("handles reset action with confirmation", async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");

    render(
      <TasteMemoryPanel
        memory={memory}
        onUpdateMemory={handleUpdate}
        defaultExpanded={true}
      />
    );

    const resetBtn = screen.getByRole("button", { name: /reset notes/i });
    await user.click(resetBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const reset = handleUpdate.mock.calls[0][0];
    expect(reset.explicitInterests).toEqual([]);
    expect(reset.currentOutingInterests).toEqual([]);

    confirmSpy.mockRestore();
  });
});
