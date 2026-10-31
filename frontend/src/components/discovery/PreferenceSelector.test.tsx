import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PreferenceSelector,
  type PreferenceState,
} from "./PreferenceSelector";
import { SUPPORTED_REQUIREMENTS } from "@/lib/constants/requirements";
import type { EvidenceAttribute } from "@/lib/api/types";

describe("PreferenceSelector", () => {
  const initialPrefs: Record<EvidenceAttribute, PreferenceState> =
    SUPPORTED_REQUIREMENTS.reduce(
      (acc, r) => {
        acc[r.attribute] = "not_specified";
        return acc;
      },
      {} as Record<EvidenceAttribute, PreferenceState>
    );

  it("renders all supported requirements and their descriptions", () => {
    render(
      <PreferenceSelector
        preferences={initialPrefs}
        onChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText("Step-free entrance")).toBeInTheDocument();
    expect(screen.getByText("Wheelchair accommodation policy")).toBeInTheDocument();
    expect(screen.getByText("Advance reservation required")).toBeInTheDocument();
  });

  it("handles tri-state toggling between Not specified, Nice to have, and Essential", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <PreferenceSelector
        preferences={initialPrefs}
        onChange={handleChange}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    // Find the segmented control for step_free_entrance
    const radiogroup = screen.getByRole("radiogroup", {
      name: /step-free entrance/i,
    });
    expect(radiogroup).toBeInTheDocument();

    const niceToHaveBtn = screen.getAllByRole("radio", { name: "Nice to have" })[0];
    await user.click(niceToHaveBtn);
    expect(handleChange).toHaveBeenCalledWith("step_free_entrance", "optional");

    const essentialBtn = screen.getAllByRole("radio", { name: "Essential" })[0];
    await user.click(essentialBtn);
    expect(handleChange).toHaveBeenCalledWith("step_free_entrance", "mandatory");
  });

  it("calls onBack and onSubmit callbacks correctly", async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <PreferenceSelector
        preferences={initialPrefs}
        onChange={vi.fn()}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to interests/i });
    await user.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);

    const submitBtn = screen.getByRole("button", { name: /find cultural experiences/i });
    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
