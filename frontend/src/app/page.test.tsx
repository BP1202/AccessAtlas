import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("Landing Page (HomePage) — Visitor-First Experience", () => {
  it("renders main visitor-focused headline and lead text", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /follow your curiosity/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Currently exploring Ahmedabad · More cities to come/i)
    ).toBeInTheDocument();
  });

  it("contains primary CTA linking to /explore and secondary CTA linking to /how-it-works", () => {
    render(<HomePage />);
    const exploreCta = screen.getAllByRole("link", {
      name: /discover experiences/i,
    })[0];
    expect(exploreCta).toBeInTheDocument();
    expect(exploreCta).toHaveAttribute("href", "/explore");

    const howItWorksCta = screen.getByRole("link", {
      name: /see how it works/i,
    });
    expect(howItWorksCta).toBeInTheDocument();
    expect(howItWorksCta).toHaveAttribute("href", "/how-it-works");
  });

  it("presents the 3-stage journey in visitor-friendly language", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /how discovery connects to planning/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Cultural curiosity")).toBeInTheDocument();
    expect(screen.getByText("Your visit preferences")).toBeInTheDocument();
    expect(screen.getByText("Your Visit Plan")).toBeInTheDocument();
  });

  it("lists the three reviewed Ahmedabad cultural spaces with authentic descriptions", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /reviewed cultural spaces/i,
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
