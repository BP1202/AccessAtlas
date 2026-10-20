# AccessAtlas — Frontend Foundation

Next.js frontend application for **AccessAtlas**, an agentic cultural discovery and participation planning platform developed for the Qloo Agentic Hackathon.

> **Status Notice**: This package implements the foundational Next.js application, responsive layout, accessible typography, foundational UI and feedback components, typed backend API client, Vitest unit test suite, and Playwright end-to-end smoke verification for the **Ahmedabad Pilot MVP**. The interactive discovery form and results explorer are scheduled for subsequent issues.

---

## Technical Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | **Next.js** (App Router) | `16.4.2` | Core web application framework with Turbopack |
| Language | **TypeScript** | `^5` | Strict type safety and domain models |
| Styling | **Tailwind CSS** | `^4` | Utility-first styling with responsive tokens |
| Component Testing | **Vitest** & **React Testing Library** | `5.0.5` / `16.3.3` | Fast component & API client unit tests |
| DOM Environment | **jsdom** | `^29.1.1` | Headless browser DOM simulation for tests |
| End-to-End Testing | **Playwright** | `^1.64.1` | Headless Chromium smoke verification |

---

## Architecture & Security Boundaries

### 1. Backend Isolation & Credential Safety
- **No Direct Third-Party Calls**: The frontend **never** connects directly to Qloo or external services. All cultural discovery signals and venue assessments are mediated through the AccessAtlas FastAPI backend.
- **Credential Protection**: `QLOO_API_KEY` exists exclusively in the backend runtime configuration. Privileged API keys or provider tokens are **never** bundled into browser code, exposed in environment variables with the `NEXT_PUBLIC_` prefix, or returned to clients.
- **Environment-Safe Backend URL**: The frontend references `NEXT_PUBLIC_BACKEND_URL` (defaulting safely to `http://127.0.0.1:8000`).

### 2. CORS & Proxy Policy
- In local development, the Next.js dev server runs on `http://127.0.0.1:3000` while the backend runs on `http://127.0.0.1:8000`.
- For production deployment, requests should be routed through a same-origin reverse proxy (e.g., `/api/*` forwarded to the FastAPI backend) or a strict, origin-restricted CORS allowlist. **Unrestricted wildcard (`*`) CORS in production is strictly prohibited.**

### 3. Product Invariants
- **No Inferred Invariants**: The frontend never infers medical conditions, physical disabilities, or protected personal characteristics from cultural interests.
- **Deterministic Suitability**: Suitability assessments rely strictly on the 3-state Possibility Engine (`VERIFIED_FIT`, `NEEDS_CONFIRMATION`, `REQUIREMENT_CONFLICT`). The frontend does not calculate speculative scores, confidence percentages, or popularity-weighted badges.

---

## Project Structure

```text
frontend/
├── .env.example              # Safe template for client configuration
├── e2e/                      # Playwright end-to-end tests
│   └── smoke.spec.ts         # Landing page and navigation smoke test
├── playwright.config.ts      # Playwright runner and webServer configuration
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   │   ├── globals.css       # Tailwind CSS v4 entrypoint
│   │   ├── layout.tsx        # Accessible RootLayout with Skip Link, Header, Footer
│   │   ├── page.tsx          # Minimal AccessAtlas landing page
│   │   └── page.test.tsx     # Landing page component unit test
│   ├── components/
│   │   ├── feedback/         # Loading, empty, and error state components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   ├── FeedbackComponents.test.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/           # Shared layout components
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   └── ui/               # Reusable foundational UI elements
│   │       ├── Alert.tsx
│   │       ├── Badge.tsx
│   │       ├── Badge.test.tsx
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       ├── Card.tsx
│   │       └── Container.tsx
│   ├── config/
│   │   └── env.ts            # Environment-safe backend URL helper
│   ├── lib/
│   │   └── api/              # Typed backend client & domain models
│   │       ├── client.ts     # AccessAtlasApiClient class & error handlers
│   │       ├── client.test.ts# Offline client unit tests
│   │       └── types.ts      # TypeScript schemas matching docs/API.md
│   └── test/
│       └── setup.ts          # Vitest setup & @testing-library/jest-dom matchers
├── tsconfig.json             # TypeScript configuration with @/* path alias
└── vitest.config.ts          # Vitest configuration with React plugin and jsdom
```

---

## Local Development (Windows PowerShell)

All commands below should be executed from the `frontend/` directory:

```powershell
# Navigate to the frontend directory
cd C:\Pro\AccessAtlas\frontend
```

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

The application defaults safely to `http://127.0.0.1:8000` without requiring an environment file.

To configure local overrides:
1. Inspect `.env.example` in `frontend/`.
2. Create `.env.local` inside `frontend/` (or repository root):
   ```ini
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
   ```
3. **Never** stage or commit `.env.local` to Git.

### 3. Run Development Server

```powershell
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## Verification & Quality Tooling

### Run Vitest Unit Tests

Executes all component and API client unit tests completely offline:

```powershell
npm run test
```

### Run TypeScript Type Check

Verifies strict type safety across all files without emitting code:

```powershell
npm run type-check
```

### Run ESLint

Verifies project code style and rules conformance:

```powershell
npm run lint
```

### Build Production Bundle

Tests Next.js Turbopack compilation and page pre-rendering:

```powershell
npm run build
```

### Run Playwright End-to-End Smoke Test

Executes headless Chromium smoke tests against the built Next.js application:

```powershell
npm run test:e2e
```
