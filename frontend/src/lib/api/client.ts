/**
 * Typed HTTP client for the AccessAtlas backend API.
 *
 * All requests route strictly to the AccessAtlas backend. Qloo or other third-party
 * credentials are NEVER handled on the client.
 */

import { BACKEND_URL } from "@/config/env";
import type {
  ApiErrorDetail,
  DiscoverRequest,
  DiscoverResponse,
  HealthResponse,
} from "./types";

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly detail: string;

  constructor(statusCode: number, detail: string) {
    super(detail);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

/**
 * Format API error response safely into a readable message.
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const errorPayload = data as ApiErrorDetail;
    if (typeof errorPayload.detail === "string") {
      return errorPayload.detail;
    }
    if (Array.isArray(errorPayload.detail)) {
      return errorPayload.detail
        .map((e) => (typeof e === "object" && e?.msg ? e.msg : JSON.stringify(e)))
        .join("; ");
    }
  }
  return fallback;
}

export class AccessAtlasApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Check process availability via GET /health.
   */
  async checkHealth(): Promise<HealthResponse> {
    const url = `${this.baseUrl}/health`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let errorMsg = `Health check failed with HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = extractErrorMessage(errorData, errorMsg);
        } catch {
          // Response was not JSON
        }
        throw new ApiClientError(response.status, errorMsg);
      }

      return (await response.json()) as HealthResponse;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(
        0,
        err instanceof Error ? err.message : "Network error contacting health endpoint"
      );
    }
  }

  /**
   * Execute cultural discovery and participation planning via POST /api/v1/discover.
   *
   * Enforces strict backend contract fidelity:
   * - City defaults to "Ahmedabad"
   * - cultural_interests: 1 to 5 non-empty strings (max 100 chars each)
   * - requirements: validated participation requirements
   * - max_candidates: 1 to 20
   * - No extraneous fields sent (preventing 422 extra="forbid" errors)
   */
  async discover(request: DiscoverRequest): Promise<DiscoverResponse> {
    const url = `${this.baseUrl}/api/v1/discover`;

    // Client-side preflight validation matching backend invariants
    if (!request.cultural_interests || request.cultural_interests.length === 0) {
      throw new ApiClientError(
        422,
        "cultural_interests must contain at least one item."
      );
    }

    const cleanedInterests = request.cultural_interests.map((item, idx) => {
      const trimmed = item.trim();
      if (!trimmed) {
        throw new ApiClientError(
          422,
          `cultural_interests item at index ${idx} must not be empty or blank.`
        );
      }
      if (trimmed.length > 100) {
        throw new ApiClientError(
          422,
          `cultural_interests item at index ${idx} exceeds maximum length of 100 characters.`
        );
      }
      return trimmed;
    });

    if (cleanedInterests.length > 5) {
      throw new ApiClientError(
        422,
        "cultural_interests may contain at most 5 items."
      );
    }

    const payload: DiscoverRequest = {
      city: request.city?.trim() || "Ahmedabad",
      cultural_interests: cleanedInterests,
      requirements: request.requirements ?? [],
      max_candidates: request.max_candidates ?? 5,
    };

    if (request.evaluation_time !== undefined && request.evaluation_time !== null) {
      payload.evaluation_time = request.evaluation_time;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `Discovery request failed with HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = extractErrorMessage(errorData, errorMsg);
        } catch {
          // Response was not JSON
        }
        throw new ApiClientError(response.status, errorMsg);
      }

      return (await response.json()) as DiscoverResponse;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(
        0,
        err instanceof Error ? err.message : "Network error contacting discovery API"
      );
    }
  }
}

export const defaultApiClient = new AccessAtlasApiClient();
