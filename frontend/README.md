# AccessAtlas — Frontend Foundation

Next.js frontend application for **AccessAtlas**, a visitor-first cultural discovery and participation planning platform.

> **Status Notice**: This package implements the foundational Next.js application, responsive layout, accessible typography, foundational UI and feedback components, typed backend API client, centralized visitor-facing assessment labels, Vitest unit test suite, and Playwright end-to-end smoke verification for the **Ahmedabad Pilot**.

---

## Technical Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | **Next.js** (App Router) | `16.4.2` | Core web application framework with Turbopack |
| Language | **TypeScript** | `^5` | Strict type safety and domain models |
| Styling | **Tailwind CSS** | `^4` | Warm neutral editorial styling with responsive tokens |
| Component Testing | **Vitest** & **React Testing Library** | `5.0.5` / `16.3.2` | Fast component & API client unit tests |
| DOM Environment | **jsdom** | `27.4.0` | Headless browser DOM simulation for tests |
| End-to-End Testing | **Playwright** | `^1.58.2` | Headless Chromium desktop & mobile smoke verification |

---

## Visitor-First Product Principles

1. **Visitor-Focused Language**: Public pages prioritize the visitor's outing. Internal engineering terminology (such as "Possibility Engine", "Qloo discovery", or backend model names) is translated into clear, respectful language:
   - `VERIFIED_FIT` $\rightarrow$ *"Meets your stated requirements"*
   - `NEEDS_CONFIRMATION` $\rightarrow$ *"Some details need checking"*
   - `REQUIREMENT_CONFLICT` $\rightarrow$ *"A stated requirement may not be met"*
   - Provenance $\rightarrow$ *"Where this information comes from"*
2. **Honesty Over False Certainty**: Meeting stated requirements indicates that published venue documentation supports those specific details. It is never presented as a guarantee of universal accessibility or current ticket availability.
3. **Respect for Privacy**: No sensitive health, disability, or identity characteristics are inferred from cultural tastes. Visitors indicate practical requirements (e.g. advance registration, seating) without needing to justify them.
4. **Backend Isolation**: `QLOO_API_KEY` exists exclusively in the backend runtime. The frontend communicates strictly with the AccessAtlas FastAPI service (`POST /api/v1/discover`).

---

## Route Structure

- `/` — Homepage: Editorial introduction, value proposition, visit details explanation, and reviewed Ahmedabad pilot spaces.
- `/explore` — Explore Ahmedabad: Functional, visitor-first cultural discovery experience connecting cultural curiosity with verified visit requirements via `POST /api/v1/discover`.
- `/how-it-works` — How AccessAtlas Works: Methodology, 3-state evaluation explanation, source provenance, and privacy commitment.
- `/about` — About AccessAtlas: Product mission, Ahmedabad heritage context, and visit verification standards.

---

## Project Structure

```text
frontend/
├── .env.example              # Safe template for client configuration
├── e2e/                      # Playwright end-to-end tests
│   ├── discovery.spec.ts     # 2-stage discovery flow, visit plan expansion, question kit copy
│   └── smoke.spec.ts         # Desktop & mobile smoke test, negative jargon assertions
├── playwright.config.ts      # Playwright runner and webServer configuration
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   │   ├── about/            # /about page
│   │   ├── explore/          # /explore 2-stage discovery journey & result view
│   │   │   ├── page.tsx      # Explore page coordinating interests, preferences, and results
│   │   │   └── page.test.tsx # Explore page integration tests
│   │   ├── how-it-works/     # /how-it-works methodology page
│   │   ├── globals.css       # Tailwind CSS v4 entrypoint with warm neutral theme
│   │   ├── layout.tsx        # Accessible RootLayout with Skip Link, Header, Footer
│   │   ├── page.tsx          # Visitor-first cultural landing page
│   │   └── page.test.tsx     # Landing page component unit test & negative jargon checks
│   ├── components/
│   │   ├── discovery/        # Interactive discovery experience components
│   │   │   ├── CandidateCard.tsx         # Cultural candidate card with outcome badges
│   │   │   ├── CandidateCard.test.tsx
│   │   │   ├── DiscoveryLoading.tsx      # Transparent, honest progress display
│   │   │   ├── InterestSelector.tsx      # Stage 1: Free-text input & suggestion chips
│   │   │   ├── InterestSelector.test.tsx
│   │   │   ├── PreferenceSelector.tsx    # Stage 2: Tri-state practical requirement controls
│   │   │   ├── PreferenceSelector.test.tsx
│   │   │   ├── QuestionKit.tsx           # Copyable question kit with clipboard feedback
│   │   │   ├── VisitPlanDetail.tsx       # Expandable visit plan & evidence citations
│   │   │   └── VisitPlanDetail.test.tsx
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
│   │   ├── api/              # Typed backend client & domain models
│   │   │   ├── client.ts     # AccessAtlasApiClient class & error handlers
│   │   │   ├── client.test.ts# Offline client unit tests
│   │   │   ├── contract.test.ts # Schema drift verification against backend contract
│   │   │   └── types.ts      # TypeScript schemas matching docs/API.md
│   │   └── constants/
│   │       ├── labels.ts       # Centralized visitor-facing assessment translations
│   │       └── requirements.ts # Supported backend practical requirement metadata
│   └── test/
│       └── setup.ts          # Vitest setup & @testing-library/jest-dom matchers
├── tsconfig.json             # TypeScript configuration with @/* path alias
└── vitest.config.ts          # Vitest configuration with React plugin and jsdom
```

---

## Local Development (Windows PowerShell)

All commands below should be executed from the `frontend/` directory:

```powershell
cd C:\Pro\AccessAtlas\frontend
```

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` if custom backend URL is required (never commit `.env.local`):

```powershell
Copy-Item .env.example .env.local
```

### 3. Run Development Server

```powershell
npm run dev
```

The application is accessible at `http://localhost:3000`.

### 4. Run Unit & Component Tests

```powershell
npm run test
```

### 5. Type-Check & Lint

```powershell
npm run type-check
npm run lint
```

### 6. Build Production Bundle

```powershell
npm run build
```

### 7. Run Playwright Smoke Tests

```powershell
npm run test:e2e
```
