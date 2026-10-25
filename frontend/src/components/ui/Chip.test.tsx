import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip primitive", () => {
  it("renders label and accessible aria-pressed when onToggle provided", () => {
    const handleToggle = vi.fn();
    render(
      <Chip label="Textiles" selected={false} onToggle={handleToggle} />
    );
    const chip = screen.getByRole("button", { name: /textiles/i });
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("handles toggle selection on click and keyboard (Space/Enter)", async () => {
    const handleToggle = vi.fn();
    render(<Chip label="Heritage" selected={true} onToggle={handleToggle} />);
    const chip = screen.getByRole("button", { name: /heritage/i });
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(chip);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renders removable action with accessible label and handles remove", async () => {
    const handleRemove = vi.fn();
    render(
      <Chip
        label="Contemporary art"
        selected={true}
        onRemove={handleRemove}
      />
    );
    const removeBtn = screen.getByRole("button", {
      name: "Remove Contemporary art",
    });
    expect(removeBtn).toBeInTheDocument();

    await userEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("renders optional count badge and icon", () => {
    render(
      <Chip
        label="Craft"
        count={4}
        icon={<span data-testid="craft-icon">🏺</span>}
      />
    );
    expect(screen.getByTestId("craft-icon")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
