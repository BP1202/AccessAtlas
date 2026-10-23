import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CulturalCompass } from "./CulturalCompass";

describe("CulturalCompass Component — User Journey & State", () => {
  it("renders the initial state with the first approved question and progress indicator", () => {
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    // Header badge and headline
    expect(screen.getByText(/Cultural Compass/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Let's find a direction worth exploring/i)
    ).toBeInTheDocument();

    // First question prompt & context
    expect(
      screen.getByRole("heading", {
        name: /historic textile workshop versus contemporary design studio/i,
      })
    ).toBeInTheDocument();

    // Two options
    expect(screen.getByText("Historic textile workshop")).toBeInTheDocument();
    expect(screen.getByText("Contemporary design studio")).toBeInTheDocument();

    // Both and Neither options
    expect(screen.getByRole("button", { name: /both appeal to me/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /neither \/ skip comparison/i })).toBeInTheDocument();

    // Accessible progress bar
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "1");
    expect(progressBar).toHaveAttribute("aria-valuemax", "5");

    // Exit link is visible
    expect(
      screen.getAllByRole("button", { name: /enter my own interests instead/i }).length
    ).toBeGreaterThanOrEqual(1);

    // Next button should be disabled when nothing selected
    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    expect(nextBtn).toBeDisabled();
  });

  it("handles Option A selection and enables the Next button", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const optionA = screen.getByRole("button", { name: /historic textile workshop/i });
    expect(optionA).toHaveAttribute("aria-pressed", "false");

    await user.click(optionA);

    expect(optionA).toHaveAttribute("aria-pressed", "true");
    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    expect(nextBtn).toBeEnabled();
  });

  it("handles Option B selection", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const optionB = screen.getByRole("button", { name: /contemporary design studio/i });
    await user.click(optionB);

    expect(optionB).toHaveAttribute("aria-pressed", "true");
    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    expect(nextBtn).toBeEnabled();
  });

  it("handles Both selection", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const bothBtn = screen.getByRole("button", { name: /both appeal to me/i });
    await user.click(bothBtn);

    expect(bothBtn).toHaveAttribute("aria-pressed", "true");
    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    expect(nextBtn).toBeEnabled();
  });

  it("handles Neither / Skip selection", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const neitherBtn = screen.getByRole("button", { name: /neither \/ skip comparison/i });
    await user.click(neitherBtn);

    expect(neitherBtn).toHaveAttribute("aria-pressed", "true");
    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    expect(nextBtn).toBeEnabled();
  });

  it("allows changing an answer on the current screen", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const optionA = screen.getByRole("button", { name: /historic textile workshop/i });
    const optionB = screen.getByRole("button", { name: /contemporary design studio/i });

    // Choose Option A first
    await user.click(optionA);
    expect(optionA).toHaveAttribute("aria-pressed", "true");
    expect(optionB).toHaveAttribute("aria-pressed", "false");

    // Change mind and select Option B
    await user.click(optionB);
    expect(optionA).toHaveAttribute("aria-pressed", "false");
    expect(optionB).toHaveAttribute("aria-pressed", "true");
  });

  it("advances progress and updates the question on Next", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    // Answer Q1 with Option A
    const optionA = screen.getByRole("button", { name: /historic textile workshop/i });
    await user.click(optionA);

    const nextBtn = screen.getByRole("button", { name: /next question →/i });
    await user.click(nextBtn);

    // Now on Q2
    expect(screen.getByText(/Question 2 of 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /mountain craft village versus coastal heritage town/i,
      })
    ).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "2");

    // Previous button should now be available
    expect(screen.getByRole("button", { name: /← previous/i })).toBeInTheDocument();
  });

  it("navigates backward and preserves previous answers", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    // Answer Q1 with Option A
    await user.click(screen.getByRole("button", { name: /historic textile workshop/i }));
    await user.click(screen.getByRole("button", { name: /next question →/i }));

    // Answer Q2 with Both
    await user.click(screen.getByRole("button", { name: /both appeal to me/i }));

    // Click Previous
    const prevBtn = screen.getByRole("button", { name: /← previous/i });
    await user.click(prevBtn);

    // Back on Q1: Option A should still be selected
    expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    const optionA = screen.getByRole("button", { name: /historic textile workshop/i });
    expect(optionA).toHaveAttribute("aria-pressed", "true");
  });

  it("supports skipping a question directly via 'Skip this question' link", async () => {
    const user = userEvent.setup();
    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={vi.fn()}
      />
    );

    const skipLink = screen.getByRole("button", { name: /skip this question →/i });
    await user.click(skipLink);

    // Advances to Q2
    expect(screen.getByText(/Question 2 of 5/i)).toBeInTheDocument();
  });

  it("triggers onExitToManual when exit button is clicked", async () => {
    const user = userEvent.setup();
    const handleExit = vi.fn();

    render(
      <CulturalCompass
        onComplete={vi.fn()}
        onExitToManual={handleExit}
      />
    );

    const exitBtns = screen.getAllByRole("button", { name: /enter my own interests instead/i });
    await user.click(exitBtns[0]);

    expect(handleExit).toHaveBeenCalledTimes(1);
  });

  it("completes all 5 questions, renders summary, and delivers completion payload to onComplete", async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();

    render(
      <CulturalCompass
        onComplete={handleComplete}
        onExitToManual={vi.fn()}
        existingInterests={["Heritage architecture"]}
      />
    );

    // Q1: Choose Option A (historic_textile_workshop -> textiles, craft traditions)
    await user.click(screen.getByRole("button", { name: /historic textile workshop/i }));
    await user.click(screen.getByRole("button", { name: /next question →/i }));

    // Q2: Choose Neither / Skip
    await user.click(screen.getByRole("button", { name: /neither \/ skip comparison/i }));
    await user.click(screen.getByRole("button", { name: /next question →/i }));

    // Q3: Choose Option A (quiet_gallery -> visual arts, fine art)
    await user.click(screen.getByRole("button", { name: /quiet contemplative gallery/i }));
    await user.click(screen.getByRole("button", { name: /next question →/i }));

    // Q4: Choose Both (traditional_making_techniques + experimental_visual_art)
    await user.click(screen.getByRole("button", { name: /both appeal to me/i }));
    await user.click(screen.getByRole("button", { name: /next question →/i }));

    // Q5: Choose Option B (modern_design -> modernist architecture, design)
    await user.click(screen.getByRole("button", { name: /modern design/i }));

    // On final question, button text changes to "Review directions →"
    const reviewBtn = screen.getByRole("button", { name: /review directions →/i });
    await user.click(reviewBtn);

    // Summary screen should now appear
    expect(screen.getByTestId("cultural-compass-summary")).toBeInTheDocument();
    expect(
      screen.getByText(/Cultural directions surfaced from your choices/i)
    ).toBeInTheDocument();

    // Verify existing manual interest "Heritage architecture" is preserved
    expect(screen.getByText("Heritage architecture")).toBeInTheDocument();

    // Verify surfaced cultural interests
    expect(screen.getByText("textiles")).toBeInTheDocument();
    expect(screen.getByText("craft traditions")).toBeInTheDocument();

    // Click "Apply directions to visit →"
    const applyBtn = screen.getByRole("button", { name: /apply directions to visit →/i });
    await user.click(applyBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
    const [finalAnswers, finalInterests] = handleComplete.mock.calls[0];

    // Verify answers dictionary
    expect(finalAnswers.textiles_vs_contemporary_studio).toBe("option_a");
    expect(finalAnswers.mountain_craft_village_vs_coastal_heritage_town).toBe("neither");
    expect(finalAnswers.quiet_gallery_vs_lively_festival).toBe("option_a");
    expect(finalAnswers.traditional_techniques_vs_experimental_art).toBe("both");
    expect(finalAnswers.historic_architecture_vs_modern_design).toBe("option_b");

    // Verify manual interest was preserved and prepended
    expect(finalInterests[0]).toBe("Heritage architecture");
    expect(finalInterests).toContain("textiles");
    expect(finalInterests).toContain("craft traditions");
  });
});
