import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextTimeDiscoveries } from "./NextTimeDiscoveries";
import { createInitialTasteMemory, addFutureTripInterest } from "@/lib/taste";

describe("NextTimeDiscoveries Component (Issue 09)", () => {
  it("renders heading and clean empty state when no future directions are saved", () => {
    const memory = createInitialTasteMemory();
    render(<NextTimeDiscoveries memory={memory} onUpdateMemory={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Another day, another direction." })
    ).toBeInTheDocument();
    expect(screen.getByTestId("next-time-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/No future directions saved yet/i)).toBeInTheDocument();
  });

  it("renders saved future interests with promotion and removal actions", () => {
    let memory = createInitialTasteMemory();
    memory = addFutureTripInterest(memory, "Court textiles");
    memory = addFutureTripInterest(memory, "Living craft");

    const onUpdate = vi.fn();
    render(<NextTimeDiscoveries memory={memory} onUpdateMemory={onUpdate} />);

    expect(screen.queryByTestId("next-time-empty-state")).not.toBeInTheDocument();
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Living craft")).toBeInTheDocument();

    // Move to today's outing
    const moveBtn = screen.getByTestId("move-to-outing-court-textiles");
    fireEvent.click(moveBtn);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onUpdate.mock.calls[0];
    expect(updatedMemory.currentOutingInterests).toContain("Court textiles");
    expect(updatedMemory.futureTripInterests).not.toContain("Court textiles");
    // Other future interests intact
    expect(updatedMemory.futureTripInterests).toEqual(["Living craft"]);
    expect(explanation).toContain('Moved "Court textiles" into today\'s outing.');
  });

  it("removes a future interest while keeping other saved directions unchanged", () => {
    let memory = createInitialTasteMemory();
    memory = addFutureTripInterest(memory, "Court textiles");
    memory = addFutureTripInterest(memory, "Living craft");

    const onUpdate = vi.fn();
    render(<NextTimeDiscoveries memory={memory} onUpdateMemory={onUpdate} />);

    const removeBtn = screen.getByTestId("remove-future-court-textiles");
    fireEvent.click(removeBtn);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const [updatedMemory, explanation] = onUpdate.mock.calls[0];
    expect(updatedMemory.futureTripInterests).toEqual(["Living craft"]);
    expect(explanation).toContain('Removed "Court textiles" from saved future directions.');
  });
});
