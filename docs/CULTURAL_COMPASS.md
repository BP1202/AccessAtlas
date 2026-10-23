# AccessAtlas — Cultural Compass Catalogue & Deterministic Taste Signals

> **Document Purpose**: Defines the initial Cultural Compass question catalogue, stable internal identifiers, deterministic signal mappings, and aggregation engine for AccessAtlas.
>
> **Core Principle**: *"Cultural Compass is an optional discovery aid, not a personality test or medical questionnaire. Answers produce structured cultural interests that visitors can inspect, edit, or remove before discovery."*

---

## 1. Architectural Philosophy & Product Boundaries

### 1.1 Discovery Aid vs. Personality Test
Mainstream recommendation engines often employ pseudo-psychological quizzes or opaque percentage matching algorithms ("You are 82% an Adventurous Artisan"). 

AccessAtlas rejects this framing:
- **No Diagnostic or Psychometric Profiling**: Cultural Compass does not attempt to categorize a visitor's personality, psyche, or character.
- **No Medical or Accessibility Inference**: Answering a preference for a quiet gallery signals interest in visual fine art; it **never** infers a sensory processing condition or automatically creates a `quiet_space` accessibility requirement.
- **No Competitive Scoring**: Options are culturally meaningful trade-offs and aesthetics, with no "correct", "advanced", or "better" answers.
- **First-Class "Both" and "Neither / Skip"**: Visitors can choose both directions, neither, or skip any question without penalty.
- **Inspectable & Editable Output**: The catalogue yields human-readable cultural search topics that appear in the visitor's editable interest list. The visitor retains complete authority to remove, add, or customize topics.

### 1.2 User-Derived Interpretations vs. Qloo-Derived Affinities

AccessAtlas enforces an unambiguous boundary between user choices, product mappings, and Qloo AI signals:

```
┌──────────────────────────────────────────────────────────┐
│              EXPLICIT VISITOR CHOICE                     │
│  "Historic textile workshop" vs "Contemporary studio"    │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│      DETERMINISTIC COMPASS MAPPING (Product-Authored)    │
│  "Historic textile workshop" ──> "textiles",             │
│                                  "craft traditions"      │
│  * Product-authored interpretations of explicit choices  │
│  * NOT Qloo entity IDs or proprietary affinity weights   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              MANUAL CURATION / EDITING                   │
│  Visitor reviews, adds, or removes topics in UI          │
│  (Enforces 1–5 Discovery API limits)                     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│           QLOO CULTURAL AI RESOLUTION (Backend)          │
│  `POST /api/v1/discover` sends topics to Qloo Search     │
│  Surfaces cross-domain candidate venues via affinity     │
└──────────────────────────────────────────────────────────┘
```

1. **Deterministic Signals are Product-Authored**: The mappings in this catalogue (`historic_textile_workshop` → `["textiles", "craft traditions"]`) represent explicit design decisions authored by AccessAtlas. They are **not** claims of official Qloo taxonomy, tags, or entity IDs.
2. **Qloo Resolution Happens Upstream**: When the curated interests are submitted to `POST /api/v1/discover`, the backend resolves those search strings against Qloo Cultural AI (`GET /search`). Qloo evaluates cultural affinities; the frontend catalogue merely helps visitors articulate their initial curiosities.

---

## 2. Complete Question Catalogue

The catalogue consists of 5 focused, non-judgmental comparisons implemented in [`frontend/src/lib/compass/questions.ts`](../frontend/src/lib/compass/questions.ts).

### Question Overview Table

| Question ID | Comparison Prompt | Option A (`id`) | Option A Signals | Option B (`id`) | Option B Signals |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `textiles_vs_contemporary_studio` | Historic textile workshop versus contemporary design studio | `historic_textile_workshop` | `textiles`, `craft traditions` | `contemporary_design_studio` | `contemporary art`, `design` |
| `mountain_craft_village_vs_coastal_heritage_town` | Mountain craft village versus coastal heritage town | `mountain_craft_village` | `craft traditions`, `folk art` | `coastal_heritage_town` | `heritage architecture`, `history` |
| `quiet_gallery_vs_lively_festival` | Quiet gallery versus lively cultural festival | `quiet_gallery` | `visual arts`, `fine art` | `lively_cultural_festival` | `performing arts`, `cultural festivals` |
| `traditional_techniques_vs_experimental_art` | Traditional making techniques versus experimental visual art | `traditional_making_techniques` | `craft traditions`, `textiles` | `experimental_visual_art` | `contemporary art`, `sculpture` |
| `historic_architecture_vs_modern_design` | Historic architecture versus modern design | `historic_architecture` | `heritage architecture`, `history` | `modern_design` | `modernist architecture`, `design` |

---

## 3. Detailed Question Specifications

### Question 1: `textiles_vs_contemporary_studio`
- **Prompt**: *"Historic textile workshop versus contemporary design studio"*
- **Context Narrative**: Comparing centuries-old living fabric craft traditions with modern interdisciplinary studio design.
- **Option A**:
  - **ID**: `historic_textile_workshop`
  - **Label**: *"Historic textile workshop"*
  - **Description**: *"Handloom weaving, hand-carved block printing vats, and living artisan fabric traditions."*
  - **Signals**: `["textiles", "craft traditions"]`
- **Option B**:
  - **ID**: `contemporary_design_studio`
  - **Label**: *"Contemporary design studio"*
  - **Description**: *"Modern multidisciplinary design, typography, industrial design, and contemporary studio practice."*
  - **Signals**: `["contemporary art", "design"]`

### Question 2: `mountain_craft_village_vs_coastal_heritage_town`
- **Prompt**: *"Mountain craft village versus coastal heritage town"*
- **Context Narrative**: Comparing focused regional artisan communities with layered historic maritime trade architecture.
- **Option A**:
  - **ID**: `mountain_craft_village`
  - **Label**: *"Mountain craft village"*
  - **Description**: *"Generational maker settlements dedicated to pottery, vernacular woodcarving, and folk craft."*
  - **Signals**: `["craft traditions", "folk art"]`
- **Option B**:
  - **ID**: `coastal_heritage_town`
  - **Label**: *"Coastal heritage town"*
  - **Description**: *"Layered mercantile history, maritime trade routes, stone fortifications, and heritage streetscapes."*
  - **Signals**: `["heritage architecture", "history"]`

### Question 3: `quiet_gallery_vs_lively_festival`
- **Prompt**: *"Quiet gallery versus lively cultural festival"*
- **Context Narrative**: Comparing serene visual art contemplation with vibrant communal gatherings and folk performance.
- **Option A**:
  - **ID**: `quiet_gallery`
  - **Label**: *"Quiet contemplative gallery"*
  - **Description**: *"Serene exhibition rooms designed for close visual contemplation of fine art, drawing, and painting."*
  - **Signals**: `["visual arts", "fine art"]`
  - **Separation Boundary**: Emits artistic interest in visual fine arts. Does **not** emit accessibility attributes (such as `quiet_space` or `sensory_adapted_session`).
- **Option B**:
  - **ID**: `lively_cultural_festival`
  - **Label**: *"Lively cultural festival"*
  - **Description**: *"Dynamic communal festivities featuring folk performances, oral traditions, and live dialogue."*
  - **Signals**: `["performing arts", "cultural festivals"]`

### Question 4: `traditional_techniques_vs_experimental_art`
- **Prompt**: *"Traditional making techniques versus experimental visual art"*
- **Context Narrative**: Comparing ancestral, master-artisan craftsmanship with avant-garde conceptual art and new media.
- **Option A**:
  - **ID**: `traditional_making_techniques`
  - **Label**: *"Traditional making techniques"*
  - **Description**: *"Mastery of time-tested generational techniques in natural dyes, embroidery, metal casting, and stone."*
  - **Signals**: `["craft traditions", "textiles"]`
- **Option B**:
  - **ID**: `experimental_visual_art`
  - **Label**: *"Experimental visual art"*
  - **Description**: *"Site-specific installations, modern conceptual sculpture, and experimental multimedia works."*
  - **Signals**: `["contemporary art", "sculpture"]`

### Question 5: `historic_architecture_vs_modern_design`
- **Prompt**: *"Historic architecture versus modern design"*
- **Context Narrative**: Comparing intricately carved timber facades and monumental stone stepwells with modernist spatial geometry.
- **Option A**:
  - **ID**: `historic_architecture`
  - **Label**: *"Historic architecture"*
  - **Description**: *"Carved wooden residential havelis, monumental stepwells, ornamental arches, and ancestral stone gateways."*
  - **Signals**: `["heritage architecture", "history"]`
- **Option B**:
  - **ID**: `modern_design`
  - **Label**: *"Modern design"*
  - **Description**: *"Mid-century modernist brick vaults, brutalist concrete forms, and clean spatial minimalism."*
  - **Signals**: `["modernist architecture", "design"]`

---

## 4. Signal Type Separation & Boundary Rules

To protect visitor trust and engineering integrity, Cultural Compass signals must never cross into other system domains:

| Signal Type | Example | Handling in Cultural Compass | System Domain |
| :--- | :--- | :--- | :--- |
| **Cultural Interest** | `"textiles"`, `"contemporary art"`, `"heritage architecture"` | **Emitted directly** into visitor's interest selection. | Discovery API `cultural_interests` (Qloo query). |
| **Outing Atmosphere / Mood** | Contemplative pace, festive celebration | Reflected in artistic domain (`visual arts` vs `performing arts`). | General context; never forced into hard requirements. |
| **Essential Practical Needs** | Step-free entrance, wheelchair access, elevator, seating | **STRICTLY EXCLUDED**. Never inferred from taste answers. | Evaluated only in Stage 2 via `requirements` controls. |
| **Sensory Accommodation** | Low sensory density hours, quiet space | **STRICTLY EXCLUDED**. Selecting a quiet gallery does not emit `quiet_space`. | Explicitly chosen by user under Comfort & Sensory preferences. |
| **Geographic Bounds** | Coastal town, mountain village | Evaluated as generic cultural styles (`craft traditions`, `folk art`). | **STRICTLY EXCLUDED** from location routing. Does not alter pilot city (`Ahmedabad`). |

---

## 5. Pure Deterministic Aggregation Engine

Implemented in [`frontend/src/lib/compass/signals.ts`](../frontend/src/lib/compass/signals.ts).

### 5.1 Function Signature
```typescript
export function aggregateCompassSignals(
  answers: CompassAnswers
): CompassAggregationResult
```

### 5.2 Deterministic Guarantees
1. **Identical Output for Identical Input**: Pure function without randomness, system clocks, or network dependencies.
2. **First-Class Selection Handling**:
   - `option_a`: Emits Option A signals.
   - `option_b`: Emits Option B signals.
   - `both`: Emits Option A signals followed by Option B signals.
   - `neither` / `skip`: Emits 0 signals.
3. **Traceability (Signal Provenance)**:
   Every derived interest maintains an audit record:
   - `sourceQuestionId`: Which question generated it.
   - `sourceOptionId`: Which option (or `'both'`) generated it.
   - `choice`: The visitor's selection.
   - `rationale`: Human-readable explanation.
4. **Normalized Deduplication**:
   Signals appearing across multiple questions (e.g., `"craft traditions"` in Questions 1, 2, and 4) are deduplicated in `interests` while preserving full provenance records.
5. **Discovery API Limit Adherence**:
   - Limit: `MAX_DISCOVERY_INTERESTS = 5`.
   - If aggregated unique interests exceed 5, `exceedsDiscoveryLimit` is set to `true` and an advisory notification is included.
   - **No Silent Discarding**: The system never silently drops interests to force compliance; visitors are invited to curate their top 5 topics in the UI before submission.
6. **Manual Interest Authority**:
   [`mergeWithManualInterests`](../frontend/src/lib/compass/signals.ts) guarantees that user-typed interests are always placed first and never overwritten by compass suggestions.

---

## 6. How Subsequent Issues Will Consume the Catalogue

The Cultural Compass catalogue and signals engine provide the foundation for subsequent issues in the Phase 2 roadmap:

1. **Interactive Compass UI (Next Issue)**:
   - Will render the 5 questions as engaging, card-based binary/multi-option choices in Entry Path B (`"Help me discover"`).
   - Allows users to step through, choose Option A / B / Both / Skip, and see real-time updates.
2. **Transparent Provenance Display**:
   - When compass interests are added to the shared chip bar, the UI will allow visitors to click an info badge on each chip to see why it was suggested (e.g., *"Suggested from your choice of Historic textile workshop"*).
3. **Curation Before Discovery**:
   - If more than 5 interests are generated, the UI will guide the visitor to select up to 5 preferred chips before continuing to Stage 2 (Practical Preferences).

---

## 7. Deferred Capabilities & Non-Goals

The following items are intentionally **out of scope** and deferred to future milestones:

- **No Psychometric Scoring**: Never assigning compatibility percentages or archetypes.
- **No LLM Narrative Invention**: Mappings remain strictly deterministic and auditable; no generative LLM hallucination of user tastes.
- **No Permanent Profile Storage**: Answers are kept in frontend component state during the session; user accounts and persistent taste profiles are deferred to Phase 3.
- **No Direct Qloo Entity Mappings**: The catalogue does not hardcode Qloo entity IDs (`urn:entity:place:...`); entity resolution remains the responsibility of the backend pipeline.
- **No Automated Destination Switching**: Even if questions mention coastal or mountain archetypes, discovery remains strictly anchored to the active reviewed pilot city (`Ahmedabad`).
