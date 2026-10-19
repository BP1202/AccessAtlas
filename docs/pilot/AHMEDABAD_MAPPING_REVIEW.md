# AccessAtlas — Ahmedabad Pilot Qloo Mapping & Schema Review (Stage B)

> **Status:** Stage B Confirmed Mappings & Implementation Review.  
> **Investigation State:** `MAPPINGS_CONFIRMED` (Developer-run lookup verified; 3 approved IDs mapped, 2 non-approved IDs excluded).  
> **Implementation Module:** [`backend/app/evidence/pilot_ahmedabad.py`](../../backend/app/evidence/pilot_ahmedabad.py).  
> **Notice:** This document records the approved Qloo candidate mappings, exclusion justifications, schema extension rationale, and developer verification procedures.

---

## 1. Confirmed Qloo Identity Mappings

The candidate mappings have been verified against developer-executed live Qloo Search results:

| Candidate Venue | Locality | Approved Qloo Entity ID | Target Entity Type | Review Basis | Status |
|---|---|---|---|---|---|
| **Calico Museum of Textiles** | Shahibaug, Ahmedabad | `783C0235-681D-4235-BA4D-A57992F7C97A` | `urn:entity:place` | Exact correspondence to Sarabhai Foundation estate in Shahibaug. | `RESOLVED_AND_MAPPED` |
| **Kasturbhai Lalbhai Museum** | Shahibaug, Ahmedabad | `36537424-5653-418C-A39E-33C17214D423` | `urn:entity:place` | Exact correspondence to Lalbaug estate, Shahibaug. | `RESOLVED_AND_MAPPED` |
| **Conflictorium (Ahmedabad)** | Mirzapur, Ahmedabad | `8090F76A-F5EE-4931-8942-12B1FF3C4996` | `urn:entity:place` | Confirmed correspondence to Gool Lodge, Mirzapur, Ahmedabad. | `RESOLVED_AND_MAPPED` |

### Explicitly Excluded Qloo IDs
- `7A72825D-1C1F-4433-9113-AE6DADA44862`: Conflictorium Raipur, Chhattisgarh branch (opened 2022). Out of scope for Ahmedabad.
- `D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D`: Geographically inconsistent duplicate entity; excluded to prevent non-deterministic candidate resolution.

---

## 2. Implementation Architecture & Factory Wiring

### 2.1 Factory Functions
Implemented in [`backend/app/evidence/pilot_ahmedabad.py`](../../backend/app/evidence/pilot_ahmedabad.py):
- `create_ahmedabad_pilot_records() -> list[EvidenceRecord]`: Returns 6 real-world evidence records (3 venues + 3 guided tour experiences).
- `create_ahmedabad_pilot_repository() -> InMemoryVenueEvidenceRepository`: Populates an in-memory repository with reviewed Ahmedabad evidence.
- `create_ahmedabad_pilot_mappings() -> list[CandidateMapping]`: Returns reviewed 1-to-1 candidate mappings.
- `create_ahmedabad_candidate_resolver() -> InMemoryCandidateResolver`: Configures the resolver with approved IDs only.
- `create_ahmedabad_agent(qloo_client, engine=None) -> AccessAtlasAgent`: Convenience factory instantiating the generic LangGraph workflow with Ahmedabad pilot data via dependency injection.

### 2.2 Preserving Generic Graph Invariant
The generic LangGraph workflow ([`backend/app/agent/graph.py`](../../backend/app/agent/graph.py)) remains completely city-agnostic and unmodified. The Ahmedabad pilot data is passed entirely through dependency-injected parameters (`resolver`, `evidence_repo`).

---

## 3. Schema Extension & Machine Evaluability Analysis

### 3.1 Schema Extension: `EvidenceAttribute.WHEELCHAIR_ACCESS`
- **Addition:** `WHEELCHAIR_ACCESS = "wheelchair_access"` added to [`backend/app/evidence/models.py`](../../backend/app/evidence/models.py).
- **Rationale:** Calico's published operational policy explicitly states: *"The Foundation is currently unable to offer wheelchair access to visitors."*
- **Integrity Rule:** Converting this statement into `STEP_FREE_ENTRANCE=False` or `INTERNAL_ELEVATOR=False` would falsify physical architectural facts.
- **Workflow Integration:** [`backend/app/agent/planning.py`](../../backend/app/agent/planning.py) checks if a candidate's evidence record contains an operational wheelchair access limitation (`WHEELCHAIR_ACCESS=False`) and surfaces it in `suggested_next_actions` even when visitors specify generic or entrance-only requirements.

### 3.2 Deferred Claims Summary

| Claim | Venue | Reason for Deferral from Machine Evaluation | Handling Strategy |
|---|---|---|---|
| **Low-Lux Illumination** | Calico | Conservation requirement for ancient dyes, not a `SENSORY_ADAPTED_SESSION`. | Preserved in `details`; surfaced as confirmation note for visually impaired visitors. |
| **90-Day Booking Window** | Calico | Boolean `RESERVATION_REQUIRED` captures binary need; schema lacks integer lead-time days. | Preserved in `EvidenceClaim.details`. |
| **Child Supervision Rules** | Calico | Under-10 prohibition is an admission rule, not a disability companion policy (`COMPANION_ENTRY_POLICY`). | Retained in admission notes; `COMPANION_ENTRY_POLICY` remains `UNKNOWN`. |
| **Special Event Signups** | Conflictorium | Ordinary walk-in is free (`False`); workshops/events in "The Third Space" require separate RSVP. | Captured in `EvidenceClaim.details` of `RESERVATION_REQUIRED`. |

---

## 4. Offline Integration Testing & Verification

Execute all 15 automated verification tests from the `backend/` directory:

```powershell
cd C:\Pro\AccessAtlas\backend
python -m pytest tests/test_pilot_ahmedabad.py -v
```

All 15 tests run offline using `httpx.MockTransport` and in-memory repositories with zero live external network calls.
