# AccessAtlas — Discovery API Contract (`POST /api/v1/discover`)

This document defines the HTTP API specification, request/response schemas, error handling conventions, source provenance semantics, and local usage for the AccessAtlas Discovery API ([`backend/app/api/v1`](../backend/app/api/v1)).

---

## 1. Overview & Architectural Boundaries

The Discovery API exposes the AccessAtlas cultural discovery and participation planning pipeline through a single, deterministic endpoint:

- **Endpoint**: `POST /api/v1/discover`
- **Component**: FastAPI router ([`backend/app/api/v1/discover.py`](../backend/app/api/v1/discover.py))
- **Execution Pattern**: Synchronous FastAPI handler executed on worker threads via AnyIO, coordinating with [`AccessAtlasAgent`](../backend/app/agent/graph.py).
- **Process Health**: `GET /health` is preserved independently to check application process availability without triggering upstream calls.

### Core Pipeline Execution

1. **User Expressed Input**: Receives user-expressed cultural interests and explicit participation requirements. Personal medical conditions, disabilities, and protected characteristics are **never** inferred.
2. **Qloo Cultural Discovery**: Queries Qloo Cultural AI (`GET /search`) for cultural candidates matching the user query.
3. **Explicit Candidate Resolution**: Resolves candidates 1-to-1 against approved venue mappings for the pilot city. Unmapped entities remain explicitly unresolved.
4. **Independent Venue Evidence**: Retrieves factual, source-backed evidence records from the pilot repository.
5. **Deterministic Possibility Engine**: Evaluates mandatory and optional participation requirements against evidence, preserving 3-state aggregate outcomes (`VERIFIED_FIT`, `NEEDS_CONFIRMATION`, `REQUIREMENT_CONFLICT`).
6. **Structured Participation Planning**: Generates explainable participation plans with grounded findings, evidence gaps, confirmation questions, operational venue advisories, and source provenance.

---

## 2. Pilot City Limitation

> **Ahmedabad Pilot Notice**: In the current release, the API exclusively supports `city: "Ahmedabad"` (Gujarat, India).

Any request specifying an unsupported city (e.g. `"Mumbai"`, `"Delhi"`, `"London"`) is rejected with `HTTP 400 Bad Request`.

Approved pilot venue mappings currently include:
1. **Calico Museum of Textiles** (Qloo entity ID: `783C0235-681D-4235-BA4D-A57992F7C97A`, venue ID: `ven_in_ahm_calico`)
2. **Kasturbhai Lalbhai Museum** (Qloo entity ID: `36537424-5653-418C-A39E-33C17214D423`, venue ID: `ven_in_ahm_kasturbhai`)
3. **Conflictorium — Museum of Conflict** (Qloo entity ID: `8090F76A-F5EE-4931-8942-12B1FF3C4996`, venue ID: `ven_in_ahm_conflictorium`)

---

## 3. Request Contract

### JSON Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DiscoverRequest",
  "type": "object",
  "additionalProperties": false,
  "required": ["cultural_interests"],
  "properties": {
    "city": {
      "type": "string",
      "default": "Ahmedabad",
      "description": "Pilot city name. In the current release, only 'Ahmedabad' is supported."
    },
    "cultural_interests": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      },
      "description": "One to five user-expressed cultural interests or search topics."
    },
    "requirements": {
      "type": "array",
      "maxItems": 20,
      "default": [],
      "items": {
        "$ref": "#/$defs/ParticipationRequirement"
      },
      "description": "Explicit user participation requirements to evaluate deterministically."
    },
    "max_candidates": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20,
      "default": 5,
      "description": "Maximum number of cultural candidates to evaluate (1 to 20)."
    },
    "evaluation_time": {
      "type": ["string", "null"],
      "format": "date-time",
      "default": null,
      "description": "Optional timezone-aware ISO 8601 timestamp for reproducible evaluation."
    }
  },
  "$defs": {
    "ParticipationRequirement": {
      "type": "object",
      "required": ["requirement_id", "attribute"],
      "properties": {
        "requirement_id": {
          "type": "string",
          "minLength": 1,
          "description": "Unique identifier for this requirement (e.g. 'req_reservation')"
        },
        "attribute": {
          "type": "string",
          "enum": [
            "step_free_entrance",
            "internal_elevator",
            "seating_available",
            "rest_areas",
            "quiet_space",
            "audio_description",
            "assistive_listening",
            "sensory_adapted_session",
            "service_animal_policy",
            "companion_entry_policy",
            "reservation_required",
            "step_free_restroom",
            "accessible_parking",
            "contact_for_access_info",
            "wheelchair_access"
          ],
          "description": "Target practical attribute from the evidence vocabulary."
        },
        "scope": {
          "type": "string",
          "enum": ["venue", "experience"],
          "default": "venue",
          "description": "Applicable scope for verification."
        },
        "priority": {
          "type": "string",
          "enum": ["mandatory", "optional"],
          "default": "mandatory",
          "description": "Whether the requirement is mandatory or an optional preference."
        },
        "operator": {
          "type": "string",
          "enum": [
            "equals",
            "not_equals",
            "greater_than_or_equal",
            "less_than_or_equal",
            "is_present"
          ],
          "default": "equals",
          "description": "Condition operator for evaluation."
        },
        "expected_value": {
          "description": "Expected value (boolean, string, or number) for satisfaction.",
          "default": true
        },
        "description": {
          "type": ["string", "null"],
          "default": null,
          "description": "Optional human-readable description."
        }
      }
    }
  }
}
```

### Strict Input Invariants

- **`extra="forbid"`**: Unknown properties are strictly rejected with `HTTP 422 Unprocessable Entity`. Callers cannot submit provider credentials, arbitrary evidence records, source claims, or Qloo entity mappings.
- **No Inferred Invariants**: Cultural interests are treated purely as search topics. They do not trigger sensitive personal attribute assumptions.

---

## 4. Response Contract

### Response Structure

The endpoint returns `HTTP 200 OK` with a [`DiscoverResponse`](../backend/app/api/v1/schemas.py) payload:

```json
{
  "city": "Ahmedabad",
  "cultural_interests": ["textiles", "historic museum"],
  "total_candidates_found": 1,
  "candidates_evaluated": 1,
  "plans": [
    {
      "candidate": {
        "entity_id": "783C0235-681D-4235-BA4D-A57992F7C97A",
        "name": "Calico Museum of Textiles",
        "entity_type": "urn:entity:place",
        "subtype": "museum",
        "popularity": 0.85,
        "disambiguation": "Textile museum in Ahmedabad, Gujarat",
        "tags": [
          {
            "id": "urn:tag:concept:textiles",
            "name": "Indian Textiles",
            "tag_type": "concept"
          }
        ],
        "properties": {}
      },
      "resolution_status": "resolved",
      "venue_id": "ven_in_ahm_calico",
      "experience_id": null,
      "possibility_assessment": {
        "venue_id": "ven_in_ahm_calico",
        "experience_id": null,
        "aggregate_outcome": "VERIFIED_FIT",
        "evaluation_time": "2026-10-19T12:00:00Z",
        "assessments": [
          {
            "requirement_id": "req_res",
            "attribute": "reservation_required",
            "priority": "mandatory",
            "scope": "venue",
            "outcome": "supported",
            "explanation": "Requirement satisfied: attribute 'reservation_required' is True (matched expected True via EQUALS).",
            "evidence_references": [
              {
                "attribute": "reservation_required",
                "scope": "venue",
                "value": true,
                "details": "Mandatory advance online registration opens 90 days in advance of the tour date...",
                "source": {
                  "source_type": "official_venue_website",
                  "url": "https://www.calicomuseum.org/tour-guidelines/",
                  "title": "Sarabhai Foundation — Calico Museum Tour Guidelines",
                  "verified_at": "2026-10-18T10:55:00Z"
                },
                "valid_from": null,
                "valid_until": null
              }
            ],
            "confirmation_need": null
          }
        ],
        "summary": "Verified fit: 1 mandatory requirement(s) supported by independently sourced evidence."
      },
      "supported_findings": [
        "Verified fit: attribute 'reservation_required' is confirmed True."
      ],
      "unresolved_gaps": [],
      "confirmation_questions": [],
      "suggested_next_actions": [
        "Plan your visit: all 1 evaluated mandatory requirement(s) are verified by independently sourced evidence.",
        "Check official venue booking channels for upcoming registration dates and guidelines.",
        "Venue advisory (operational policy): Official statement: 'The Foundation is currently unable to offer wheelchair access to visitors.' Historic multi-level domestic havelis with varying floor surfaces, narrow passages, and low lintels."
      ],
      "provenance_sources": [
        {
          "source_type": "official_venue_website",
          "url": "https://www.calicomuseum.org/tour-guidelines/",
          "title": "Sarabhai Foundation — Calico Museum Tour Guidelines",
          "verified_at": "2026-10-18T10:55:00Z"
        }
      ],
      "cultural_thread": {
        "thread_id": "thread_calico_museum_of_textiles_textiles",
        "starting_interest": "textiles",
        "anchor": {
          "interest": "textiles",
          "source_type": "explicit_visitor_selection",
          "resolved_entity_id": null,
          "resolved_entity_name": null,
          "matched_tag": "Indian Textiles"
        },
        "candidate": {
          "entity_id": "783C0235-681D-4235-BA4D-A57992F7C97A",
          "name": "Calico Museum of Textiles",
          "entity_type": "urn:entity:place",
          "subtype": "museum",
          "popularity": 0.85,
          "mapping_status": "resolved",
          "has_reviewed_evidence": true,
          "is_evaluation_eligible": true,
          "venue_id": "ven_in_ahm_calico"
        },
        "connection": {
          "connection_type": "shared_tag",
          "source_type": "deterministic_application_mapping",
          "shared_descriptors": ["Indian Textiles"],
          "rationale": "Matched expressed interest 'textiles' via Qloo cultural tag 'Indian Textiles'."
        },
        "provenance": "qloo_search_discovery"
      }
    }
  ],
  "cultural_threads": [
    {
      "thread_id": "thread_calico_museum_of_textiles_textiles",
      "starting_interest": "textiles",
      "anchor": {
        "interest": "textiles",
        "source_type": "explicit_visitor_selection",
        "resolved_entity_id": null,
        "resolved_entity_name": null,
        "matched_tag": "Indian Textiles"
      },
      "candidate": {
        "entity_id": "783C0235-681D-4235-BA4D-A57992F7C97A",
        "name": "Calico Museum of Textiles",
        "entity_type": "urn:entity:place",
        "subtype": "museum",
        "popularity": 0.85,
        "mapping_status": "resolved",
        "has_reviewed_evidence": true,
        "is_evaluation_eligible": true,
        "venue_id": "ven_in_ahm_calico"
      },
      "connection": {
        "connection_type": "shared_tag",
        "source_type": "deterministic_application_mapping",
        "shared_descriptors": ["Indian Textiles"],
        "rationale": "Matched expressed interest 'textiles' via Qloo cultural tag 'Indian Textiles'."
      },
      "provenance": "qloo_search_discovery"
    }
  ],
  "discovery_error": null,
  "workflow_summary": "Evaluated 1 cultural candidate(s): 1 mapped to venue evidence, 0 unmapped."
}
```

> **Note on Example Data**: The sample response above is an illustrative demonstration fixture produced against reviewed pilot evidence. It does not represent an unverified live Qloo response.

### Cultural Threads Specifications & Source Classification

The `cultural_threads` list establishes provenance-aware connections linking visitor-expressed cultural interests to discovered candidates:

1. **Source Classifications (`ThreadSourceType`)**:
   - `explicit_visitor_selection`: Directly provided by visitor input (e.g., `"textiles"`).
   - `actual_qloo_response`: Genuinely returned by Qloo Cultural AI (e.g., place entity discovery, tags, popularity).
   - `deterministic_application_mapping`: Computed deterministically by AccessAtlas logic (e.g. tag overlap or human-reviewed venue mapping). Application logic is **never** presented as Qloo-generated insights.
2. **Candidate Status & Evidence Boundaries**:
   - `mapping_status`: `"resolved"` (mapped to reviewed pilot venue), `"unmapped"` (discovered culturally, no reviewed venue mapping), or `"missing_evidence"` (mapped venue ID missing from repository).
   - `has_reviewed_evidence`: Strictly `true` only if verified facts exist in `VenueEvidenceRepository`.
   - `is_evaluation_eligible`: Strictly `true` only if both mapped and backed by reviewed evidence. Unmapped candidates have `has_reviewed_evidence: false` and `is_evaluation_eligible: false`.
3. **Safe Frontend Display Guidelines**:
   - **Allowed**: Displaying connection rationales (e.g. *"Matched expressed interest 'textiles' via Qloo tag 'Indian Textiles'"*).
   - **Allowed**: Highlighting whether a place has reviewed visit information or is an unreviewed cultural discovery.
   - **Prohibited**: Fabricating percentage confidence scores (e.g. *"94% match"*), relationship-strength meters, or claiming cultural affinity represents accessibility.

### Response Guarantees

1. **Deterministic Possibility Outcomes**:
   - `VERIFIED_FIT`: All mandatory requirements are confirmed by independent evidence.
   - `NEEDS_CONFIRMATION`: One or more mandatory requirements have missing or ambiguous evidence.
   - `REQUIREMENT_CONFLICT`: At least one mandatory requirement is contradicted by verified evidence.
2. **Unmapped Candidates**: Unmapped Qloo entities or entities with missing evidence records **never** receive `VERIFIED_FIT` and have `possibility_assessment: null`.
3. **Operational Advisories vs. Architectural Thresholds**: Calico's published wheelchair operational limitation is preserved strictly as an operational policy advisory (`suggested_next_actions`), completely distinct from architectural entrance facts (`step_free_entrance`).
4. **No External Side Effects**: The system never claims to make reservations, buy tickets, or contact venues on the user's behalf. Published opening rules remain distinct from live ticket inventory.

---

## 5. Error Handling Conventions

The API returns sanitized, standard HTTP error responses adhering to `{"detail": "..."}` formatting.

| Condition | HTTP Status | Detail Message | Explanation |
|---|---|---|---|
| Malformed payload or validation error | `422 Unprocessable Entity` | Pydantic validation structure | Missing required fields, invalid enum attributes, or out-of-range bounds. |
| Unsupported pilot city | `400 Bad Request` | `Unsupported pilot city '<city>'. Only 'Ahmedabad' is supported in the current pilot release.` | City is not Ahmedabad. |
| Missing Qloo configuration | `503 Service Unavailable` | `Cultural discovery service is not configured.` | Server does not have `QLOO_API_KEY` configured. |
| Upstream authentication failure | `502 Bad Gateway` | `Upstream cultural discovery authentication failed.` | Qloo returned `HTTP 401 Unauthorized`. |
| Upstream rate limiting | `429 Too Many Requests` | `Upstream cultural discovery rate limit exceeded. Please try again later.` | Qloo rate limit or quota exceeded (`HTTP 429`). |
| Upstream request timeout | `504 Gateway Timeout` | `Upstream cultural discovery request timed out. Please retry.` | Outbound request to Qloo timed out. |
| Upstream provider error | `502 Bad Gateway` | `Upstream cultural discovery provider error.` | Qloo returned an unhandled `5xx` or `4xx` error. |

**Sanitization Invariant**: Upstream response dumps, internal tracebacks, and secret keys (e.g. `QLOO_API_KEY`) are **never** returned in HTTP response bodies or error messages.

---

## 6. Dependency Injection & Lifecycle Architecture

FastAPI dependency injection in [`app.api.deps`](../backend/app/api/deps.py) manages resource lifecycles:

- **`get_qloo_client`**: Instantiates a per-request `QlooClient` using Python's generator dependency pattern (`yield client`). FastAPI executes `client.close()` in the `finally` block upon response completion, ensuring underlying HTTPX connection pools are released without leaking sockets or creating global mutable state.
- **`get_candidate_resolver`**: Provides the reviewed Ahmedabad candidate resolver ([`create_ahmedabad_candidate_resolver`](../backend/app/evidence/pilot_ahmedabad.py)).
- **`get_evidence_repository`**: Provides the reviewed Ahmedabad evidence repository ([`create_ahmedabad_pilot_repository`](../backend/app/evidence/pilot_ahmedabad.py)).
- **`get_possibility_engine`**: Supplies the deterministic evaluation engine.
- **`get_agent`**: Supplies the compiled LangGraph workflow agent.

All dependencies can be cleanly overridden in automated tests using `app.dependency_overrides`.

---

## 7. Local Development & Testing Instructions

### Run Development Server

From `C:\Pro\AccessAtlas\backend`:

```powershell
uvicorn app.main:app --reload --port 8000
```

### Submit a Safe Test Request (PowerShell)

```powershell
$body = @{
    city = "Ahmedabad"
    cultural_interests = @("textiles", "historic museum")
    requirements = @(
        @{
            requirement_id = "req_res"
            attribute = "reservation_required"
            scope = "venue"
            priority = "mandatory"
            operator = "equals"
            expected_value = $true
        }
    )
    max_candidates = 3
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/discover" -Method Post -ContentType "application/json" -Body $body
```

### Execute Automated Offline Tests

The API test suite runs completely offline using `httpx.MockTransport`:

```powershell
pytest tests/test_api_discover.py -v
```

For browser-to-backend contract and integration testing instructions, see [`docs/CONTRACT_TESTING.md`](CONTRACT_TESTING.md).

