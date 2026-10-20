import { test, expect } from "@playwright/test";

test.describe("AccessAtlas Landing Page Smoke Test", () => {
  test("renders homepage with accessible title, header, and content", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Check page title
    await expect(page).toHaveTitle(
      /AccessAtlas — Cultural Discovery & Participation Planning/i
    );

    // 2. Check main heading
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("real participation needs");

    // 3. Check Ahmedabad Pilot badge
    const badge = page.getByText("Ahmedabad Pilot").first();
    await expect(badge).toBeVisible();

    // 4. Check Possibility Engine sections
    await expect(
      page.getByRole("heading", {
        name: "Deterministic Possibility Engine Outcomes",
      })
    ).toBeVisible();

    // 5. Check reviewed Ahmedabad venues
    await expect(page.getByText("Calico Museum of Textiles")).toBeVisible();
    await expect(page.getByText("Kasturbhai Lalbhai Museum")).toBeVisible();
    await expect(page.getByText("Conflictorium")).toBeVisible();

    // 6. Check footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Qloo Agentic Hackathon");
  });
});
