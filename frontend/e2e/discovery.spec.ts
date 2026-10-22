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
  test("completes two-stage journey, reviews candidate, expands visit plan, and interacts with question kit", async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions for copying
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Intercept API call to discovery endpoint
    await page.route("**/api/v1/discover", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockApiResponse),
      });
    });

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

  test("renders gracefully on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /what cultural experiences spark your curiosity\?/i })
    ).toBeVisible();

    const textilesChip = page.getByRole("button", { name: /textiles/i });
    await textilesChip.click();

    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeVisible();
  });
});
