import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterestSelector } from "./InterestSelector";

describe("InterestSelector", () => {
  it("renders suggestions and allows selecting chips", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleNext = vi.fn();

    render(
      <InterestSelector
        selectedInterests={[]}
        onChange={handleChange}
        onNext={handleNext}
      />
    );

    // Initial state: Continue button disabled
    const nextBtn = screen.getByRole("button", { name: /continue to visit preferences/i });
    expect(nextBtn).toBeDisabled();

    // Click "Textiles" suggestion chip
    const textilesChip = screen.getByRole("button", { name: /textiles/i });
    await user.click(textilesChip);

    expect(handleChange).toHaveBeenCalledWith(["Textiles"]);
  });

  it("allows typing and submitting a custom interest with Enter", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["Textiles"]}
        onChange={handleChange}
        onNext={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    await user.type(input, "Stepwells{Enter}");

    expect(handleChange).toHaveBeenCalledWith(["Textiles", "Stepwells"]);
  });

  it("removes selected interest when remove button clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["Textiles", "History"]}
        onChange={handleChange}
        onNext={vi.fn()}
      />
    );

    const removeBtn = screen.getByRole("button", { name: /remove interest textiles/i });
    await user.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith(["History"]);
  });

  it("enforces maximum of 5 interests and prevents duplicates", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["1", "2", "3", "4", "5"]}
        onChange={handleChange}
        onNext={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. Woodblock printing/i);
    expect(input).toBeDisabled();

    // Suggestions cannot add when maxed out
    const chip = screen.getByRole("button", { name: /textiles/i });
    await user.click(chip);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("calls onNext when continue button is clicked with selected interests", async () => {
    const user = userEvent.setup();
    const handleNext = vi.fn();

    render(
      <InterestSelector
        selectedInterests={["Textiles"]}
        onChange={vi.fn()}
        onNext={handleNext}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /continue to visit preferences/i });
    expect(nextBtn).toBeEnabled();
    await user.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });
});
