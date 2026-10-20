import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("Landing Page (HomePage)", () => {
  it("renders main title and lead text", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /find cultural experiences that match your real participation needs/i,
      })
    ).toBeInTheDocument();
  });

  it("displays Ahmedabad pilot badge and status notice", () => {
    render(<HomePage />);
    expect(screen.getByText("Ahmedabad Pilot")).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 Foundation Active/i)).toBeInTheDocument();
  });

  it("showcases the 3-state Possibility Engine outcomes", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /deterministic possibility engine outcomes/i,
      })
    ).toBeInTheDocument();

    expect(screen.getAllByText("Verified Fit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Needs Confirmation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Requirement Conflict").length).toBeGreaterThan(0);
  });

  it("lists the three reviewed Ahmedabad pilot candidate venues", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /reviewed ahmedabad pilot candidates/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(screen.getByText("Kasturbhai Lalbhai Museum")).toBeInTheDocument();
    expect(screen.getByText("Conflictorium")).toBeInTheDocument();
  });

  it("presents privacy invariants without sensitive attribute inference", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /architecture & privacy invariants/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we do not infer disability, medical condition, or protected characteristics/i)
    ).toBeInTheDocument();
  });
});
