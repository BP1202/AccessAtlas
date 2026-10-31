import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessAtlasApiClient } from "./client";
import { ParticipationRequirement } from "./types";
import {
  validDiscoverRequest,
  validDiscoverResponse,
  fixtureVerifiedFitPlan,
  fixtureNeedsConfirmationPlan,
  fixtureRequirementConflictPlan,
  fixtureUnmappedPlan,
  fixtureMissingEvidencePlan,
  fixtureError400,
  fixtureError422,
  fixtureError429,
  fixtureError502,
  fixtureError503,
  fixtureError504,
} from "./fixtures/discoveryContractFixtures";
import { CandidateCard } from "@/components/discovery/CandidateCard";
import { ErrorDisplay } from "@/components/feedback/ErrorDisplay";

describe("Browser-to-Backend Discovery Contract Verification", () => {
  const mockBaseUrl = "http://127.0.0.1:8000";
  let client: AccessAtlasApiClient;

  beforeEach(() => {
    client = new AccessAtlasApiClient(mockBaseUrl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Task 4 & 5: Valid Request Transmission & Requirement Priorities", () => {
    it("transmits a valid discovery request with exact contract fields without data loss", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => validDiscoverResponse,
      } as Response);

      const response = await client.discover(validDiscoverRequest);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callArgs = fetchSpy.mock.calls[0];
      expect(callArgs[0]).toBe("http://127.0.0.1:8000/api/v1/discover");

      const options = callArgs[1] as RequestInit;
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
        Accept: "application/json",
      });

      const parsedBody = JSON.parse(options.body as string);

      // Verify all required contract fields
      expect(parsedBody.city).toBe("Ahmedabad");
      expect(parsedBody.cultural_interests).toEqual([
        "Textiles",
        "Heritage Architecture",
      ]);
      expect(parsedBody.max_candidates).toBe(5);
      expect(parsedBody.evaluation_time).toBe("2026-10-19T12:00:00Z");

      // Verify that essential (mandatory) and optional requirements retain their exact values
      expect(parsedBody.requirements).toHaveLength(2);

      const mandatoryReq = parsedBody.requirements.find(
        (r: ParticipationRequirement) => r.requirement_id === "req_reservation"
      );
      expect(mandatoryReq).toBeDefined();
      expect(mandatoryReq.attribute).toBe("reservation_required");
      expect(mandatoryReq.priority).toBe("mandatory");
      expect(mandatoryReq.scope).toBe("venue");
      expect(mandatoryReq.operator).toBe("equals");
      expect(mandatoryReq.expected_value).toBe(true);

      const optionalReq = parsedBody.requirements.find(
        (r: ParticipationRequirement) => r.requirement_id === "req_seating"
      );
      expect(optionalReq).toBeDefined();
      expect(optionalReq.attribute).toBe("seating_available");
      expect(optionalReq.priority).toBe("optional");
      expect(optionalReq.scope).toBe("venue");
      expect(optionalReq.operator).toBe("equals");
      expect(optionalReq.expected_value).toBe(true);

      // Verify response object integrity
      expect(response.city).toBe("Ahmedabad");
      expect(response.total_candidates_found).toBe(4);
      expect(response.candidates_evaluated).toBe(4);
      expect(response.plans).toHaveLength(4);
      expect(response.cultural_threads).toHaveLength(1);
    });
  });

  describe("Task 6: Response Parsing for Mapped, Unmapped, Reviewed, & Unreviewed Candidates", () => {
    it("parses mapped candidate with reviewed evidence and Possibility assessment", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          city: "Ahmedabad",
          cultural_interests: ["Textiles"],
          total_candidates_found: 1,
          candidates_evaluated: 1,
          plans: [fixtureVerifiedFitPlan],
          cultural_threads: [],
          discovery_error: null,
          workflow_summary: "Evaluated 1 candidate.",
        }),
      } as Response);

      const response = await client.discover({
        city: "Ahmedabad",
        cultural_interests: ["Textiles"],
      });

      expect(response.plans).toHaveLength(1);
      const plan = response.plans[0];
      expect(plan.resolution_status).toBe("resolved");
      expect(plan.candidate.name).toBe("Calico Museum of Textiles");
      expect(plan.venue_id).toBe("ven_in_ahm_calico");
      expect(plan.possibility_assessment).not.toBeNull();
      expect(plan.possibility_assessment?.aggregate_outcome).toBe("VERIFIED_FIT");
      expect(plan.supported_findings).toHaveLength(1);
      expect(plan.provenance_sources).toHaveLength(1);
    });

    it("parses unmapped candidate where no venue evidence exists without fabricating fields", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          city: "Ahmedabad",
          cultural_interests: ["Culinary"],
          total_candidates_found: 1,
          candidates_evaluated: 1,
          plans: [fixtureUnmappedPlan],
          cultural_threads: [],
          discovery_error: null,
          workflow_summary: "Evaluated 1 candidate.",
        }),
      } as Response);

      const response = await client.discover({
        city: "Ahmedabad",
        cultural_interests: ["Culinary"],
      });

      const plan = response.plans[0];
      expect(plan.resolution_status).toBe("unmapped");
      expect(plan.candidate.name).toBe("Old City Heritage Tea Haven");
      expect(plan.venue_id).toBeNull();
      expect(plan.possibility_assessment).toBeNull();
      expect(plan.supported_findings).toHaveLength(0);
      expect(plan.unresolved_gaps[0]).toContain("No independently verified venue evidence is mapped");
      expect(plan.confirmation_questions[0]).toContain("verify applicable access attributes directly");
    });

    it("parses missing_evidence candidate where identifier is unmapped in local evidence store", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          city: "Ahmedabad",
          cultural_interests: ["Heritage"],
          total_candidates_found: 1,
          candidates_evaluated: 1,
          plans: [fixtureMissingEvidencePlan],
          cultural_threads: [],
          discovery_error: null,
          workflow_summary: "Evaluated 1 candidate.",
        }),
      } as Response);

      const response = await client.discover({
        city: "Ahmedabad",
        cultural_interests: ["Heritage"],
      });

      const plan = response.plans[0];
      expect(plan.resolution_status).toBe("missing_evidence");
      expect(plan.candidate.name).toBe("Historic Stepwell Exhibit");
      expect(plan.venue_id).toBe("ven_missing_id_999");
      expect(plan.possibility_assessment).toBeNull();
      expect(plan.unresolved_gaps[0]).toContain("was not found in the local evidence repository");
    });
  });

  describe("Task 7: Rendering of All Three Possibility Outcomes & Unmapped States", () => {
    it("renders VERIFIED_FIT with verified badge and honest scope notice", () => {
      render(
        <CandidateCard
          plan={fixtureVerifiedFitPlan}
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      );

      expect(screen.getAllByText("Meets your stated requirements").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Visit information reviewed").length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Not an accessibility certification or guarantee of universal accommodation/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Review Booking Guidance")).toBeInTheDocument();
    });

    it("renders NEEDS_CONFIRMATION with question kit and direct confirmation guidance", () => {
      render(
        <CandidateCard
          plan={fixtureNeedsConfirmationPlan}
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      );

      expect(screen.getAllByText("Some details need checking").length).toBeGreaterThan(0);
      expect(screen.getByText("Confirmation Question Kit")).toBeInTheDocument();
      expect(screen.getByText(/Confirm step free entrance: confirm ramp provision/i)).toBeInTheDocument();
      expect(screen.getAllByText("Confirm Directly with Venue").length).toBeGreaterThan(0);
    });

    it("renders REQUIREMENT_CONFLICT with prominent essential conflict banner", () => {
      render(
        <CandidateCard
          plan={fixtureRequirementConflictPlan}
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      );

      expect(screen.getAllByText("A stated requirement may not be met").length).toBeGreaterThan(0);
      expect(screen.getByTestId("essential-conflict-banner")).toBeInTheDocument();
      expect(screen.getByText("Essential Requirement Conflict")).toBeInTheDocument();
      expect(
        screen.getByText(/AccessAtlas does not offer unverified workarounds or silently downgrade essential requirements/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Reconsider Essential Conflict")).toBeInTheDocument();
    });

    it("renders unmapped candidate with truthful unreviewed status without fabricating fit", () => {
      render(
        <CandidateCard
          plan={fixtureUnmappedPlan}
          isExpanded={true}
          onToggleExpand={() => {}}
        />
      );

      expect(screen.getAllByText("Visit information not yet reviewed").length).toBeGreaterThan(0);
      expect(screen.queryByText("Meets your stated requirements")).not.toBeInTheDocument();
      expect(screen.queryByText("A stated requirement may not be met")).not.toBeInTheDocument();
      expect(screen.getAllByText("Not yet evaluated against visit criteria").length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Independent venue documentation has not yet been reviewed for this space in the Ahmedabad pilot/i)
      ).toBeInTheDocument();
    });
  });

  describe("Task 8: Error Handling for 400, 422, 429, 502, 503, and 504", () => {
    it("handles 400 Bad Request (unsupported pilot city) across client and UI error display", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError400.status,
        json: async () => fixtureError400.payload,
      } as Response);

      await expect(
        client.discover({ city: "Mumbai", cultural_interests: ["textiles"] })
      ).rejects.toMatchObject({
        statusCode: 400,
        detail: fixtureError400.payload.detail,
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError400.status}
          message={fixtureError400.payload.detail}
        />
      );
      expect(screen.getByText("Service Error (400)")).toBeInTheDocument();
      expect(screen.getByText(/Unsupported pilot city 'Mumbai'/i)).toBeInTheDocument();
    });

    it("handles 422 Unprocessable Entity (input validation failure)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError422.status,
        json: async () => fixtureError422.payload,
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["valid"] })
      ).rejects.toMatchObject({
        statusCode: 422,
        detail: "cultural_interests must contain at least one item.",
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError422.status}
          message="cultural_interests must contain at least one item."
        />
      );
      expect(screen.getByText("Service Error (422)")).toBeInTheDocument();
      expect(screen.getByText("cultural_interests must contain at least one item.")).toBeInTheDocument();
    });

    it("handles 429 Too Many Requests (rate limiting)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError429.status,
        json: async () => fixtureError429.payload,
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toMatchObject({
        statusCode: 429,
        detail: fixtureError429.payload.detail,
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError429.status}
          message={fixtureError429.payload.detail}
        />
      );
      expect(screen.getByText("Service Error (429)")).toBeInTheDocument();
      expect(screen.getByText(/Upstream cultural discovery rate limit exceeded/i)).toBeInTheDocument();
    });

    it("handles 502 Bad Gateway (upstream provider error)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError502.status,
        json: async () => fixtureError502.payload,
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toMatchObject({
        statusCode: 502,
        detail: fixtureError502.payload.detail,
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError502.status}
          message={fixtureError502.payload.detail}
        />
      );
      expect(screen.getByText("Service Error (502)")).toBeInTheDocument();
      expect(screen.getByText(/Upstream cultural discovery provider error/i)).toBeInTheDocument();
    });

    it("handles 503 Service Unavailable (missing configuration)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError503.status,
        json: async () => fixtureError503.payload,
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toMatchObject({
        statusCode: 503,
        detail: fixtureError503.payload.detail,
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError503.status}
          message={fixtureError503.payload.detail}
        />
      );
      expect(screen.getByText("Service Error (503)")).toBeInTheDocument();
      expect(screen.getByText("Cultural discovery service is not configured.")).toBeInTheDocument();
    });

    it("handles 504 Gateway Timeout (upstream timeout)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: fixtureError504.status,
        json: async () => fixtureError504.payload,
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toMatchObject({
        statusCode: 504,
        detail: fixtureError504.payload.detail,
      });

      render(
        <ErrorDisplay
          statusCode={fixtureError504.status}
          message={fixtureError504.payload.detail}
        />
      );
      expect(screen.getByText("Service Error (504)")).toBeInTheDocument();
      expect(screen.getByText(/Upstream cultural discovery request timed out/i)).toBeInTheDocument();
    });
  });
});
