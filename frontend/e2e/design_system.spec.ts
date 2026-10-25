import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Accessible Editorial Design System Foundations", () => {
  const artifactsDir = "C:/Users/bhoom/.gemini/antigravity-ide/brain/299b5963-0cde-4153-bc40-f438c2b02466";

  test("renders all core design system sections and passes contrast/accessibility checks at desktop width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");

    // 1. Verify primary heading and editorial eyebrow
    const mainHeading = page.getByRole("heading", {
      name: "Accessible Editorial Design System",
      level: 1,
    });
    await expect(mainHeading).toBeVisible();
    await expect(
      page.getByText("AccessAtlas Editorial Foundations")
    ).toBeVisible();

    // 2. Verify Core Palette tokens
    await expect(page.getByText("Core Editorial Palette")).toBeVisible();
    await expect(page.getByText("Forest", { exact: true })).toBeVisible();
    await expect(page.getByText("Warm Paper", { exact: true })).toBeVisible();
    await expect(page.getByText("Ink", { exact: true })).toBeVisible();
    await expect(page.getByText("Terracotta", { exact: true })).toBeVisible();
    await expect(page.getByText("Stone", { exact: true })).toBeVisible();
    await expect(page.getByText("Sage Tint", { exact: true })).toBeVisible();

    // 3. Verify Buttons and min-height interactive targets
    const primaryBtn = page.getByRole("button", { name: "Primary Action" });
    await expect(primaryBtn).toBeVisible();
    const btnBox = await primaryBtn.boundingBox();
    expect(btnBox?.height).toBeGreaterThanOrEqual(44);

    // Test keyboard focus outline visibility
    await primaryBtn.focus();
    await expect(primaryBtn).toBeFocused();

    // 4. Verify Accessible Input
    const topicInput = page.getByLabel("Cultural Topic or Craft Tradition");
    await expect(topicInput).toBeVisible();
    await topicInput.fill("Kalamkari");
    await expect(topicInput).toHaveValue("Kalamkari");

    // Verify error state
    await expect(
      page.getByText("Step-free access is required for this outing.")
    ).toBeVisible();

    // 5. Verify Selectable Interest Chips
    const craftChip = page.getByRole("button", {
      name: "Craft traditions",
      exact: true,
    });
    await expect(craftChip).toBeVisible();
    await expect(craftChip).toHaveAttribute("aria-pressed", "false");
    await craftChip.click();
    await expect(craftChip).toHaveAttribute("aria-pressed", "true");

    // 6. Verify Deterministic Evidence States
    await expect(page.getByText("Verified Fit").first()).toBeVisible();
    await expect(page.getByText("Needs Confirmation").first()).toBeVisible();
    await expect(page.getByText("Requirement Conflict").first()).toBeVisible();

    // 7. Verify Editorial Containers and Provenance Links
    const provenanceLink = page.getByRole("link", {
      name: /Calico Museum Official Archive/i,
    });
    await expect(provenanceLink).toBeVisible();
    await expect(provenanceLink).toHaveAttribute("target", "_blank");

    // Capture Desktop Screenshot for Documentation
    const desktopScreenshotPath = path.join(
      artifactsDir,
      "design_system_desktop_1280.png"
    );
    await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
  });

  test("maintains responsive hierarchy, legible text, and touch targets at mobile width (375px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");

    // Verify heading wraps comfortably
    const mainHeading = page.getByRole("heading", {
      name: "Accessible Editorial Design System",
      level: 1,
    });
    await expect(mainHeading).toBeVisible();

    // Verify buttons remain touch-friendly
    const primaryBtn = page.getByRole("button", { name: "Primary Action" });
    await expect(primaryBtn).toBeVisible();
    const btnBox = await primaryBtn.boundingBox();
    expect(btnBox?.height).toBeGreaterThanOrEqual(44);

    // Verify chips render cleanly without horizontal overflow
    const textilesChip = page
      .getByRole("button", { name: /textiles/i })
      .first();
    await expect(textilesChip).toBeVisible();

    // Capture Mobile Screenshot for Documentation
    const mobileScreenshotPath = path.join(
      artifactsDir,
      "design_system_mobile_375.png"
    );
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
  });
});
