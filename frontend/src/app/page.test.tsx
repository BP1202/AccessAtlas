import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";
import { OUTCOME_LABELS } from "@/lib/constants/labels";

describe("Landing Page (HomePage) — Visitor-First Experience", () => {
  it("renders main visitor-focused headline and lead text", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /find your kind of cultural experience/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Culture, on your terms/i)).toBeInTheDocument();
    expect(screen.getByText(/Starting with Ahmedabad/i)).toBeInTheDocument();
  });

  it("contains primary CTA linking to /explore and secondary CTA linking to /how-it-works", () => {
    render(<HomePage />);
    const exploreCta = screen.getByRole("link", {
      name: /explore ahmedabad/i,
    });
    expect(exploreCta).toBeInTheDocument();
    expect(exploreCta).toHaveAttribute("href", "/explore");

    const howItWorksCta = screen.getByRole("link", {
      name: /how it works/i,
    });
    expect(howItWorksCta).toBeInTheDocument();
    expect(howItWorksCta).toHaveAttribute("href", "/how-it-works");
  });

  it("presents the 3 assessment states in visitor-friendly language", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /understanding visit details/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(OUTCOME_LABELS.VERIFIED_FIT).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(OUTCOME_LABELS.NEEDS_CONFIRMATION).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(OUTCOME_LABELS.REQUIREMENT_CONFLICT).length
    ).toBeGreaterThan(0);
  });

  it("lists the three reviewed Ahmedabad cultural spaces with authentic descriptions", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /cultural spaces in ahmedabad/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Calico Museum of Textiles")).toBeInTheDocument();
    expect(screen.getByText("Kasturbhai Lalbhai Museum")).toBeInTheDocument();
    expect(screen.getByText("Conflictorium")).toBeInTheDocument();
  });

  it("strictly excludes hackathon branding and technical architecture terminology", () => {
    const { container } = render(<HomePage />);
    const pageContent = container.textContent?.toLowerCase() || "";

    // Negative assertions preventing developer jargon leak
    expect(pageContent).not.toContain("hackathon");
    expect(pageContent).not.toContain("powered by qloo");
    expect(pageContent).not.toContain("qloo agentic");
    expect(pageContent).not.toContain("possibility engine");
    expect(pageContent).not.toContain("langgraph");
    expect(pageContent).not.toContain("fastapi");
    expect(pageContent).not.toContain("pydantic");
    expect(pageContent).not.toContain("phase 1 foundation active");
    expect(pageContent).not.toContain("architecture & privacy invariants");
    expect(pageContent).not.toContain("post /api/v1/discover");
  });
});
