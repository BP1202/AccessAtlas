import { test, expect } from "@playwright/test";

test.describe("Live Browser-to-Running-FastAPI Discovery Contract Integration", () => {
  test("end-to-end discovery journey communicating with real running FastAPI instance", async ({
    page,
    request,
  }) => {
    // 1. Preflight check: verify FastAPI backend health endpoint is active
    const healthRes = await request.get("http://127.0.0.1:8000/health");
    expect(healthRes.status()).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData).toEqual({
      status: "ok",
      service: "accessatlas-backend",
    });

    // 2. Navigate to /explore without client-side mock interception
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Select suggestion chip "Textiles"
    const textilesChip = page.getByRole("button", { name: /textiles/i });
    await expect(textilesChip).toBeVisible();
    await textilesChip.click();

    // Continue to Stage 2: Preferences
    const continueBtn = page.getByRole("button", { name: /continue to visit preferences/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Set "Reservation required" to "Essential"
    const reservationGroup = page.getByRole("radiogroup", { name: /reservation required/i });
    await reservationGroup.getByRole("radio", { name: "Essential" }).click();

    // Submit live discovery request across network to FastAPI
    const findBtn = page.getByRole("button", { name: /find cultural experiences/i });
    await findBtn.click();

    // 3. Verify real FastAPI response rendering in browser:
    // Candidate 1: Calico Museum of Textiles (VERIFIED_FIT)
    const calicoCard = page.getByTestId("candidate-card-783C0235-681D-4235-BA4D-A57992F7C97A");
    await expect(calicoCard).toBeVisible();
    await expect(calicoCard.getByText("Calico Museum of Textiles")).toBeVisible();
    await expect(calicoCard.getByText("Meets your stated requirements")).toBeVisible();
    await expect(calicoCard.getByText("Visit information reviewed")).toBeVisible();

    // Candidate 2: Conflictorium (REQUIREMENT_CONFLICT)
    const conflictoriumCard = page.getByTestId("candidate-card-8090F76A-F5EE-4931-8942-12B1FF3C4996");
    await expect(conflictoriumCard).toBeVisible();
    await expect(conflictoriumCard.getByText("Conflictorium")).toBeVisible();
    await expect(conflictoriumCard.getByText("A stated requirement may not be met")).toBeVisible();

    // Candidate 3: Old City Heritage Tea Haven (UNMAPPED)
    const unmappedCard = page.getByTestId("candidate-card-unmapped_cafe_99");
    await expect(unmappedCard).toBeVisible();
    await expect(unmappedCard.getByText("Old City Heritage Tea Haven")).toBeVisible();
    await expect(unmappedCard.getByText("Visit information not yet reviewed")).toBeVisible();
    await expect(unmappedCard.getByText("Not yet evaluated against visit criteria")).toBeVisible();

    // 4. Expand Visit Plan for Calico and verify deterministic assessment details
    const viewCalicoPlanBtn = calicoCard.getByRole("button", { name: /view visit plan/i });
    await viewCalicoPlanBtn.click();

    await expect(
      calicoCard.getByText("Sarabhai Foundation — Calico Museum Tour Guidelines").first()
    ).toBeVisible();
    await expect(
      calicoCard.getByText(/Verified applicable evidence supports requirement for 'reservation_required'/i)
    ).toBeVisible();
    await expect(
      calicoCard.getByText(/Reservation required: supported by verified evidence/i)
    ).toBeVisible();

    // 5. Expand Visit Plan for unmapped candidate and verify honest absence of fabricated fit
    const viewUnmappedPlanBtn = unmappedCard.getByRole("button", { name: /view visit plan/i });
    await viewUnmappedPlanBtn.click();
    await expect(
      unmappedCard.getByText(/Independent venue documentation has not yet been reviewed for this space in the Ahmedabad pilot/i)
    ).toBeVisible();
  });

  test("live FastAPI request validation across boundary rejects unsupported inputs with correct error codes", async ({
    request,
  }) => {
    // 1. Unsupported city -> HTTP 400 Bad Request
    const cityRes = await request.post("http://127.0.0.1:8000/api/v1/discover", {
      data: {
        city: "Mumbai",
        cultural_interests: ["Heritage"],
      },
    });
    expect(cityRes.status()).toBe(400);
    const cityData = await cityRes.json();
    expect(cityData.detail).toContain("Unsupported pilot city 'Mumbai'");

    // 2. Empty cultural interests -> HTTP 422 Unprocessable Entity
    const emptyInterestsRes = await request.post("http://127.0.0.1:8000/api/v1/discover", {
      data: {
        city: "Ahmedabad",
        cultural_interests: [],
      },
    });
    expect(emptyInterestsRes.status()).toBe(422);
    const emptyData = await emptyInterestsRes.json();
    expect(JSON.stringify(emptyData)).toContain("cultural_interests");

    // 3. Extra forbidden property -> HTTP 422 Unprocessable Entity (extra='forbid')
    const extraPropRes = await request.post("http://127.0.0.1:8000/api/v1/discover", {
      data: {
        city: "Ahmedabad",
        cultural_interests: ["Textiles"],
        injected_credential: "unauthorized_token",
      },
    });
    expect(extraPropRes.status()).toBe(422);
    const extraData = await extraPropRes.json();
    expect(JSON.stringify(extraData)).toContain("extra_forbidden");
  });
});
