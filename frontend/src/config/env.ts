/**
 * Browser-safe environment configuration for AccessAtlas frontend.
 *
 * All cultural intelligence and evidence assessments are mediated
 * through the AccessAtlas FastAPI backend. Privileged credentials (such as
 * provider API keys) must NEVER be exposed, bundled, or referenced here.
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000";
