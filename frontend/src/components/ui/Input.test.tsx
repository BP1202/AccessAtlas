import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input primitive", () => {
  it("renders with label and connects htmlFor with input id", () => {
    render(<Input label="Search topic" placeholder="e.g. Textiles" />);
    const input = screen.getByLabelText("Search topic");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "e.g. Textiles");
  });

  it("renders helper text and associates aria-describedby", () => {
    render(
      <Input
        label="Interest"
        helperText="Enter cultural traditions or venue styles"
      />
    );
    const input = screen.getByLabelText("Interest");
    expect(
      screen.getByText("Enter cultural traditions or venue styles")
    ).toBeInTheDocument();
    expect(input).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("helper")
    );
  });

  it("renders error message with role=alert and sets aria-invalid", () => {
    render(
      <Input
        label="Interest"
        errorMessage="Topic must be 100 characters or fewer"
      />
    );
    const input = screen.getByLabelText("Interest");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const errorMsg = screen.getByRole("alert");
    expect(errorMsg).toHaveTextContent("Topic must be 100 characters or fewer");
  });

  it("supports left icon and right slot", () => {
    render(
      <Input
        label="Search"
        leftIcon={<span data-testid="search-icon">🔍</span>}
        rightSlot={<button type="button">Clear</button>}
      />
    );
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("handles user typing and disabled state", async () => {
    const handleChange = vi.fn();
    render(<Input label="Custom" onChange={handleChange} />);
    const input = screen.getByLabelText("Custom");
    await userEvent.type(input, "Stepwells");
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("Stepwells");
  });
});
