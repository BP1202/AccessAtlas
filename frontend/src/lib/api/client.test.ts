import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AccessAtlasApiClient, ApiClientError } from "./client";
import type { DiscoverRequest, DiscoverResponse, HealthResponse } from "./types";

describe("AccessAtlasApiClient", () => {
  const mockBaseUrl = "http://127.0.0.1:8000";
  let client: AccessAtlasApiClient;

  beforeEach(() => {
    client = new AccessAtlasApiClient(mockBaseUrl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkHealth", () => {
    it("returns health response on HTTP 200", async () => {
      const mockHealth: HealthResponse = {
        status: "ok",
        service: "accessatlas-backend",
      };

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      } as Response);

      const res = await client.checkHealth();
      expect(res).toEqual(mockHealth);
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/health",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("throws ApiClientError with status and sanitized message on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ detail: "Backend service unavailable" }),
      } as Response);

      await expect(client.checkHealth()).rejects.toThrow(ApiClientError);
    });
  });

  describe("discover", () => {
    it("posts discover request with exact backend fields and returns structured response", async () => {
      const mockReq: DiscoverRequest = {
        city: "Ahmedabad",
        cultural_interests: ["textiles", "historic museum"],
        requirements: [
          {
            requirement_id: "req_res",
            attribute: "reservation_required",
            priority: "mandatory",
            scope: "venue",
            operator: "equals",
            expected_value: true,
          },
        ],
        max_candidates: 3,
      };

      const mockRes: DiscoverResponse = {
        city: "Ahmedabad",
        cultural_interests: ["textiles", "historic museum"],
        total_candidates_found: 1,
        candidates_evaluated: 1,
        plans: [
          {
            candidate: {
              entity_id: "783C0235-681D-4235-BA4D-A57992F7C97A",
              name: "Calico Museum of Textiles",
              entity_type: "urn:entity:place",
            },
            resolution_status: "resolved",
            venue_id: "ven_in_ahm_calico",
            possibility_assessment: {
              venue_id: "ven_in_ahm_calico",
              aggregate_outcome: "VERIFIED_FIT",
              evaluation_time: "2026-10-19T12:00:00Z",
              assessments: [],
              summary: "Verified fit.",
            },
            supported_findings: ["Reservation required confirmed."],
            unresolved_gaps: [],
            confirmation_questions: [],
            suggested_next_actions: [],
            provenance_sources: [],
          },
        ],
        workflow_summary: "Evaluated 1 candidate.",
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockRes,
      } as Response);

      const res = await client.discover(mockReq);
      expect(res.city).toBe("Ahmedabad");
      expect(res.plans).toHaveLength(1);
      expect(res.plans[0].resolution_status).toBe("resolved");
      expect(res.plans[0].possibility_assessment?.aggregate_outcome).toBe("VERIFIED_FIT");

      // Verify exact JSON payload posted
      expect(fetchSpy).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/discover",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            city: "Ahmedabad",
            cultural_interests: ["textiles", "historic museum"],
            requirements: [
              {
                requirement_id: "req_res",
                attribute: "reservation_required",
                priority: "mandatory",
                scope: "venue",
                operator: "equals",
                expected_value: true,
              },
            ],
            max_candidates: 3,
          }),
        })
      );
    });

    it("rejects empty cultural_interests before network call", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      await expect(client.discover({ cultural_interests: [] })).rejects.toThrow(
        "cultural_interests must contain at least one item."
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("rejects blank item in cultural_interests", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      await expect(
        client.discover({ cultural_interests: ["   "] })
      ).rejects.toThrow("must not be empty or blank");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("rejects more than 5 cultural_interests", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      await expect(
        client.discover({
          cultural_interests: ["1", "2", "3", "4", "5", "6"],
        })
      ).rejects.toThrow("may contain at most 5 items");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("handles 400 Bad Request for unsupported pilot city", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          detail:
            "Unsupported pilot city 'Mumbai'. Only 'Ahmedabad' is supported in the current pilot release.",
        }),
      } as Response);

      await expect(
        client.discover({ city: "Mumbai", cultural_interests: ["museums"] })
      ).rejects.toThrow("Unsupported pilot city 'Mumbai'");
    });

    it("handles 422 Unprocessable Entity with detail array", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          detail: [
            {
              loc: ["body", "cultural_interests"],
              msg: "List should have at least 1 item",
              type: "value_error",
            },
          ],
        }),
      } as Response);

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toThrow("List should have at least 1 item");
    });

    it("handles 502 Bad Gateway for upstream service error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({
          detail: "Upstream cultural discovery provider error.",
        }),
      } as Response);

      try {
        await client.discover({ cultural_interests: ["textiles"] });
        expect.fail("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.statusCode).toBe(502);
        expect(apiErr.detail).toBe("Upstream cultural discovery provider error.");
      }
    });

    it("handles network failure gracefully", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(
        new Error("Connection refused")
      );

      await expect(
        client.discover({ cultural_interests: ["textiles"] })
      ).rejects.toThrow("Connection refused");
    });
  });
});
