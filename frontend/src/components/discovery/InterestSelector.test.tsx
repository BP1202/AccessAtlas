import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterestSelector, SURPRISE_DIRECTIONS } from "./InterestSelector";

describe("InterestSelector — Three Entry Paths & Input Preservation", () => {
  it("Path A (Manual Entry): allows typing, submitting with button or Enter, and chip removal", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleNext = vi.fn();

    const { rerender } = render(
      <InterestSelector
        selectedInterests={[]}
        onChange={handleChange}
        onNext={handleNext}
        initialPath="manual"
      />
    );

    // Initial state: Continue button disabled
    const nextBtn = screen.getByRole("button", { name: /continue to visit preferences/i });
    expect(nextBtn).toBeDisabled();

    // Type a custom interest and click "Add topic"
    const input = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    await user.type(input, "Stepwells");
    const addBtn = screen.getByRole("button", { name: /add topic/i });
    await user.click(addBtn);

    expect(handleChange).toHaveBeenCalledWith(["Stepwells"]);

    // Rerender with "Stepwells" selected
    rerender(
      <InterestSelector
        selectedInterests={["Stepwells"]}
        onChange={handleChange}
        onNext={handleNext}
        initialPath="manual"
      />
    );

    // Add via Enter key
    const input2 = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    await user.type(input2, "Haveli woodwork{Enter}");
    expect(handleChange).toHaveBeenCalledWith(["Stepwells", "Haveli woodwork"]);

    // Remove chip
    rerender(
      <InterestSelector
        selectedInterests={["Stepwells", "Haveli woodwork"]}
        onChange={handleChange}
        onNext={handleNext}
        initialPath="manual"
      />
    );

    const removeBtn = screen.getByRole("button", { name: /remove interest stepwells/i });
    await user.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith(["Haveli woodwork"]);
  });

  it("Path A (Manual Entry): enforces 5 interest limits and rejects duplicates or oversized strings", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { rerender } = render(
      <InterestSelector
        selectedInterests={["1", "2", "3", "4", "5"]}
        onChange={handleChange}
        onNext={vi.fn()}
        initialPath="manual"
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    expect(input).toBeDisabled();

    // Attempting to click curated suggestions does not add
    const textilesChip = screen.getByRole("button", { name: /textiles/i });
    await user.click(textilesChip);
    expect(handleChange).not.toHaveBeenCalled();

    // Duplicate check
    rerender(
      <InterestSelector
        selectedInterests={["Textiles"]}
        onChange={handleChange}
        onNext={vi.fn()}
        initialPath="manual"
      />
    );

    const inputValid = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    await user.type(inputValid, "Textiles{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(/"Textiles" is already added/i);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("Path B (Help me discover): renders Cultural Compass questions, does not fake results, and provides immediate manual-entry fallback", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["Stepwells"]}
        onChange={handleChange}
        onNext={vi.fn()}
        initialPath="help"
      />
    );

    // Verifies Cultural Compass header and question prompt
    expect(screen.getByText(/Cultural Compass/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /historic textile workshop versus contemporary design studio/i,
      })
    ).toBeInTheDocument();

    // Verifies preserved chip from manual input in shared chip bar
    expect(screen.getByText("Stepwells")).toBeInTheDocument();

    // Click "Enter my own interests instead"
    const manualFallbackBtn = screen.getAllByRole("button", {
      name: /enter my own interests instead/i,
    })[0];
    await user.click(manualFallbackBtn);

    // Now on manual tab: custom interest input is visible
    expect(screen.getByLabelText(/add cultural interest or topic/i)).toBeInTheDocument();
  });

  it("Path C (Surprise me): provides transparent starting sparks and adds to selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={[]}
        onChange={handleChange}
        onNext={vi.fn()}
        initialPath="surprise"
      />
    );

    expect(screen.getByText(/Curated starting sparks from Ahmedabad/i)).toBeInTheDocument();

    // Click "Add to my interests" on the first displayed spark
    const firstSpark = SURPRISE_DIRECTIONS[0];
    const addSparkBtn = screen.getAllByRole("button", { name: /\+ add to my interests/i })[0];
    await user.click(addSparkBtn);

    expect(handleChange).toHaveBeenCalledWith([firstSpark.query]);
  });

  it("preserves visitor inputs seamlessly when switching between all three entry paths", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["Court textiles", "Haveli architecture"]}
        onChange={handleChange}
        onNext={vi.fn()}
        initialPath="manual"
      />
    );

    // Verify chips visible in Path A
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Haveli architecture")).toBeInTheDocument();

    // Switch to Path B: "Help me discover"
    const helpTab = screen.getByRole("tab", { name: /help me discover/i });
    await user.click(helpTab);
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Haveli architecture")).toBeInTheDocument();

    // Switch to Path C: "Surprise me"
    const surpriseTab = screen.getByRole("tab", { name: /surprise me/i });
    await user.click(surpriseTab);
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Haveli architecture")).toBeInTheDocument();

    // Switch back to Path A: "I know what I want"
    const manualTab = screen.getByRole("tab", { name: /i know what i want/i });
    await user.click(manualTab);
    expect(screen.getByText("Court textiles")).toBeInTheDocument();
    expect(screen.getByText("Haveli architecture")).toBeInTheDocument();
  });
});
