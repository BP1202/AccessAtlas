# AccessAtlas — LangGraph Agent Orchestration Foundation

This document defines the architecture, workflow topology, trust boundaries, and operational contracts of the LangGraph agent orchestration layer in AccessAtlas ([`backend/app/agent`](../backend/app/agent)).

---

## 1. Architectural Objective

The agent orchestration layer connects expressed visitor cultural interests with independently sourced evidence and deterministic suitability evaluation. It unifies five key components:

1. **Expressed Visitor Request**: Explicit cultural interests and structured practical participation requirements.
2. **Qloo Cultural Discovery**: Verified entity search and affinity intelligence without inferring personal requirements or protected characteristics.
3. **Explicit Candidate Resolution**: Strict trust boundary mapping cultural entities to physical venue identifiers without fuzzy guesswork.
4. **Independent Evidence Retrieval**: Extraction of independently audited and verified practical facts from the evidence repository.
5. **Deterministic Possibility Engine Evaluation**: Pure, machine-evaluable suitability evaluation preserving 3-state outcomes (`VERIFIED_FIT`, `NEEDS_CONFIRMATION`, `REQUIREMENT_CONFLICT`).
6. **Structured Participation Planning**: Generation of grounded participation plans containing supported attributes, evidence gaps, confirmation questions, and next actions.

---

## 2. Graph Topology & Routing

The workflow is constructed using LangGraph's `StateGraph` ([`app.agent.graph.create_agent_graph`](../backend/app/agent/graph.py)) and executed synchronously via `AccessAtlasAgent`:

```text
       [START]
          |
          v
   +--------------+
   |   discover   |  (Qloo entity lookup)
   +--------------+
          |
   (route_after_discovery)
          |
          +---> [Error or 0 candidates] --------+
          |                                      |
          +---> [Candidates found]               |
                     |                           |
                     v                           |
              +--------------+                   |
              |   resolve    |  (Explicit mapping)
              +--------------+                   |
                     |                           |
                     v                           |
              +--------------+                   |
              |   evaluate   |  (Possibility Engine)
              +--------------+                   |
                     |                           |
                     v                           |
              +--------------+                   |
              |     plan     | <-----------------+
              +--------------+
                     |
                     v
                   [END]
```

### Node Responsibilities

1. **`discover` (`discover_cultural_candidates`)**:
   - Queries `QlooClient.search_entities`.
   - Bounds the number of processed candidates (`max_candidates`, default 5).
   - Sanitizes provider exceptions (network timeouts, HTTP 401/429) to prevent credential disclosure.
2. **`resolve` (`resolve_candidates`)**:
   - For each discovered entity, looks up verified mappings via `CandidateResolver`.
   - Retrieves matching `EvidenceRecord` from `VenueEvidenceRepository`.
   - Assigns a resolution status: `RESOLVED`, `UNMAPPED`, or `MISSING_EVIDENCE`.
3. **`evaluate` (`evaluate_candidates`)**:
   - For `RESOLVED` candidates with an `EvidenceRecord`, invokes `PossibilityEngine.evaluate`.
   - Attaches `PossibilityAssessment` with per-requirement assessments and evidence references.
   - Leaves unmapped or missing-evidence candidates unevaluated.
4. **`plan` (`build_participation_plans`)**:
   - Synthesizes findings, gaps, confirmation questions, and next actions into `CandidateParticipationPlan` records.
   - Assembles the final `AgentWorkflowOutput`.

---

## 3. Strict Trust Boundaries & Candidate Resolution

A core architectural invariant of AccessAtlas is that **a cultural entity is not automatically a physical venue or experience**:

1. **No Fuzzy Guesswork**:
   - The engine never guesses mappings based on lexical similarity or geographic proximity.
   - Mappings must be explicitly registered and human-reviewed (`CandidateMapping`).
2. **Unmapped Entities Remain Unresolved**:
   - If an entity is not explicitly mapped, its status is `UNMAPPED`.
   - Unmapped candidates **never** receive a fabricated evidence record, synthetic audit, or `VERIFIED_FIT` outcome.
3. **Missing Mapped Evidence**:
   - If an explicit mapping references a venue ID not present in the repository, it produces `MISSING_EVIDENCE`. The system never silently substitutes another venue.
4. **Future Pilot-City Data Collection**:
   - Real-world venue mapping and evidence collection remain future work. Current mappings and fixtures in tests are strictly synthetic.

---

## 4. Grounded Participation Plan Contract

Each candidate in the workflow output produces a [`CandidateParticipationPlan`](../backend/app/agent/models.py):

| Field | Type | Semantic Guarantee |
|---|---|---|
| `candidate` | `QlooEntity` | Original cultural discovery reference. |
| `resolution_status` | `CandidateResolutionStatus` | `RESOLVED`, `UNMAPPED`, or `MISSING_EVIDENCE`. |
| `venue_id` | `str | None` | Target venue ID if mapped. |
| `experience_id` | `str | None` | Target experience ID if mapped. |
| `possibility_assessment` | `PossibilityAssessment | None` | Legitimate assessment; `None` if unmapped or missing. |
| `supported_findings` | `list[str]` | Human-readable descriptions of verified attributes. |
| `unresolved_gaps` | `list[str]` | Attributes with missing, expired, or conflicting evidence. |
| `confirmation_questions` | `list[str]` | Specific questions grounded in actual evidence gaps. |
| `suggested_next_actions` | `list[str]` | Practical next steps distinguishing verified fits from items needing confirmation. |
| `provenance_sources` | `list[EvidenceSource]` | Preserved source provenance (URLs, titles, timestamps). |

### Truth Invariants
- **No Fabricated External Actions**: The system never claims that a venue was contacted, a booking was verified, or staff were spoken to when no such integration ran.
- **Clear Distinction**: Culturally relevant candidates are clearly distinguished from verified practical fits.
- **Deterministic Next Actions**:
  - `VERIFIED_FIT`: Suggests proceeding with visit planning and checking official ticketing.
  - `NEEDS_CONFIRMATION`: Suggests contacting venue accessibility coordinators to resolve specific questions.
  - `REQUIREMENT_CONFLICT`: Explicitly warns of hard barriers and suggests alternative cultural options.
  - `UNMAPPED`: Directs the user to conduct independent research before planning travel.

---

## 5. Dependency Injection & Offline Testability

All workflow components support full dependency injection through `AccessAtlasAgent`:

- `qloo_client`: Mocked in automated unit tests (`unittest.mock.MagicMock`).
- `resolver`: `InMemoryCandidateResolver` with controlled test fixtures.
- `evidence_repo`: `InMemoryVenueEvidenceRepository` with synthetic fixtures.
- `engine`: `PossibilityEngine` instance.

This architecture enables 100% offline unit testing with deterministic reproducibility and zero external network calls.
