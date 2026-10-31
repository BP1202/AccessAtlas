import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CurrentOutingControls,
  DIFFERENT_SPARKS,
} from "./CurrentOutingControls";
import {
  createInitialTasteMemory,
  addExplicitInterest,
  applyUsualInterestsToOuting,
  setDifferentTodayOuting,
  updatePracticalRequirement,
} from "@/lib/taste";

describe("CurrentOutingControls Component (Issue 08)", () => {
  it("renders the headline and 3 distinct outing modes", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    const onUpdate = vi.fn();

    render(<CurrentOutingControls memory={memory} onUpdateMemory={onUpdate} />);

    expect(
      screen.getByText("Your usual interests are still here. What would you like to explore today?")
    ).toBeInTheDocument();

    expect(screen.getByRole("tab", { name: /Explore my usual interests/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Explore something different today/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Enter a specific interest for this outing/i })
    ).toBeInTheDocument();

    // Default mode is usual
    expect(screen.getByRole("tab", { name: /Explore my usual interests/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("selects 'Explore something different today' and toggles a spark", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = applyUsualInterestsToOuting(memory);

    const onUpdate = vi.fn();

    const { rerender } = render(
      <CurrentOutingControls memory={memory} onUpdateMemory={onUpdate} />
    );

    // Click 'Explore something different today'
    const differentTab = screen.getByRole("tab", { name: /Explore something different today/i });
    fireEvent.click(differentTab);

    expect(onUpdate).toHaveBeenCalled();
    const updatedMemory = onUpdate.mock.calls[0][0];
    expect(updatedMemory.outingMode).toBe("different");
    expect(updatedMemory.isOutingOverridden).toBe(true);

    // Rerender with the new state
    rerender(<CurrentOutingControls memory={updatedMemory} onUpdateMemory={onUpdate} />);

    // Shows different sparks
    const sparkName = DIFFERENT_SPARKS[0].name;
    expect(screen.getByText(sparkName)).toBeInTheDocument();

    // Shows reassurance notice that usual interests remain safe
    expect(screen.getByText(/Safe in your journal:/i)).toBeInTheDocument();
  });

  it("enters a specific interest for this outing in custom mode", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Heritage architecture");
    memory = applyUsualInterestsToOuting(memory);

    const onUpdate = vi.fn();

    const { rerender } = render(
      <CurrentOutingControls memory={memory} onUpdateMemory={onUpdate} />
    );

    // Switch to custom mode tab
    const customTab = screen.getByRole("tab", {
      name: /Enter a specific interest for this outing/i,
    });
    fireEvent.click(customTab);

    // Emulate state update to custom mode
    const customModeMemory = {
      ...memory,
      outingMode: "custom" as const,
      isOutingOverridden: false,
    };
    rerender(<CurrentOutingControls memory={customModeMemory} onUpdateMemory={onUpdate} />);

    // Fill in custom topic input
    const input = screen.getByTestId("custom-outing-input");
    fireEvent.change(input, { target: { value: "Contemporary art" } });

    // Submit form
    const applyBtn = screen.getByTestId("apply-custom-outing-btn");
    fireEvent.click(applyBtn);

    expect(onUpdate).toHaveBeenCalled();
    const resultMemory = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(resultMemory.outingMode).toBe("custom");
    expect(resultMemory.isOutingOverridden).toBe(true);
    expect(resultMemory.currentOutingInterests).toEqual(["Contemporary art"]);
    // General interests intact
    expect(resultMemory.explicitInterests).toEqual(["Heritage architecture"]);
  });

  it("clears the override and restores usual interests when button is clicked", () => {
    let memory = createInitialTasteMemory();
    memory = addExplicitInterest(memory, "Textiles");
    memory = addExplicitInterest(memory, "Heritage havelis");
    memory = applyUsualInterestsToOuting(memory);
    // Active override
    memory = setDifferentTodayOuting(memory, ["Contemporary art"]);

    const onUpdate = vi.fn();

    render(<CurrentOutingControls memory={memory} onUpdateMemory={onUpdate} />);

    // Click '↺ Switch back to usual interests'
    const switchBackBtn = screen.getByTestId("switch-back-usual-btn");
    fireEvent.click(switchBackBtn);

    expect(onUpdate).toHaveBeenCalled();
    const restoredMemory = onUpdate.mock.calls[0][0];
    expect(restoredMemory.outingMode).toBe("usual");
    expect(restoredMemory.isOutingOverridden).toBe(false);
    expect(restoredMemory.currentOutingInterests).toEqual(["Textiles", "Heritage havelis"]);
    expect(restoredMemory.explicitInterests).toEqual(["Textiles", "Heritage havelis"]);
  });

  it("prioritizes interests when selections exceed the 5-item limit", () => {
    let memory = createInitialTasteMemory();
    // Artificially construct memory with 6 outing interests
    memory = {
      ...memory,
      currentOutingInterests: [
        "Textiles",
        "Woodblock",
        "Haveli woodwork",
        "Contemporary art",
        "Stepwells",
        "Sound archives",
      ],
    };

    const onUpdate = vi.fn();

    render(<CurrentOutingControls memory={memory} onUpdateMemory={onUpdate} />);

    // Prioritization panel is shown
    expect(screen.getByTestId("outing-prioritization-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/Prioritize your interests for today \(1–5 topics\)/i)
    ).toBeInTheDocument();

    // Select 2 items to prioritize
    const item1 = screen.getByRole("button", { name: /Textiles/i });
    fireEvent.click(item1);

    const item2 = screen.getByRole("button", { name: /Contemporary art/i });
    fireEvent.click(item2);

    // Confirm priorities
    const confirmBtn = screen.getByRole("button", {
      name: /Confirm \(2\/5\) prioritized focus/i,
    });
    fireEvent.click(confirmBtn);

    expect(onUpdate).toHaveBeenCalled();
    const prioritizedMemory = onUpdate.mock.calls[0][0];
    expect(prioritizedMemory.currentOutingInterests).toEqual(["Textiles", "Contemporary art"]);
  });

  it("reassures visitor that practical requirements remain independent and intact", () => {
    let memory = createInitialTasteMemory();
    memory = updatePracticalRequirement(memory, "step_free_entrance", "mandatory");

    render(<CurrentOutingControls memory={memory} onUpdateMemory={vi.fn()} />);

    expect(
      screen.getByText(/Practical requirements \(accessibility, visit timing & companion needs\) are preserved independently/i)
    ).toBeInTheDocument();
  });
});
