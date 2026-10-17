# AccessAtlas — Deterministic Possibility Engine

This document defines the architecture, decision logic, vocabulary, and operational semantics of the **Possibility Engine** in AccessAtlas.

---

## 1. Objective and Core Principles

The Possibility Engine is a deterministic domain service designed to evaluate visitor participation requirements against independently sourced venue and experience evidence.

1. **Deterministic Evaluation**:
   - The engine does not rely on LLM prompts, heuristics, or fuzzy keyword matching to evaluate requirements.
   - Suitability outcomes are strictly reproducible: given the same `EvidenceRecord`, `ParticipationRequirement` set, and `evaluation_time`, the engine will always produce the exact same outcome.
2. **Independence from Cultural Discovery (Qloo)**:
   - Qloo affinity scores, taste profiles, and popularity signals are **never** used as evidence of accessibility or operational suitability.
   - The Possibility Engine accepts only explicit visitor requirements and source-backed `EvidenceRecord` data.
3. **No Numerical Accessibility Scores**:
   - The engine does not compute arbitrary accessibility percentages or scores (e.g., "92% accessible").
   - It computes an explainable 3-state aggregate outcome and granular per-requirement assessments.
4. **Preservation of Provenance and Disagreements**:
   - Source provenance (URLs, source types, timestamps) is preserved in all assessment results.
   - Conflicting claims between independent sources are never arbitrarily resolved or silenced.

---

## 2. Inputs and Outputs

### Inputs
- **`record: EvidenceRecord`**: Structured evidence container for a physical venue and optional experience. Contains venue-scoped and experience-scoped `AttributeEvidence`.
- **`requirements: list[ParticipationRequirement]`**: Explicit, structured user requirements.
- **`evaluation_time: datetime` (timezone-aware)**: Explicit reference datetime for evaluating time-sensitive validity (e.g. `valid_until` or freshness cutoffs). Ensures historical or testing reproducibility.

### Outputs
- **`PossibilityAssessment`**:
  - `venue_id: str`: Identifier of evaluated venue.
  - `experience_id: str | None`: Associated experience identifier if applicable.
  - `aggregate_outcome: PossibilityOutcome`: One of `VERIFIED_FIT`, `NEEDS_CONFIRMATION`, or `REQUIREMENT_CONFLICT`.
  - `evaluation_time: datetime`: Timezone-aware timestamp of the evaluation.
  - `assessments: list[RequirementAssessment]`: Granular per-requirement results.
  - `summary: str`: Human-readable, explainable summary of the aggregate result.

---

## 3. Requirement Vocabulary and Models

The engine uses a strongly typed model ([`app.possibility.models.ParticipationRequirement`](../backend/app/possibility/models.py)):

| Field | Type | Description |
|---|---|---|
| `requirement_id` | `str` | Unique requirement identifier (e.g. `"req_step_free"`). |
| `attribute` | `EvidenceAttribute` | Practical attribute from the controlled vocabulary (e.g. `STEP_FREE_ENTRANCE`). |
| `scope` | `ClaimScope` | Scope of the requirement: `ClaimScope.VENUE` or `ClaimScope.EXPERIENCE`. |
| `priority` | `RequirementPriority` | `MANDATORY` or `OPTIONAL`. |
| `operator` | `ConditionOperator` | Machine-evaluable operator: `EQUALS`, `NOT_EQUALS`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN_OR_EQUAL`, `IS_PRESENT`. |
| `expected_value` | `Any` | Expected value (e.g. `True`, `False`, or threshold). |
| `description` | `str | None` | Optional user-facing label or note. |

### Machine Evaluation Semantics
- **Strict Type Matching**: When checking equality for booleans or numbers, types must strictly align. Free-text claims (e.g. `"Ramp with minor lip"`) are not coerced to `True` or `False`. Unmatched types yield `RequirementOutcome.UNSUPPORTED_CONDITION`.
- **No Keyword Guessing**: Ambiguous or unparsed text claims produce an explicit confirmation need rather than an assumed fit or conflict.

---

## 4. Per-Requirement Outcomes

Each requirement is evaluated to one of seven deterministic outcomes ([`RequirementOutcome`](../backend/app/possibility/models.py)):

1. **`SUPPORTED`**: Applicable, verified evidence satisfies the requested condition without conflict.
2. **`CONTRADICTED`**: Applicable evidence establishes an incompatibility (e.g. requirement expects step-free entrance, but evidence verifies 120 stairs).
3. **`MISSING_EVIDENCE`**: Attribute evidence is explicitly `UNKNOWN` or no evidence exists at the target scope.
4. **`CONFLICTING_EVIDENCE`**: Independent sources or active claims disagree on facts.
5. **`EXPIRED_EVIDENCE`**: Evidence claims have passed their `valid_until` date relative to `evaluation_time` (or exceeded policy age).
6. **`INSUFFICIENT_SCOPE`**: Evidence exists only at a different scope (e.g. venue-level entrance evidence requested for a specific tower tour).
7. **`UNSUPPORTED_CONDITION`**: Requirement condition cannot be evaluated deterministically against the claim value.

---

## 5. Scope and Evidence Applicability

A core design requirement is respecting the boundary between **venue** and **experience**:

- **Venue Scope (`ClaimScope.VENUE`)**:
  - Pertains to the physical facility (entrances, shared elevators, building parking).
  - A venue claim does not automatically satisfy an experience requirement.
- **Experience Scope (`ClaimScope.EXPERIENCE`)**:
  - Pertains to a specific event, tour, or gallery inside a venue.
  - **Conservative Applicability Rule**: An experience requirement checked against venue-only evidence produces `RequirementOutcome.INSUFFICIENT_SCOPE`. For example, a castle museum having a step-free front entrance does not mean an historic rooftop tower tour inside it is step-free.

---

## 6. Freshness and Expiry Handling

Built environments and policies change over time:
- Claims in `EvidenceClaim` support an optional timezone-aware `valid_until` timestamp.
- When `evaluation_time > claim.valid_until`, the claim is treated as expired.
- The engine supports an optional policy cutoff `max_evidence_age` (e.g., flagging claims older than a designated timeframe). By default, no universal freshness limit is arbitrarily invented unless specified.
- Expired claims produce `RequirementOutcome.EXPIRED_EVIDENCE` and require re-confirmation.

---

## 7. Exact Aggregate Decision Precedence

The aggregate outcome ([`PossibilityOutcome`](../backend/app/possibility/models.py)) is calculated following strict precedence rules:

```text
Assessments
   |
   +---> [Rule 5] Are mandatory requirements present?
   |              NO  --> NEEDS_CONFIRMATION (cannot verify suitability without requirements)
   |              YES
   |               |
   +---> [Rule 1] Does any mandatory requirement have outcome CONTRADICTED?
   |              YES --> REQUIREMENT_CONFLICT (conflict takes absolute precedence)
   |              NO
   |               |
   +---> [Rule 2] Does any mandatory requirement have outcome != SUPPORTED?
   |              (MISSING, CONFLICTING, EXPIRED, INSUFFICIENT_SCOPE, UNSUPPORTED_CONDITION)
   |              YES --> NEEDS_CONFIRMATION
   |              NO
   |               |
   +---> [Rule 3 & 4] All mandatory requirements are SUPPORTED
                      --> VERIFIED_FIT
                      (Any contradicted optional preferences are highlighted in summary,
                       but cannot independently disqualify the experience)
```

### Precedence Table

| Condition | Aggregate Outcome | Rationale |
|---|---|---|
| No mandatory requirements provided | `NEEDS_CONFIRMATION` | An unevidenced assessment cannot certify general accessibility. |
| At least one mandatory `CONTRADICTED` | `REQUIREMENT_CONFLICT` | Hard barrier identified; takes absolute precedence over unknown fields. |
| No conflict, but at least one mandatory requirement unverified | `NEEDS_CONFIRMATION` | Essential information is missing, ambiguous, stale, or conflicting. |
| All mandatory requirements `SUPPORTED` | `VERIFIED_FIT` | Verified evidence supports all stated mandatory needs. |

---

## 8. Meaning and Limitations of `VERIFIED_FIT`

- **Context-Specific Fit**: `VERIFIED_FIT` strictly means that the available evidence supports the **specific mandatory requirements supplied by the visitor**.
- **Not Universal Accessibility**: It does **not** declare that a venue is generally accessible to all people or compliant with legal building codes (ADA, UK Equality Act).
- **Schema Validation vs. Fact Verification**: Schema validation ensures structural consistency and provenance preservation. It does not replace on-site physical auditing.

---

## 9. Worked Synthetic Examples

### Example A: Verified Fit
- **Venue**: *Synthetic Heritage Hall* ([`create_synthetic_accessible_hall`](../backend/app/evidence/fixtures.py)).
- **Requirements**:
  - `req_1`: `STEP_FREE_ENTRANCE` (`MANDATORY`, `expected_value=True`)
  - `req_2`: `INTERNAL_ELEVATOR` (`MANDATORY`, `expected_value=True`)
- **Assessment**:
  - `req_1`: `SUPPORTED` (verified by official website).
  - `req_2`: `SUPPORTED` (verified by on-site audit report).
- **Aggregate**: `VERIFIED_FIT`.

### Example B: Requirement Conflict
- **Experience**: *Synthetic Castle Museum — Historic Tower Tour* ([`create_synthetic_venue_and_experience_with_scope_separation`](../backend/app/evidence/fixtures.py)).
- **Requirement**: `STEP_FREE_ENTRANCE` (`MANDATORY`, `scope=ClaimScope.EXPERIENCE`, `expected_value=True`).
- **Assessment**:
  - Experience evidence records 120 spiral stairs without elevator (`value=False`).
  - Outcome: `CONTRADICTED`.
- **Aggregate**: `REQUIREMENT_CONFLICT`.

### Example C: Mixed Conflict and Unknown
- **Requirements**:
  - `req_1`: `STEP_FREE_ENTRANCE` (`MANDATORY`, `scope=ClaimScope.EXPERIENCE`, `expected_value=True`) -> `CONTRADICTED`
  - `req_2`: `STEP_FREE_RESTROOM` (`MANDATORY`, `scope=ClaimScope.EXPERIENCE`, `expected_value=True`) -> `MISSING_EVIDENCE`
- **Aggregate**: `REQUIREMENT_CONFLICT` (conflict takes precedence over missing evidence).

---

## 10. Explicitly Deferred Functionality

The following capabilities are deferred to future milestones:
- Dynamic relaxation of mandatory constraints via agentic dialogue.
- Natural-language explanation generation via LLM (will be grounded in `PossibilityAssessment`).
- Automated re-auditing triggers or scheduled web scraper jobs.
- Complex geometric path calculation (door width vs. motorized wheelchair turning radiuses).
- PostgreSQL persistence and migration schemas.
