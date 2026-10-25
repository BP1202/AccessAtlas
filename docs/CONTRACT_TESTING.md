# AccessAtlas — Discovery Contract & Integration Testing

**Status:** Active testing specification and verification guide.  
**Scope:** Browser-to-backend discovery boundary verification across Next.js and FastAPI.

---

## 1. Overview & Objectives

In AccessAtlas, discovery coordination bridges two distinct runtimes:
- **Frontend Client:** Next.js and TypeScript ([`frontend/src/lib/api/discoverClient.ts`](../frontend/src/lib/api/discoverClient.ts)).
- **Backend Service:** Python and FastAPI ([`backend/app/api/v1/discover.py`](../backend/app/api/v1/discover.py), [`backend/app/schemas/discovery.py`](../backend/app/schemas/discovery.py)).

While unit tests exist in isolation within both codebases, contract and integration tests ensure:
1. **Schema Fidelity:** Frontend requests accurately satisfy backend Pydantic validation rules (including `extra = "forbid"` restrictions, requirement priorities, candidate bounds, and timestamp formatting).
2. **Response Preservation:** The frontend client and UI components faithfully render backend response structures—including mapped, unmapped, reviewed, and unreviewed candidates—without inventing properties or altering deterministic Possibility Engine outcomes.
3. **Structured Error Handling:** All supported HTTP error responses (`400`, `422`, `429`, `502`, `503`, `504`) are correctly mapped and surfaced to users via UI error boundaries and alert banners.
4. **Live Network Boundary Verification:** Real browser instances communicate directly with a running FastAPI backend, verifying end-to-end data flow without mocking HTTP calls inside the browser page context.

---

## 2. Testing Architecture

### Level 1: Frontend Contract & Component Tests (Vitest)
- **Location:** [`frontend/src/lib/api/discoveryContract.test.tsx`](../frontend/src/lib/api/discoveryContract.test.tsx)
- **Fixtures:** [`frontend/src/lib/api/fixtures/discoveryContractFixtures.ts`](../frontend/src/lib/api/fixtures/discoveryContractFixtures.ts)
- **Mechanics:**
  - Mocked at the fetch boundary using sanitized fixtures generated directly from the backend Pydantic schemas.
  - Verifies request serialization for `city`, `cultural_interests`, `requirements` (`mandatory` vs `optional`), `max_candidates`, and ISO-8601 `evaluation_time`.
  - Verifies response parsing for mapped vs unmapped candidates and reviewed vs unreviewed evidence statuses.
  - Verifies UI rendering of all three Possibility Engine statuses: `VERIFIED_FIT`, `NEEDS_CONFIRMATION`, and `REQUIREMENT_CONFLICT`.
  - Verifies error parsing and component rendering (`ErrorDisplay`) for status codes `400`, `422`, `429`, `502`, `503`, and `504`.

### Level 2: Browser-to-Backend Integration Tests (Playwright)
- **Location:** [`frontend/e2e/contract_integration.spec.ts`](../frontend/e2e/contract_integration.spec.ts)
- **Test Server:** [`backend/app/test_server.py`](../backend/app/test_server.py)
- **Mechanics:**
  - Playwright starts both the Next.js production build (`http://localhost:3000`) and the FastAPI test server (`http://localhost:8000`) concurrently.
  - The test server runs the real FastAPI application (`backend/app/main.py`), real request validation (`DiscoverRequest`), real candidate resolution, and real Possibility Engine evaluation.
  - Upstream Qloo API calls are intercepted using an offline `httpx.MockTransport` stub returning deterministic entities (Calico Museum, Conflictorium, and an unmapped heritage tea stall).
  - Browser tests navigate to `http://localhost:3000`, fill out genuine user interests and accessibility requirements, submit the form, and assert that the rendered cards and badges match actual Possibility Engine evaluations transmitted over HTTP.
  - Direct boundary checks verify that FastAPI natively rejects invalid inputs (e.g. empty interest lists, extra undeclared fields, or unsupported cities) with `422` or `400`.

---

## 3. Evidence and Security Invariants

1. **No Fabricated Evidence:** Tests use real pilot evidence from [`backend/app/evidence/pilot_ahmedabad.py`](../backend/app/evidence/pilot_ahmedabad.py) or explicitly labeled sanitized test fixtures.
2. **Offline Independence:** Stub-based integration tests do not depend on external network connectivity or a live Qloo API key.
3. **No False Availability Claims:** Passing stub-based tests verifies boundary contract compatibility, not live Qloo service availability or rate limit capacity.
4. **Credential Safety:** Test scripts never access, create, or commit `.env` or credential files.

---

## 4. Local Execution Instructions

### A. Run Frontend Contract Unit Tests
From the `frontend` directory:
```bash
# Run discovery contract tests
npm test -- discoveryContract.test.tsx

# Run full frontend test suite
npm test
```

### B. Run Automated Browser-to-FastAPI Integration Tests
From the `frontend` directory (ensure frontend is built via `npm run build` if testing production server):
```bash
# Run all end-to-end and contract integration tests
npm run test:e2e

# Run only the browser-to-backend contract integration tests
npx playwright test e2e/contract_integration.spec.ts
```

> **Note on Playwright Orchestration:**  
> [`frontend/playwright.config.ts`](../frontend/playwright.config.ts) is configured to automatically launch both:
> 1. `python -m app.test_server --port 8000` (FastAPI backend with controlled Qloo stub)
> 2. `npm run start` (Next.js server on port 3000)

### C. Manual / Interactive Verification (Optional)
If running servers manually during development:

1. **Terminal 1 — Start Backend Test Server:**
   ```bash
   cd backend
   python -m app.test_server --port 8000
   ```
   Verify health:
   ```bash
   curl http://localhost:8000/health
   # {"status":"ok","version":"0.1.0"}
   ```

2. **Terminal 2 — Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Terminal 3 — Run Playwright in UI Mode:**
   ```bash
   cd frontend
   npx playwright test e2e/contract_integration.spec.ts --ui
   ```

### D. Run Backend Test Suite
From the `backend` directory:
```bash
pytest
ruff check .
ruff format --check .
```

---

## 5. Continuous Integration (CI)

In automated CI pipelines:
- Backend CI (`.github/workflows/backend-ci.yml`) runs `pytest` and `ruff`.
- Frontend CI runs `npm run lint`, `npm run type-check`, `npm test`, and `npm run test:e2e -- --workers=1`.
- Because `backend/app/test_server.py` uses an internal `httpx.MockTransport`, integration tests execute deterministically without external secrets or internet access.
