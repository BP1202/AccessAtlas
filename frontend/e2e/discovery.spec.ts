import { test, expect } from "@playwright/test";

const mockApiResponse = {
  city: "Ahmedabad",
  cultural_interests: ["Textiles"],
  total_candidates_found: 1,
  candidates_evaluated: 1,
  plans: [
    {
      candidate: {
        entity_id: "qloo_calico_01",
        name: "Calico Museum of Textiles",
        entity_type: "museum",
        disambiguation: "Historic textile collection housed in heritage haveli compounds.",
        tags: [
          { id: "textiles", name: "Textiles" },
          { id: "heritage", name: "Heritage" },
        ],
      },
      resolution_status: "resolved",
      venue_id: "calico_museum",
      possibility_assessment: {
        venue_id: "calico_museum",
        aggregate_outcome: "VERIFIED_FIT",
        evaluation_time: "2026-10-21T10:00:00Z",
        summary: "Verified match against stated requirements.",
        assessments: [
          {
            requirement_id: "req-step_free_entrance",
            attribute: "step_free_entrance",
            priority: "mandatory",
            scope: "venue",
            outcome: "supported",
            explanation: "Ground floor entry is level.",
            evidence_references: [
              {
                attribute: "step_free_entrance",
                scope: "venue",
                value: true,
                source: {
                  source_type: "official_website",
                  title: "Calico Museum Official Guide",
                  url: "https://calicomuseum.org",
                  verified_at: "2026-10-15T00:00:00Z",
                },
              },
            ],
          },
        ],
      },
      supported_findings: ["Main entrance is step-free from visitor gate."],
      unresolved_gaps: [],
      confirmation_questions: ["Are photography permits required inside the courtyard?"],
      suggested_next_actions: ["Book guided tour slots 4 weeks in advance."],
      provenance_sources: [
        {
          source_type: "official_website",
          title: "Calico Museum Official Guide",
          url: "https://calicomuseum.org",
          verified_at: "2026-10-15T00:00:00Z",
        },
      ],
    },
  ],
  workflow_summary: "Evaluated 1 candidate against verified records.",
};

test.describe("Visitor-First Discovery Experience (/explore)", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API call to discovery endpoint with mock data
    await page.route("**/api/v1/discover", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockApiResponse),
      });
    });
  });

  test("completes two-stage journey, reviews candidate, expands visit plan, and interacts with question kit", async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions for copying
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // 1. Stage 1: Curiosity & Interests
    await expect(
      page.getByRole("heading", { name: /what cultural experiences spark your curiosity\?/i })
    ).toBeVisible();

    // Select suggestion chip "Textiles"
    const textilesChip = page.getByRole("button", { name: /textiles/i });
    await textilesChip.click();

    // Continue to Stage 2
    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 2. Stage 2: Preferences
    await expect(
      page.getByRole("heading", { name: /what matters for your visit\?/i })
    ).toBeVisible();

    // Set "Step-free entrance" to "Essential"
    const stepFreeGroup = page.getByRole("radiogroup", { name: /step-free entrance/i });
    await stepFreeGroup.getByRole("radio", { name: "Essential" }).click();

    // Submit
    const findBtn = page.getByRole("button", { name: /find cultural experiences/i });
    await findBtn.click();

    // 3. Stage 3: Results
    await expect(page.getByText("Calico Museum of Textiles")).toBeVisible();
    await expect(page.getByText("Meets your stated requirements")).toBeVisible();
    await expect(page.getByText("Visit information reviewed")).toBeVisible();

    // 4. Expand Visit Plan
    const viewPlanBtn = page.getByRole("button", { name: /view visit plan/i });
    await viewPlanBtn.click();

    await expect(
      page.getByRole("heading", { name: /requirement-by-requirement assessment/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Calico Museum Official Guide" })
    ).toBeVisible();

    // 5. Test Question Kit and Clipboard Copy
    const copyBtn = page.getByRole("button", { name: /copy questions to ask/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByText("✓ Copied to clipboard")).toBeVisible();

    // 6. Test Back / Refine Navigation
    await page.getByRole("button", { name: /adjust preferences/i }).click();
    await expect(
      page.getByRole("heading", { name: /what matters for your visit\?/i })
    ).toBeVisible();
  });

  test("Flow 1: Homepage -> manual entry -> discovery", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByLabel(/what cultural experiences are you curious about/i);
    await searchInput.fill("Haveli courtyards");

    const submitBtn = page.getByRole("button", { name: /discover experiences/i }).first();
    await submitBtn.click();

    await expect(page).toHaveURL(/interest=Haveli%20courtyards/);
    await expect(page.getByText("Haveli courtyards")).toBeVisible();

    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page.getByRole("heading", { name: /what matters for your visit\?/i })).toBeVisible();

    // Verify discovery without Cultural Compass
    const stepFreeGroup = page.getByRole("radiogroup", { name: /step-free entrance/i });
    await stepFreeGroup.getByRole("radio", { name: "Essential" }).click();

    const findBtn = page.getByRole("button", { name: /find cultural experiences/i });
    await findBtn.click();

    await expect(page.getByRole("heading", { name: "Calico Museum of Textiles" }).first()).toBeVisible();
    await expect(page.getByText("Meets your stated requirements").first()).toBeVisible();
  });

  test("Flow 2: Homepage -> Help me discover -> manual-entry alternative", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const helpLink = page.getByRole("link", { name: /help me discover/i });
    await helpLink.click();

    await expect(page).toHaveURL(/path=help/);
    await expect(page.getByText(/Cultural Compass/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /historic textile workshop versus contemporary design studio/i,
      })
    ).toBeVisible();

    // Click "Enter my own interests instead" (first available exit button)
    const manualBtn = page.getByRole("button", { name: /enter my own interests instead/i }).first();
    await manualBtn.click();

    // Custom input is now visible
    await expect(page.getByLabel(/add cultural interest or topic/i)).toBeVisible();
  });

  test("Flow 2b: Homepage -> Help me discover -> Cultural Compass -> Editable reveal -> Explore -> Discovery", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Homepage: click "Help me discover"
    const helpLink = page.getByRole("link", { name: /help me discover/i });
    await helpLink.click();
    await expect(page).toHaveURL(/path=help/);

    // 2. Cultural Compass Questions
    // Question 1: Select Option A
    const q1OptionA = page.getByRole("button", { name: /historic textile workshop/i });
    await expect(q1OptionA).toBeVisible();
    await q1OptionA.click();
    await page.getByRole("button", { name: /next question →/i }).click();

    // Question 2: Select Neither / Skip
    await expect(page.getByText(/Question 2 of 5/i)).toBeVisible();
    await page.getByRole("button", { name: /neither \/ skip comparison/i }).click();
    await page.getByRole("button", { name: /next question →/i }).click();

    // Question 3: Select Both
    await expect(page.getByText(/Question 3 of 5/i)).toBeVisible();
    await page.getByRole("button", { name: /both appeal to me/i }).click();
    await page.getByRole("button", { name: /next question →/i }).click();

    // Question 4: Skip directly
    await expect(page.getByText(/Question 4 of 5/i)).toBeVisible();
    await page.getByRole("button", { name: /skip this question →/i }).click();

    // Question 5: Select Option B
    await expect(page.getByText(/Question 5 of 5/i)).toBeVisible();
    await page.getByRole("button", { name: /modern design/i }).click();

    // Click "Review directions →"
    const reviewBtn = page.getByRole("button", { name: /review directions →/i });
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    // 3. Direction Reveal Screen
    await expect(page.getByTestId("cultural-compass-reveal")).toBeVisible();
    await expect(page.getByTestId("cultural-direction-title")).toBeVisible();
    await expect(page.getByText(/Starting point, not a verdict/i)).toBeVisible();

    // Verify limit enforcement when > 5 interests are generated
    const continueBtn = page.getByRole("button", { name: /continue to visit preferences →/i });
    await expect(page.getByText(/Discovery capacity limit reached/i)).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    // 4. Edit Interests: Prune excess topics down to 4
    await page.getByRole("button", { name: /remove interest visual arts/i }).click();
    await page.getByRole("button", { name: /remove interest fine art/i }).click();
    await page.getByRole("button", { name: /remove interest performing arts/i }).click();
    await page.getByRole("button", { name: /remove interest cultural festivals/i }).click();

    // Add a custom topic: "Contemporary art" (brings total to 5)
    const customInput = page.getByPlaceholder(/Type any cultural topic/i);
    await customInput.fill("Contemporary art");
    await page.getByRole("button", { name: /\+ add topic/i }).click();
    await expect(
      page.getByRole("list", { name: /editable cultural interests/i }).getByText("Contemporary art", { exact: true })
    ).toBeVisible();

    // 5. Continue to Visit Preferences (now enabled with 5 interests)
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 6. Stage 2: Preferences
    await expect(
      page.getByRole("heading", { name: /what matters for your visit\?/i })
    ).toBeVisible();

    // Set "Step-free entrance" to "Essential"
    const stepFreeGroup = page.getByRole("radiogroup", { name: /step-free entrance/i });
    await stepFreeGroup.getByRole("radio", { name: "Essential" }).click();

    // 7. Find cultural experiences -> Stage 3: Results
    const findBtn = page.getByRole("button", { name: /find cultural experiences/i });
    await findBtn.click();

    await expect(page.getByRole("heading", { name: "Calico Museum of Textiles" }).first()).toBeVisible();
    await expect(page.getByText("Meets your stated requirements").first()).toBeVisible();
  });

  test("Flow 3: Homepage -> Surprise me -> editable interests -> discovery", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const surpriseBtn = page.getByRole("button", { name: /surprise me/i });
    await surpriseBtn.click();

    await expect(page).toHaveURL(/\/explore\?interest=/);
    await expect(
      page.getByRole("heading", { name: /what cultural experiences spark your curiosity\?/i })
    ).toBeVisible();

    // Visitor can continue or add more
    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page.getByRole("heading", { name: /what matters for your visit\?/i })).toBeVisible();
  });

  test("Mobile navigation across entry paths and discovery", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /what cultural experiences spark your curiosity\?/i })
    ).toBeVisible();

    // Switch to "Surprise me" tab on mobile
    const surpriseTab = page.getByRole("tab", { name: /surprise me/i });
    await surpriseTab.click();
    await expect(page.getByText(/Curated starting sparks from Ahmedabad/i)).toBeVisible();

    // Switch back to "I know what I want" tab
    const manualTab = page.getByRole("tab", { name: /i know what i want/i });
    await manualTab.click();

    const textilesChip = page.getByRole("button", { name: /textiles/i });
    await textilesChip.click();

    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeEnabled();
  });
});
