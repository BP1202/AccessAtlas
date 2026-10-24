# AccessAtlas — Session Taste Memory Architecture

> **Document Purpose**: Defines the typed, deterministic data model, pure state-transition functions, session lifecycle, and editing interface for AccessAtlas Session Taste Memory.
>
> **Core Principle**: *"Taste Memory preserves explicit visitor choices while keeping cultural interests, current-outing preferences, practical requirements, and future interests strictly separated. It is an inspectable session aid, never an automated behavioral profiling system or medical assessment."*

---

## 1. Architectural Philosophy & Privacy Boundaries

### 1.1 Visitor Control vs. Automated Profiling
Most recommendation platforms create opaque, perpetual user profiles via clickstream tracking, hidden interest weights, and pseudo-psychological categorization.

AccessAtlas enforces the following invariants:
- **No Implicit Tracking**: Memory is populated strictly through explicit visitor interactions (typing topics, selecting sparks, answering comparisons, or choosing practical options).
- **No Hidden Scoring or Weights**: Interests are transparent strings; no hidden affinity coefficients, percentages, or behavioral scores are stored or calculated.
- **No Medical or Accessibility Inference**: Expressing interest in a quiet gallery or contemplative art is kept strictly under cultural tastes; it **never** automatically creates or infers a `quiet_space` or `sensory_adapted_session` requirement.
- **Session-Scoped Lifecycle**: Stored exclusively in browser `sessionStorage` (purged automatically when the browser tab is closed). No permanent accounts, database tables, or cross-site tracking cookies.
- **Explicit Reset Authority**: Visitors can reset all stored data with a single click at any time.

### 1.2 Separation of Concerns

Taste Memory cleanly isolates five distinct information domains:

```
┌──────────────────────────────────────────────────────────────┐
│                    SESSION TASTE MEMORY                      │
├────────────────────────────────┬─────────────────────────────┤
│ 1. Explicit Cultural Interests │ Hand-typed or chosen sparks │
├────────────────────────────────┼─────────────────────────────┤
│ 2. Compass-Derived Interests   │ Quiz suggestions + audit    │
│                                │ provenance records          │
├────────────────────────────────┼─────────────────────────────┤
│ 3. Focus for THIS Outing       │ 1–5 active interests sent   │
│                                │ to POST /api/v1/discover    │
├────────────────────────────────┼─────────────────────────────┤
│ 4. Practical Requirements      │ Independent accessibility,  │
│                                │ comfort & planning needs    │
├────────────────────────────────┼─────────────────────────────┤
│ 5. Future-Trip Interests       │ Saved for another outing    │
└────────────────────────────────┴─────────────────────────────┘
```

---

## 2. TypeScript Data Model

Defined in [`frontend/src/lib/taste/types.ts`](../frontend/src/lib/taste/types.ts):

```typescript
export const CURRENT_TASTE_MEMORY_VERSION = 1;

export interface TasteMemory {
  /** Schema version for forward-compatible evolution and validation */
  readonly schemaVersion: number;

  /** General cultural interests provided or confirmed by the visitor */
  readonly explicitInterests: readonly string[];

  /** Deterministic interests derived from Cultural Compass comparisons */
  readonly compassInterests: readonly string[];

  /** Complete provenance records for compass-derived signals */
  readonly compassProvenance: readonly SignalProvenance[];

  /** Pairwise compass comparison answers */
  readonly compassAnswers: CompassAnswers;

  /** Focused interests selected specifically for THIS outing (1–5 items) */
  readonly currentOutingInterests: readonly string[];

  /** Practical requirements stored independently from cultural interests */
  readonly practicalRequirements: Readonly<Record<EvidenceAttribute, PreferenceState>>;

  /** Cultural interests saved for another outing */
  readonly futureTripInterests: readonly string[];
}
```

---

## 3. Pure State-Update Functions

Implemented in [`frontend/src/lib/taste/state.ts`](../frontend/src/lib/taste/state.ts). All operations return new immutable state objects:

| Function | Purpose | Deterministic Guarantees |
| :--- | :--- | :--- |
| `createInitialTasteMemory()` | Creates default initial state | Returns versioned empty memory with all requirements set to `not_specified`. |
| `addExplicitInterest(memory, interest)` | Adds general cultural interest | Trims whitespace, enforces <= 100 char limit, rejects case-insensitive duplicates. |
| `removeExplicitInterest(memory, interest)` | Removes general interest | Case-insensitive removal from `explicitInterests`. |
| `updatePracticalRequirement(memory, attr, state)` | Updates practical preference | Immutably updates `practicalRequirements[attr]` without altering any cultural interests. |
| `setCompassState(memory, answers, aggregation)` | Updates compass results | Replaces pairwise answers, derived interests, and provenance records. |
| `setCurrentOutingInterests(memory, interests)` | Sets active outing focus | Deduplicates normalized strings and strictly constrains length to max 5. |
| `addCurrentOutingInterest(memory, interest)` | Adds interest to current outing | Appends if not already in outing and current count is < 5. |
| `removeCurrentOutingInterest(memory, interest)` | Removes from active outing | Case-insensitive removal. |
| `addFutureTripInterest(memory, interest)` | Saves interest for later | Appends to `futureTripInterests` if not duplicate. |
| `removeFutureTripInterest(memory, interest)` | Removes from future trips | Case-insensitive removal. |
| `moveInterestToOuting(memory, interest)` | Transitions from later to outing | Atomically removes from future trips and adds to current outing. |
| `moveInterestToFuture(memory, interest)` | Transitions from outing to later | Atomically removes from outing and adds to future trips. |
| `resetTasteMemory()` | Complete session reset | Returns a clean initial state. |
| `validateAndMigrateTasteMemory(raw)` | Resilient state recovery | Gracefully sanitizes corrupt or mismatched schema data without throwing runtime exceptions. |
| `tasteMemoryToDiscoverRequest(memory, city)` | Discovery API handoff | Converts only supported, confirmed fields into the existing `DiscoverRequest` contract. |

---

## 4. Session Lifecycle & Storage

Implemented in [`frontend/src/lib/taste/session.ts`](../frontend/src/lib/taste/session.ts):

- **Storage Key**: `accessatlas_session_taste_memory`
- **Mechanism**: `window.sessionStorage`
- **SSR Safety**: Guards against `window` being undefined during Next.js server-side rendering.
- **Storage Resilience**: Catches `QuotaExceededError` or private browsing access restrictions without crashing the application.
- **Automatic Validation**: Validates all deserialized JSON using `validateAndMigrateTasteMemory`.

---

## 5. Editing Interface (`TasteMemoryPanel`)

Implemented in [`frontend/src/components/discovery/TasteMemoryPanel.tsx`](../frontend/src/components/discovery/TasteMemoryPanel.tsx):

- **Compact Header**: Shows saved count pill (`X saved`) and toggle button (`Inspect taste memory ↓` / `Hide memory ↑`).
- **Four Categorized Sections**:
  1. **Focus for This Outing (X/5)**: Active interests with remove (`×`) and `Save for later ↗` actions.
  2. **My Stated Interests**: General explicit interests with `+ This outing`, `Later`, and remove (`×`) actions, plus an inline quick-add form.
  3. **Suggested from Cultural Compass**: Shows compass signals with provenance badges (`From: Compass` / `From: Both`) and `+ This outing` actions.
  4. **Saved for Another Outing**: Future ideas with `↑ Move to outing` and remove (`×`) actions.
- **Reset Memory Control**: Interactive reset button that prompts the visitor and clears both memory and session storage.
- **No Deceptive Signals**: Strictly avoids personality scores, compatibility meters, or psychological labels.

---

## 6. Out of Scope & Deferred Items

The following capabilities are explicitly deferred:
- **Issue 08**: Current-outing ranking and prioritization logic.
- **Issue 09**: Recommendation feedback and tuning controls.
- **Phase 3**: Cross-device account persistence, database synchronization, and multi-user profile sharing.
