import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionKit } from "./QuestionKit";
import type { RequirementAssessment } from "@/lib/api/types";

const mockAssessments: RequirementAssessment[] = [
  {
    requirement_id: "req_seating",
    attribute: "seating_available",
    priority: "mandatory",
    scope: "venue",
    outcome: "missing_evidence",
    explanation: "Rest benches are unrecorded in published materials.",
    confirmation_need: "verify availability of seating benches in courtyard",
    evidence_references: [],
  },
  {
    requirement_id: "req_step_free",
    attribute: "step_free_entrance",
    priority: "optional",
    scope: "experience",
    outcome: "missing_evidence",
    explanation: "Ramp incline is not documented in historical survey.",
    confirmation_need: "confirm ramp slope and handrail availability",
    evidence_references: [],
  },
];

describe("QuestionKit", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders questions with metadata badges, scope, priority, and reason needed", () => {
    render(
      <QuestionKit
        venueName="Sidi Saiyyed Mosque"
        questions={[
          "Confirm seating_available: verify availability of seating benches in courtyard",
          "Confirm step_free_entrance: confirm ramp slope and handrail availability",
        ]}
        assessments={mockAssessments}
      />
    );

    expect(screen.getByText("Confirmation Question Kit")).toBeInTheDocument();
    expect(screen.getByText("Ask the venue")).toBeInTheDocument();
    expect(
      screen.getByText(/Because some details are not recorded in published records/i)
    ).toBeInTheDocument();

    // Verify badges on first question
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Relates to: Seating available throughout")).toBeInTheDocument();
    expect(screen.getByText("(mandatory)")).toBeInTheDocument();
    expect(screen.getByText("Venue scope")).toBeInTheDocument();
    expect(screen.getAllByText("Needs Confirmation").length).toBe(2);
    expect(screen.getByText("verify availability of seating benches in courtyard")).toBeInTheDocument();

    // Verify badges on second question
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("Relates to: Step-free entrance")).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    expect(screen.getByText("Experience scope")).toBeInTheDocument();
    expect(screen.getByText("confirm ramp slope and handrail availability")).toBeInTheDocument();

    // Verify non-autonomous disclaimer
    expect(
      screen.getByText(
        /Note: Copying places questions on your clipboard for your own inquiries. AccessAtlas does not contact venues or send automated messages./i
      )
    ).toBeInTheDocument();
  });

  it("supports copying all questions with accessible feedback", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    render(
      <QuestionKit
        venueName="Sidi Saiyyed Mosque"
        questions={[
          "Is seating available in the courtyard?",
          "Are there steps at the entrance?",
        ]}
      />
    );

    const copyAllBtn = screen.getByRole("button", { name: /copy questions to ask/i });
    await user.click(copyAllBtn);

    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining("Questions for Sidi Saiyyed Mosque before visiting:\n\n1. Is seating available in the courtyard?\n2. Are there steps at the entrance?\n\n(Generated via AccessAtlas)")
    );
    expect(await screen.findByText("✓ Copied to clipboard")).toBeInTheDocument();
  });

  it("supports copying an individual question", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    render(
      <QuestionKit
        venueName="Sidi Saiyyed Mosque"
        questions={["Is seating available in the courtyard?"]}
      />
    );

    const copySingleBtn = screen.getByRole("button", { name: "Copy question 1" });
    await user.click(copySingleBtn);

    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(writeTextSpy).toHaveBeenCalledWith(
      "Question for Sidi Saiyyed Mosque:\nIs seating available in the courtyard?\n\n(Via AccessAtlas)"
    );
    expect(await screen.findByText("✓ Copied")).toBeInTheDocument();
  });

  it("supports keyboard interaction for copying", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    render(
      <QuestionKit
        venueName="Sidi Saiyyed Mosque"
        questions={["Is seating available in the courtyard?"]}
      />
    );

    const copyAllBtn = screen.getByRole("button", { name: /copy questions to ask/i });
    copyAllBtn.focus();
    expect(copyAllBtn).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("✓ Copied to clipboard")).toBeInTheDocument();
  });

  it("renders honest empty state when all requirements are verified", () => {
    render(
      <QuestionKit
        venueName="Calico Museum"
        questions={[]}
        hasUnresolvedEvidence={false}
      />
    );

    expect(
      screen.getByText("No additional confirmation questions needed:")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Available published documentation covers the evaluated details for this space./i)
    ).toBeInTheDocument();
    expect(screen.queryByText("Confirmation Question Kit")).not.toBeInTheDocument();
  });

  it("renders honest informational state when evidence is unresolved but no specific question was generated", () => {
    render(
      <QuestionKit
        venueName="Adalaj Stepwell"
        questions={[]}
        hasUnresolvedEvidence={true}
      />
    );

    expect(
      screen.getByText("No specific confirmation questions generated:")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Some participation details remain unrecorded in published records. Inquire directly with venue staff before planning your visit./i
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Confirmation Question Kit")).not.toBeInTheDocument();
  });
});
