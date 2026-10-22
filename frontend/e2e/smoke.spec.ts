import { test, expect } from "@playwright/test";

test.describe("AccessAtlas Visitor-First Homepage Smoke Test", () => {
  test("renders homepage with approved curiosity-first headline, navigation, and absence of developer jargon", async ({
    page,
  }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // 1. Check page title
    await expect(page).toHaveTitle(
      /AccessAtlas — Cultural Discovery & Participation Planning/i
    );

    // 2. Check visitor hero headline from UX_VISION.md
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("What if your next favourite place is somewhere you never thought to look?");

    // 3. Check navigation links in header
    const mainNav = page.getByRole("navigation", { name: "Main Navigation" });
    await expect(mainNav.getByRole("link", { name: "Explore", exact: true })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "How it works", exact: true })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: "About", exact: true })).toBeVisible();

    // 4. Check dominant hero input and primary CTA button
    const searchInput = page.getByLabel(/what cultural experiences are you curious about/i);
    await expect(searchInput).toBeVisible();
    const primaryCta = page.getByRole("button", { name: /discover experiences/i }).first();
    await expect(primaryCta).toBeVisible();

    // 5. Check reviewed Ahmedabad cultural spaces are displayed
    await expect(page.getByText("Calico Museum of Textiles")).toBeVisible();
    await expect(page.getByText("Kasturbhai Lalbhai Museum")).toBeVisible();
    await expect(page.getByText("Conflictorium")).toBeVisible();

    // 6. Check negative assertions: no hackathon or developer jargon anywhere on homepage
    const pageContent = (await page.content()).toLowerCase();
    expect(pageContent).not.toContain("qloo agentic");
    expect(pageContent).not.toContain("hackathon");
    expect(pageContent).not.toContain("possibility engine");
    expect(pageContent).not.toContain("fastapi");
    expect(pageContent).not.toContain("langgraph");
    expect(pageContent).not.toContain("architecture & privacy invariants");
  });

  test("renders correctly on mobile viewport", async ({ page }) => {
    // Mobile viewport (iPhone SE size)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("What if your next favourite place is somewhere you never thought to look?");

    const primaryCta = page.getByRole("button", { name: /discover experiences/i }).first();
    await expect(primaryCta).toBeVisible();
  });

  test("primary CTA navigates to /explore successfully", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /discover experiences/i }).first().click();

    await expect(page).toHaveURL(/\/explore$/);
    await expect(
      page.getByRole("heading", {
        name: /what cultural experiences spark your curiosity|explore cultural spaces/i,
      })
    ).toBeVisible();
  });

  test("navigation to /how-it-works and /about succeeds", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(
      page.getByRole("heading", { name: /how accessatlas works/i })
    ).toBeVisible();

    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /culture on your terms/i })
    ).toBeVisible();
  });
});
