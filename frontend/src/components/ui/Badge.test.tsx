import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import { OUTCOME_SHORT_LABELS } from "@/lib/constants/labels";

describe("Badge component", () => {
  it("renders text content correctly", () => {
    render(<Badge>Verified match</Badge>);
    expect(screen.getByText("Verified match")).toBeInTheDocument();
  });

  it("applies correct variant styling for PossibilityOutcome", () => {
    const { rerender } = render(
      <Badge variant="VERIFIED_FIT">Verified</Badge>
    );
    expect(screen.getByText("Verified")).toHaveClass("bg-emerald-50");

    rerender(<Badge variant="NEEDS_CONFIRMATION">Confirmation</Badge>);
    expect(screen.getByText("Confirmation")).toHaveClass("bg-amber-50");

    rerender(<Badge variant="REQUIREMENT_CONFLICT">Conflict</Badge>);
    expect(screen.getByText("Conflict")).toHaveClass("bg-rose-50");
  });

  it("supports automatic visitor label rendering when useVisitorLabel is true", () => {
    render(<Badge variant="VERIFIED_FIT" useVisitorLabel />);
    expect(
      screen.getByText(OUTCOME_SHORT_LABELS.VERIFIED_FIT)
    ).toBeInTheDocument();
  });
});
