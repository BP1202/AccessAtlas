# AccessAtlas — Qloo Discovery Capabilities & Cultural Threads Feasibility Audit

**Status:** Technical Audit & Feasibility Assessment  
**Author:** AccessAtlas Engineering  
**Scope:** Backend Qloo Integration, Discovery Breadth, Cultural Threads Feasibility, Data Contracts  
**Target Branch:** `docs/qloo-discovery-audit`  
**Governing Documents:** `AGENTS.md`, `SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/AGENT_ORCHESTRATION.md`, `docs/PRODUCT.md`

---

## 1. Executive Summary & Audit Context

This audit evaluates the existing AccessAtlas Qloo integration against the official Qloo LLM Hackathon documentation, the official `qloo-hackathon-kit` reference implementation, and the currently implemented backend codebase.

Its purpose is to:
1. Ground future development of **Cultural Threads** in verified API capabilities rather than speculative assumptions.
2. Establish a truthful data contract that prohibits fabricated relationship strengths, synthetic confidence percentages, and ungrounded LLM narrative connections.
3. Clarify the architectural boundary between **cultural candidate discovery breadth** and **reviewed venue participation evidence**.
4. Report the exact live provider verification status and identify necessary test fixtures.

### Key Audit Conclusions

* **Endpoints Confirmed:** `GET /search` and `GET /v2/insights` are fully supported by the official Qloo Hackathon API (`https://hackathon.api.qloo.com`) and implemented with type safety in `backend/app/qloo/client.py`.
* **Affinity vs. Explanation:** Qloo returns aggregate cultural affinities and entity popularity scores ($0.0$ to $1.0$). **Qloo does NOT return pairwise affinity strength scores (e.g., "92% match") or natural language connection explanations.** Any narrative explanation must be derived deterministically from shared entity tags, subtypes, or explicit visitor query terms.
* **Separation of Concerns:** Qloo data describes cultural curiosity. It contains **zero** evidence regarding physical accessibility, operational hours, ticketing policies, or sensory accommodations. Qloo affinity must never be presented as evidence of venue suitability.
* **Discovery Breadth vs. Evidence Review:** The backend does **not** restrict Qloo candidate discovery to the three reviewed Ahmedabad venues. Any cultural candidate surfaced by Qloo is returned in the API response. However, only venues with human-audited evidence in `VenueEvidenceRepository` can be deterministically evaluated by the Possibility Engine (`RESOLVED`). Unmapped entities are honestly reported as `UNMAPPED` with `"Visit information not yet reviewed"`.

---

## 2. Existing Integration Audit

### 2.1 Qloo Client Implementation Overview

The Qloo integration lives in `backend/app/qloo/`:
* [`backend/app/qloo/client.py`](../backend/app/qloo/client.py): HTTP client wrapping `httpx.Client` with timeout bounds, authentication, and error handling.
* [`backend/app/qloo/models.py`](../backend/app/qloo/models.py): Normalized Pydantic domain models and exception hierarchy.
* [`backend/app/qloo/ahmedabad_lookup.py`](../backend/app/qloo/ahmedabad_lookup.py): Authorized developer inspection script for candidate identification.
* [`backend/app/qloo/live_smoke_test.py`](../backend/app/qloo/live_smoke_test.py): Safe verification smoke test script.

### 2.2 Currently Implemented Endpoints & Parameters

| Endpoint | Method | Implemented Method | Purpose in Application | Request Parameters |
|---|---|---|---|---|
| `/search` | `GET` | `QlooClient.search_entities` | Resolves user-expressed search strings into cultural entities. | `query` (string, required)<br>`types` (comma-separated URN list, optional)<br>`take` (integer, bounded 1–100, default 10)<br>`page` (integer, $\ge 1$, default 1) |
| `/v2/insights` | `GET` | `QlooClient.get_insights` | Discovers culturally correlated entities across domains given anchor entity signals. | `filter.type` (target URN, e.g. `urn:entity:movie`, required)<br>`signal.interests.entities` (comma-separated entity IDs, required)<br>`take` (integer, bounded 1–100, default 10)<br>`page` (integer, $\ge 1$, default 1) |

#### Target Entity Types Supported (`SUPPORTED_INSIGHTS_TYPES`)
Conforming to official Qloo documentation:
* `urn:entity:artist`
* `urn:entity:book`
* `urn:entity:brand`
* `urn:entity:destination`
* `urn:entity:movie`
* `urn:entity:person`
* `urn:entity:place` (primary target for AccessAtlas outing discovery)
* `urn:entity:podcast`
* `urn:entity:tv_show`
* `urn:entity:video_game`

### 2.3 Response Structures & Normalization

Raw Qloo responses wrap entity lists in a `results` array or a nested `results.entities` dictionary. The application normalizes these via `_normalize_entity` into a strongly-typed Pydantic model:

```python
class QlooEntity(BaseModel):
    model_config = ConfigDict(frozen=True)

    entity_id: str
    name: str
    entity_type: str
    subtype: str | None = None
    popularity: float | None = None
    disambiguation: str | None = None
    tags: list[QlooEntityTag] = Field(default_factory=list)
    properties: dict[str, Any] = Field(default_factory=dict)
```

#### Field Mapping & Extraction
* **`entity_id`**: Extracted from raw `entity_id`, fallback to `id` or `uuid`.
* **`name`**: Extracted from `name` or `title`.
* **`entity_type`**: Extracted from `type`, fallback to `subtype`, default `"urn:entity"`.
* **`subtype`**: Extracted from `subtype` when distinct from `type`.
* **`popularity`**: Extracted and cast to `float` if present (values typically $0.0$ to $1.0$).
* **`disambiguation`**: Extracted string providing brief context (e.g., `"2001, Hayao Miyazaki"` or `"Shahibaug, Ahmedabad"`).
* **`tags`**: Extracted as a list of `QlooEntityTag(id, name, tag_type)`. Tags represent genres, cultural movements, or thematic categories (e.g., `urn:tag:genre:animation`, `urn:tag:concept:textiles`).
* **`properties`**: Safe allow-list extraction:
  * Supported keys: `description`, `release_year`, `release_date`, `content_rating`, `duration`, `filming_location`, `production_companies`, `websites`, `image_url`.

### 2.4 Fields Discarded During Normalization

To enforce security boundaries, avoid privacy leaks, and maintain lean memory footprints, `_normalize_entity` deliberately discards:
1. **Raw Provider Payloads**: Unsanitized nested JSON objects.
2. **Massive Alias Lists (`akas`)**: Hundreds of international naming variations.
3. **External ID Graphs**: Raw Wikidata, IMDb, MusicBrainz, or third-party scraping keys.
4. **Internal Scoring Hashes**: Undocumented internal algorithm weights.
5. **Private Provider Metadata**: Headers, request echo payloads, and billing tokens.

### 2.5 Error, Timeout & Lifecycle Handling

* **Authentication (HTTP 401):** Raises `QlooAuthenticationError`. Sanitized at API boundary to `HTTP 502 Bad Gateway` ("Upstream cultural discovery authentication failed").
* **Forbidden (HTTP 403):** Raises `QlooResponseError(status_code=403)`.
* **Not Found (HTTP 404):** Per Qloo convention on `/search`, HTTP 404 signifies zero matching entities. Handled gracefully by returning an empty result object (`{"success": True, "results": []}`).
* **Rate Limits (HTTP 429):** Raises `QlooRateLimitError`. Sanitized at API boundary to `HTTP 429 Too Many Requests`.
* **Timeouts:** Bounded by `timeout=10.0` seconds on `httpx.Client`. Raises `QlooTimeoutError`. Sanitized at API boundary to `HTTP 504 Gateway Timeout`.
* **Client Lifecycle:** Managed via FastAPI dependency `get_qloo_client` in [`backend/app/api/deps.py`](../backend/app/api/deps.py). Uses a Python generator (`yield client; client.close()`) to guarantee HTTP connection pool teardown without persistent global leaks.
* **Caching:** **No caching layer is currently implemented.** Every discovery request triggers a live outbound call to Qloo.

---

## 3. Cultural Threads Feasibility Analysis

"Cultural Threads" is a planned feature intended to explain the cultural journey from a visitor's initial curiosity to unexpected physical spaces and related cultural directions.

### 3.1 Element Classification Matrix

Every proposed element of a Cultural Thread must be grounded in an auditable source:

| Proposed Thread Element | Feasibility Classification | Source of Truth | Notes & Constraints |
|---|---|---|---|
| **Starting Interest** | **Explicit Visitor Selection** | User Input (`cultural_interests`) | Exclusively provided by visitor. Never inferred from sensitive personal details. |
| **Resolved Qloo Entity** | **Directly Supported by Qloo** | Qloo `GET /search` | Entity identified by name matching, disambiguated by Qloo ID and type. |
| **Related Cultural Direction** | **Directly Supported by Qloo** | Qloo `GET /v2/insights` | Cross-domain recommendations (e.g. related authors, architectural styles, film movements). |
| **Discovered Candidate** | **Directly Supported by Qloo** | Qloo `GET /search` or `GET /v2/insights` | Place entities (`urn:entity:place`) in target destination. |
| **Connection Explanation** | **Derived Deterministically** | Internal Heuristic on Response Fields | **NOT directly provided by Qloo.** Must be constructed from overlapping `tags`, shared `subtype`, or intersection with explicit query terms. |
| **Provenance** | **Derived Deterministically** | Request metadata & Evidence records | Contains Qloo entity UUID, endpoint called, retrieval timestamp, and verified venue sources. |
| **Source Identifier** | **Directly Supported by Qloo** | Qloo `entity_id` | Canonical UUID (e.g. `783C0235-681D-4235-BA4D-A57992F7C97A`). |
| **Confidence / Score** | **Partially Supported (Constrained)** | Qloo `popularity` ($0.0$–$1.0$) | **Relationship-strength scores are UNSUPPORTED.** Popularity reflects general entity salience, NOT pairwise correlation strength. |

### 3.2 Evaluation of Connection Explanations

> [!CAUTION]
> **Anti-Pattern Warning:** Qloo's API does not output conversational or narrative text explaining why two entities are culturally connected. It is a mathematical affinity model.

#### Feasible Connection Explanations (Deterministic)
1. **Shared Cultural Tags:**
   * If Starting Entity has tag `urn:tag:genre:modernism` and Candidate Place has tag `urn:tag:genre:modernism`, the connection explanation is:
     * *"Both share cultural focus in Modernism."*
2. **Explicit Query Overlap:**
   * If the visitor requested *"Textiles"* and the candidate entity tags include *"Textiles & Weaving"*, the connection explanation is:
     * *"Direct match for expressed interest in Textiles."*
3. **Affinity Cluster Membership:**
   * If Candidate Place was returned in `/v2/insights` with `signal.interests.entities` set to Anchor ID:
     * *"Surfaced via cross-domain cultural affinity with [Anchor Name]."*

#### Prohibited Connection Explanations (Fabrications)
* Fabricated percentage scores (e.g., *"96% affinity match"*).
* Generative LLM hallucination of user motivations without grounded evidence.
* Claims that Qloo evaluated physical access suitability.

---

## 4. Review of Discovery Breadth vs. Pilot Evidence Mappings

A key question for this audit is whether the backend artificially limits discovery to the three reviewed Ahmedabad venues.

### 4.1 The Four Conceptual Boundaries

To understand the architecture, four distinct stages must be separated:

```
[ Visitor Request ]
        │
        ▼
1. QLOO CANDIDATE DISCOVERY (Broad, Unbounded)
   - Searches Qloo for cultural places in Ahmedabad
   - Returns all matching entities in Qloo's graph (e.g., 5 to 10 candidates)
        │
        ▼
2. APPROVED PILOT IDENTITY MAPPING (Strict 1-to-1)
   - Checks if Qloo UUID has a verified mapping in CandidateResolver
   - Prevents duplicate venues or out-of-scope branches (e.g. Raipur branch)
        │
        ▼
3. VENUE PARTICIPATION EVIDENCE (Independently Audited)
   - Looks up verified operational guidelines, wheelchair policy, seating facts
   - Found in VenueEvidenceRepository (Currently 3 reviewed pilot venues)
        │
        ▼
4. CANDIDATE EVALUATION ELIGIBILITY (Possibility Engine)
   - RESOLVED: Mapped + Evidence -> Evaluated deterministically (Verified Fit / Needs Confirmation / Conflict)
   - UNMAPPED: Discovered culturally, but no verified evidence -> Displayed honestly with "Not yet reviewed"
```

### 4.2 Current Backend Behavior

Inspection of [`backend/app/agent/nodes.py`](../backend/app/agent/nodes.py) and [`backend/app/agent/resolution.py`](../backend/app/agent/resolution.py) confirms:
1. **Discovery is Unrestricted:** In `discover_cultural_candidates`, `client.search_entities` queries Qloo with `query=cultural_query`. It does **not** filter out unmapped entities.
2. **Resolution Assigns Honest Status:**
   * Candidates with reviewed mappings (Calico, Kasturbhai Lalbhai, Conflictorium) $\rightarrow$ `CandidateResolutionStatus.RESOLVED`.
   * Other cultural candidates returned by Qloo $\rightarrow$ `CandidateResolutionStatus.UNMAPPED`.
3. **Possibility Engine Protects Evidence Integrity:**
   * Only `RESOLVED` candidates pass through `PossibilityEngine.evaluate`.
   * `UNMAPPED` candidates are **never** assigned synthetic accessibility facts or false verified badges.
4. **Honest Frontend Presentation:**
   * In the API response (`DiscoverResponse`), `plans` contains both mapped and unmapped candidates.
   * Unmapped candidates show `resolution_status: "unmapped"` and `possibility_assessment: null`.

**Audit Finding:** The backend does **not** unnecessarily limit discovery breadth. It allows visitors to see what Qloo discovered culturally, while strictly preventing the system from guessing accessibility at venues where no evidence has been collected.

---

## 5. Unsupported Assumptions & Architectural Risks

| Assumption / Proposed Feature | Support Status | Architectural Risk | Required Mitigation |
|---|---|---|---|
| **Pairwise Relationship Strength** (e.g., "Score: 88%") | **UNSUPPORTED** | Misleads visitors into thinking affinity is an exact percentage; violates `AGENTS.md`. | Drop pairwise score. Use only entity-level `popularity` if displayed, clearly labeled as general cultural popularity. |
| **Qloo Explanation Text** | **UNSUPPORTED** | Hallucinating provider data. | Generate connection rationales deterministically from shared tags. |
| **Qloo Geographic Boundary Filtering** | **LIMITED** | Qloo places can have ambiguous addresses or duplicates (e.g., Conflictorium Raipur branch). | Rely on approved pilot mappings for physical verification; do not trust Qloo coordinates for street-level routing. |
| **Qloo Accessibility Signals** | **COMPLETELY UNSUPPORTED** | Severe safety hazard for mobility-constrained visitors. | Enforce absolute architectural separation: Qloo for cultural affinity, `VenueEvidenceRepository` for accessibility. |
| **Real-Time LLM Narrative Injection** | **UNGOVERNED** | LLMs can silently override deterministic hard requirements. | Keep agent orchestration strictly deterministic in LangGraph; use LLMs only for phrasing explanations of verified facts. |

---

## 6. Proposed Minimal Cultural Threads Data Contract

To support Cultural Threads in future issues without violating product invariants, the following minimal data schema is recommended for `backend/app/agent/models.py`:

```python
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field
from app.qloo.models import QlooEntity, QlooEntityTag


class ThreadConnectionType(StrEnum):
    """Auditable classification of how the cultural thread connection was formed."""
    SHARED_TAG = "shared_tag"
    SHARED_SUBTYPE = "shared_subtype"
    CROSS_DOMAIN_AFFINITY = "cross_domain_affinity"
    EXPLICIT_INTEREST_MATCH = "explicit_interest_match"


class CulturalThreadConnection(BaseModel):
    """Deterministic, auditable connection rationale between anchor and candidate."""
    model_config = ConfigDict(frozen=True)

    connection_type: ThreadConnectionType = Field(
        description="The deterministic mechanism establishing this connection."
    )
    shared_descriptors: list[str] = Field(
        default_factory=list,
        description="Shared tag names, genres, or query keywords linking the entities."
    )
    rationale: str = Field(
        description="Transparent, deterministic explanation (e.g., 'Both share tag Modernism')."
    )


class CulturalThread(BaseModel):
    """A verified cultural connection from expressed interest to discovered candidate."""
    model_config = ConfigDict(frozen=True)

    thread_id: str = Field(description="Unique identifier for this cultural thread.")
    starting_interest: str = Field(description="Visitor's explicit expressed interest.")
    anchor_entity: QlooEntity | None = Field(
        default=None,
        description="Resolved starting entity from Qloo search, if entity-backed."
    )
    candidate_entity: QlooEntity = Field(
        description="Discovered place candidate in destination."
    )
    connection: CulturalThreadConnection = Field(
        description="Auditable connection rationale."
    )
    provenance_source: str = Field(
        default="qloo_cultural_ai",
        description="Origin of cultural signal (e.g. 'qloo_cultural_ai')."
    )
```

### Guarantees of this Contract
1. **Zero Invented Percentages:** No `affinity_score`, `confidence_pct`, or `strength_weight`.
2. **Explicit Connection Origin:** Every rationale must state whether it originated from a shared tag, shared subtype, or cross-domain affinity call.
3. **Clear Provenance:** Preserves Qloo entity identifiers throughout.

---

## 7. Backend Changes Required (Future Work)

When an authorized issue implements Cultural Threads, the following focused backend changes will be needed:

1. **Orchestration Node Addition:**
   * Introduce a `thread_builder` node in `backend/app/agent/nodes.py` that computes `CulturalThread` records after discovery and resolution.
2. **Deterministic Tag-Intersection Utility:**
   * Add a utility function `derive_thread_connection(anchor: QlooEntity, candidate: QlooEntity, explicit_query: str) -> CulturalThreadConnection`.
3. **DiscoverResponse Schema Extension:**
   * Extend `backend/app/api/v1/schemas.py` (`DiscoverResponse`) with an optional `threads: list[CulturalThread] = Field(default_factory=list)`.
4. **Caching Layer for Qloo Insights:**
   * Add an in-memory or Redis LRU cache for `QlooClient.get_insights` to prevent redundant upstream latency and quota consumption during cross-domain hops.

---

## 8. Provider Verification & Environment Audit

### 8.1 Live Verification Execution

On 2026-10-25, the developer live verification script [`backend/app/qloo/live_smoke_test.py`](../backend/app/qloo/live_smoke_test.py) was executed in the workspace:

```text
=== AccessAtlas Qloo Live Smoke Test ===
Base URL: https://hackathon.api.qloo.com
Credential status: configured

[Step 1/2] Testing entity lookup via GET /search...

[FAIL] Authentication failed (401 Unauthorized): Qloo authentication failed (HTTP 401). Verify your QLOO_API_KEY and QLOO_BASE_URL.
Check that your API key is valid for https://hackathon.api.qloo.com.
```

### 8.2 Live Verification Limitations & Security Integrity

* **Integrity Status:** Live verification against `hackathon.api.qloo.com` is currently **unavailable** in this execution environment because the active `QLOO_API_KEY` returned `HTTP 401 Unauthorized`.
* **Security Adherence:** In strict accordance with `SECURITY.md` and `AGENTS.md`:
  * No `.env`, `.env.local`, or secret credential files were opened, read, printed, or staged.
  * No API key strings or masked fragments were revealed in console logs or artifacts.
* **Verification Authority:** Because live provider calls failed authentication, this audit relies on:
  1. The official Qloo LLM Hackathon Developer Guide.
  2. The official `qloo/qloo-hackathon-kit` repository.
  3. The repository's 13 comprehensive unit tests in [`backend/tests/test_qloo.py`](../backend/tests/test_qloo.py), which mock and validate all request shapes, headers, query parameters, error responses, and normalization routines.

---

## 9. Recommended Test Fixtures for Cultural Threads

To prepare for future implementation without requiring live credentials during CI, the following mock fixtures should be created in `backend/tests/fixtures/qloo_threads.py`:

### Fixture 1: Cross-Domain Insights with Shared Thematic Tags
```json
{
  "anchor_entity": {
    "entity_id": "783C0235-681D-4235-BA4D-A57992F7C97A",
    "name": "Calico Museum of Textiles",
    "type": "urn:entity:place",
    "tags": [
      {"id": "urn:tag:concept:textiles", "name": "Textiles & Weaving", "type": "concept"},
      {"id": "urn:tag:concept:historic_craft", "name": "Historic Craft", "type": "concept"}
    ]
  },
  "candidate_entity": {
    "entity_id": "36537424-5653-418C-A39E-33C17214D423",
    "name": "Kasturbhai Lalbhai Museum",
    "type": "urn:entity:place",
    "tags": [
      {"id": "urn:tag:concept:historic_craft", "name": "Historic Craft", "type": "concept"},
      {"id": "urn:tag:genre:architecture", "name": "Colonial Architecture", "type": "genre"}
    ]
  },
  "expected_connection": {
    "connection_type": "shared_tag",
    "shared_descriptors": ["Historic Craft"],
    "rationale": "Both share cultural focus in Historic Craft."
  }
}
```

### Fixture 2: Insights Result Without Shared Tags (Affinity-Only)
Ensures the system falls back to `"Surfaced via cross-domain cultural affinity"` without hallucinating shared categories or synthetic percentage scores.

### Fixture 3: Unmapped Entity Candidate
Ensures that an unmapped regional place discovered via Qloo receives `resolution_status: "unmapped"` and its thread clearly indicates `"Visit information not yet reviewed"`.

---

## 10. Audit Sign-Off & Checklist

- [x] All currently used Qloo endpoints documented (`GET /search`, `GET /v2/insights`).
- [x] Request parameters, response structures, and normalization rules documented.
- [x] Fields discarded during normalization explicitly listed.
- [x] Error and timeout handling audited.
- [x] Cultural Threads feasibility classified for all proposed elements.
- [x] Prohibited anti-patterns (invented relationship strength, LLM hallucinations) identified.
- [x] Candidate discovery breadth distinguished from reviewed venue evidence.
- [x] Live smoke test execution attempted safely without exposing credentials; 401 status documented.
- [x] Minimal Cultural Threads data contract drafted with strict invariants.
- [x] Required future backend changes and test fixtures itemized.
- [x] Zero production code changed in this issue.
