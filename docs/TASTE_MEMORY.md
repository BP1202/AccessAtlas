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
| `applyUsualInterestsToOuting(memory)` | Restores usual interests | Applies saved general interests (up to 5) to the active outing and clears override. |
| `setDifferentTodayOuting(memory, sparks)` | Sets different outing intent | Overrides active outing with 1–5 contrasting sparks while preserving general memory. |
| `setCustomOutingInterest(memory, interest)` | Sets specific outing topic | Sets a dedicated custom interest for today's visit while leaving general memory intact. |
| `clearOutingOverride(memory)` | Clears override | Reverts to usual interests and resets `isOutingOverridden` to `false`. |
| `prioritizeOutingInterests(memory, list)` | Interactive capacity curation | Curates outing focus down to <= 5 items without silent data loss. |
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

- **Compact Header**: Shows saved count pill (`X saved`) and toggle button (`Review your cultural notes ↓` / `Hide journal ↑`).
- **Four Categorized Sections**:
  1. **Focus for This Outing (X/5)**: Active interests with override badge, `↺ Switch back to usual interests` control, remove (`×`), and `Save for later ↗` actions.
  2. **My Stated Interests**: General explicit interests with `+ This outing`, `Later`, and remove (`×`) actions, plus an inline quick-add form.
  3. **Suggested from Cultural Compass**: Shows compass signals with provenance badges (`From: Compass` / `From: Both`) and `+ This outing` actions.
  4. **Saved for Another Outing**: Future ideas with `↑ Move to outing` and remove (`×`) actions.
- **Reset Memory Control**: Interactive reset button that prompts the visitor and clears both memory and session storage.
- **Warm Editorial Language**: Exclusively visitor-first terms; zero technical or developer jargon.

---

## 6. Current-Outing Intent Layer (`CurrentOutingControls`)

Implemented in [`frontend/src/components/discovery/CurrentOutingControls.tsx`](../frontend/src/components/discovery/CurrentOutingControls.tsx):

### 6.1 Purpose & Separation
Visitors frequently have a broad cultural appetite (e.g. textiles and heritage havelis) but desire something focused or different for a specific afternoon (e.g. contemporary art or sound design).

The Current-Outing Intent Layer enforces the following guarantees:
1. **Priority Over History**: When an override is selected, only today's choice is sent to the existing Discovery API (`DiscoverRequest.cultural_interests`).
2. **Preservation of General Memory**: General interests (`explicitInterests`, `compassInterests`) remain completely unmodified.
3. **Instant Restorability**: Visitors can switch back to their usual interests at any moment via `↺ Switch back to usual interests`.
4. **Three Intuitive Modes**:
   - `usual`: Explore my usual interests (uses saved journal notes).
   - `different`: Explore something different today (curated contrasting sparks like Contemporary art, Modern architecture, Sound archives).
   - `custom`: Enter a specific interest for this outing (targeted single topic).
5. **Interactive Limit Prioritization**: When selections exceed the Discovery API limit (1–5 cultural interests), an interactive prioritization alert allows visitors to confirm their 1–5 focal topics without silent truncation.
6. **Independence of Practical Requirements**: Essential and optional practical requirements (step-free entrance, quiet spaces, etc.) are strictly separated from cultural tastes and remain intact across all outing mode transitions.

---

## 7. Out of Scope & Deferred Items

The following capabilities are explicitly deferred:
- **Issue 09**: Recommendation feedback and tuning controls.
- **Phase 3**: Cross-device account persistence, database synchronization, and multi-user profile sharing.

