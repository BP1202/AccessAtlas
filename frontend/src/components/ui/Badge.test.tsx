import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge component", () => {
  it("renders text content correctly", () => {
    render(<Badge>Verified Fit</Badge>);
    expect(screen.getByText("Verified Fit")).toBeInTheDocument();
  });

  it("applies correct variant styling for PossibilityOutcome", () => {
    const { rerender } = render(
      <Badge variant="VERIFIED_FIT">Verified</Badge>
    );
    expect(screen.getByText("Verified")).toHaveClass("bg-emerald-100");

    rerender(<Badge variant="NEEDS_CONFIRMATION">Confirmation</Badge>);
    expect(screen.getByText("Confirmation")).toHaveClass("bg-amber-100");

    rerender(<Badge variant="REQUIREMENT_CONFLICT">Conflict</Badge>);
    expect(screen.getByText("Conflict")).toHaveClass("bg-rose-100");
  });
});
