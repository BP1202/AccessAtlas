import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Landing Page (HomePage) — Visitor-First Experience", () => {
  it("renders approved curiosity-first headline and supporting text from UX_VISION.md", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /what if your next favourite place is somewhere you never thought to look/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AccessAtlas turns vague cultural curiosity into unexpected discoveries/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Currently exploring Ahmedabad · More cities to come/i)
    ).toBeInTheDocument();
  });

  it("provides a dominant cultural search input with primary and secondary discovery actions", async () => {
    const user = userEvent.setup();
    mockPush.mockClear();

    render(<HomePage />);

    const searchInput = screen.getByLabelText(/what cultural experiences are you curious about/i);
    expect(searchInput).toBeInTheDocument();

    const submitBtn = screen.getAllByRole("button", { name: /discover experiences/i })[0];
    expect(submitBtn).toBeInTheDocument();

    // Type query and submit
    await user.type(searchInput, "Haveli courtyards");
    await user.click(submitBtn);

    expect(mockPush).toHaveBeenCalledWith("/explore?interest=Haveli%20courtyards");

    const howItWorksLink = screen.getByRole("link", { name: /see how it works/i });
    expect(howItWorksLink).toBeInTheDocument();
    expect(howItWorksLink).toHaveAttribute("href", "/how-it-works");

    const surpriseBtn = screen.getByRole("button", { name: /surprise me/i });
    expect(surpriseBtn).toBeInTheDocument();
    await user.click(surpriseBtn);
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  it("presents the 3-stage journey in visitor-friendly language without technical jargon", () => {
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
