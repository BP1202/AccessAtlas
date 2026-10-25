import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { AccessAtlasApiClient, ApiClientError } from "./client";
import { BACKEND_URL } from "@/config/env";
import type { DiscoverRequest, DiscoverResponse } from "./types";

describe("Frontend Security Boundary & Credential Protection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Task 8: Environment Variable Boundary", () => {
    it("ensures no privileged Qloo credentials or secrets are prefixed with NEXT_PUBLIC_", () => {
      // Scanning process.env for any accidental NEXT_PUBLIC_ credential leaks
      const envKeys = Object.keys(process.env);

      for (const key of envKeys) {
        if (key.startsWith("NEXT_PUBLIC_")) {
          const upper = key.toUpperCase();
          expect(upper).not.toContain("QLOO");
          expect(upper).not.toContain("SECRET");
          // The only allowed NEXT_PUBLIC_ URL is NEXT_PUBLIC_BACKEND_URL
          if (upper.includes("KEY")) {
            expect(upper).not.toContain("API_KEY");
          }
        }
      }

      // Explicit check for common leakage variable names
      expect(process.env.NEXT_PUBLIC_QLOO_API_KEY).toBeUndefined();
      expect(process.env.NEXT_PUBLIC_QLOO_KEY).toBeUndefined();
      expect(process.env.NEXT_PUBLIC_API_KEY).toBeUndefined();
    });

    it("verifies BACKEND_URL targets the AccessAtlas backend and not a third-party provider", () => {
      expect(BACKEND_URL).not.toContain("qloo.com");
      expect(BACKEND_URL).toMatch(/^https?:\/\/(localhost|127\.0\.0\.1|.*)/);
    });
  });

  describe("Task 2 & 7: Static Scan for Direct Provider Calls & Header Construction", () => {
    function getAllSourceFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules and .next if encountered
          if (entry.name !== "node_modules" && entry.name !== ".next") {
            files.push(...getAllSourceFiles(fullPath));
          }
        } else if (
          /\.(ts|tsx|js|jsx)$/.test(entry.name) &&
          !entry.name.includes("securityBoundary.test")
        ) {
          files.push(fullPath);
        }
      }
      return files;
    }

    it("verifies no frontend source file references QLOO_API_KEY or X-Api-Key", () => {
      const srcDir = path.resolve(__dirname, "../../");
      const sourceFiles = getAllSourceFiles(srcDir);
      expect(sourceFiles.length).toBeGreaterThan(10);

      const violations: { file: string; match: string }[] = [];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, "utf-8");

        if (content.includes("QLOO_API_KEY")) {
          violations.push({ file, match: "QLOO_API_KEY" });
        }
        if (/X-Api-Key/i.test(content)) {
          violations.push({ file, match: "X-Api-Key" });
        }
        if (/hackathon\.api\.qloo\.com/i.test(content)) {
          violations.push({ file, match: "hackathon.api.qloo.com" });
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Task 2: Outbound HTTP Request Headers & URL Routing", () => {
    it("never includes Qloo headers or authorization tokens in discover requests", async () => {
      const client = new AccessAtlasApiClient("http://127.0.0.1:8000");

      const mockResponse: DiscoverResponse = {
        city: "Ahmedabad",
        cultural_interests: ["textiles"],
        total_candidates_found: 0,
        candidates_evaluated: 0,
        plans: [],
        cultural_threads: [],
        discovery_error: null,
        workflow_summary: "No candidates",
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const req: DiscoverRequest = {
        city: "Ahmedabad",
        cultural_interests: ["textiles"],
        requirements: [],
      };

      await client.discover(req);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

      // Must route exclusively to local backend endpoint
      expect(url).toBe("http://127.0.0.1:8000/api/v1/discover");
      expect(url).not.toContain("qloo.com");

      // Verify headers contain only standard Content-Type and Accept
      const headers = init.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["Accept"]).toBe("application/json");
      expect(headers["X-Api-Key"]).toBeUndefined();
      expect(headers["x-api-key"]).toBeUndefined();
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("never includes Qloo headers in health check requests", async () => {
      const client = new AccessAtlasApiClient("http://127.0.0.1:8000");

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok", service: "accessatlas-backend" }),
      } as Response);

      await client.checkHealth();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

      expect(url).toBe("http://127.0.0.1:8000/health");
      const headers = init.headers as Record<string, string>;
      expect(headers["Accept"]).toBe("application/json");
      expect(headers["X-Api-Key"]).toBeUndefined();
      expect(headers["Authorization"]).toBeUndefined();
    });
  });

  describe("Task 4 & 6: Client Error Sanitization", () => {
    it("safely extracts standard detail messages without dumping unformatted error objects", async () => {
      const client = new AccessAtlasApiClient("http://127.0.0.1:8000");

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({
          detail: "Upstream cultural discovery authentication failed.",
          internal_debug: "sensitive_internal_trace_that_must_not_surface",
        }),
      } as Response);

      const req: DiscoverRequest = {
        city: "Ahmedabad",
        cultural_interests: ["textiles"],
      };

      try {
        await client.discover(req);
        expect.unreachable("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.statusCode).toBe(502);
        expect(apiErr.message).toBe("Upstream cultural discovery authentication failed.");
        expect(apiErr.message).not.toContain("sensitive_internal_trace");
      }
    });

    it("handles non-JSON error responses gracefully with fallback", async () => {
      const client = new AccessAtlasApiClient("http://127.0.0.1:8000");

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 504,
        json: async () => {
          throw new Error("HTML Bad Gateway response");
        },
      } as unknown as Response);

      const req: DiscoverRequest = {
        city: "Ahmedabad",
        cultural_interests: ["textiles"],
      };

      try {
        await client.discover(req);
        expect.unreachable("Should have thrown ApiClientError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiClientError);
        const apiErr = err as ApiClientError;
        expect(apiErr.statusCode).toBe(504);
        expect(apiErr.message).toBe("Discovery request failed with HTTP 504");
      }
    });
  });
});
