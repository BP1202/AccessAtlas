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
   */
  async discover(request: DiscoverRequest): Promise<DiscoverResponse> {
    const url = `${this.baseUrl}/api/v1/discover`;
    try {
      const payload: DiscoverRequest = {
        city: request.city || "Ahmedabad",
        cultural_interests: request.cultural_interests,
        requirements: request.requirements ?? [],
        max_candidates: request.max_candidates ?? 5,
        evaluation_time: request.evaluation_time ?? null,
      };

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
