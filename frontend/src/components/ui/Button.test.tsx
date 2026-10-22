import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders children correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button", { name: /disabled button/i })).toBeDisabled();
  });

  it("displays loading state and sets aria-busy when isLoading is true", () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
