import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./Heading";

describe("Heading primitive", () => {
  it("renders heading with correct level tag and text", () => {
    render(<Heading level={1} title="Cultural Discovery" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Cultural Discovery");
  });

  it("renders editorial eyebrow and description", () => {
    render(
      <Heading
        level={2}
        eyebrow="Stage 01 · Cultural Curiosity"
        title="Curated Sparks"
        description="Choose topics that spark your interest."
      />
    );
    expect(
      screen.getByText("Stage 01 · Cultural Curiosity")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Choose topics that spark your interest.")
    ).toBeInTheDocument();
  });

  it("supports route motif divider", () => {
    const { container } = render(
      <Heading level={3} title="Ahmedabad Connections" showRouteMotif />
    );
    expect(container.querySelector(".atlas-route-divider")).toBeInTheDocument();
  });
});
