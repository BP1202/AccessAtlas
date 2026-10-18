# AccessAtlas — Ahmedabad Pilot Qloo Mapping & Schema Review (Stage A)

> **Status:** Stage A Review Deliverable (Pre-Integration).  
> **Investigation State:** `UNVERIFIED_MAPPING` (No live API calls executed; no IDs invented).  
> **Notice:** This document reviews the Qloo candidate investigation contract, provides proposed opt-in search queries for developer review, and evaluates schema compatibility for real-world Ahmedabad cultural evidence.

---

## 1. Qloo Identity Investigation Status

### 1.1 Strict Security & Invariant Adherence
- **No Private Credential Access:** In accordance with `AGENTS.md` and `SECURITY.md`, the agent has not inspected, read, printed, or staged `.env.local` or `QLOO_API_KEY`.
- **No Invented Identifiers:** No synthetic or guessed Qloo entity UUIDs or URNs have been introduced for the Ahmedabad pilot venues. All candidate mappings remain strictly **`UNVERIFIED_MAPPING`**.
- **Candidate Validity:** As established in AccessAtlas architecture, a cultural venue without a confirmed Qloo entity is still a completely valid pilot evidence candidate.

### 1.2 Proposed Candidate Mappings Table

| Pilot Candidate Venue | Locality | Proposed Search Query | Target Qloo Type | Investigation Status | Confirmed Qloo ID |
|---|---|---|---|---|---|
| **Calico Museum of Textiles** | Shahibaug, Ahmedabad | `"Calico Museum of Textiles"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Pending live query authorization* |
| **Kasturbhai Lalbhai Museum** | Shahibaug, Ahmedabad | `"Kasturbhai Lalbhai Museum"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Pending live query authorization* |
| **Conflictorium (Ahmedabad)** | Mirzapur, Ahmedabad | `"Conflictorium"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Pending live query authorization* |

---

## 2. Proposed Opt-In Live Investigation Command

To establish exact, verified Qloo entity correspondences without modifying runtime configuration, the developer may authorize running an explicit, server-side lookup using the existing backend client contract.

### 2.1 Proposed Offline Script Structure
A proposed verification script (e.g., `backend/scripts/inspect_ahmedabad_qloo.py`):
```python
"""Opt-in inspection script for Ahmedabad pilot cultural entities.

Requires developer-configured QLOO_API_KEY in local runtime environment.
"""

from app.qloo.client import QlooClient

CANDIDATE_QUERIES = [
    "Calico Museum of Textiles",
    "Kasturbhai Lalbhai Museum",
    "Conflictorium",
]

def inspect_candidates():
    with QlooClient() as client:
        for q in CANDIDATE_QUERIES:
            result = client.search_entities(query=q, types=["urn:entity:place"], take=5)
            print(f"Query: {q} -> Found {result.total_results} entity/entities")
            for ent in result.entities:
                print(f"  ID: {ent.entity_id} | Name: {ent.name} | Type: {ent.entity_type} | Disambig: {ent.disambiguation}")

if __name__ == "__main__":
    inspect_candidates()
```

### 2.2 Expected Review Criteria Before Adoption
When this opt-in check is authorized and executed:
1. **Name and Locality Check:** Confirm that returned entities explicitly match Ahmedabad, Gujarat (specifically disambiguating Conflictorium Ahmedabad from Conflictorium Raipur).
2. **Entity Type Verification:** Confirm that returned entities possess `entity_type="urn:entity:place"` (or documented destination equivalent).
3. **Audit Trail:** Record the exact returned `entity_id` and `popularity` score in `docs/pilot/AHMEDABAD_SOURCE_REGISTER.md` prior to any code commitment.

---

## 3. Evidence Schema & Possibility Engine Compatibility Analysis

This section analyzes how real-world evidence observed in Ahmedabad maps onto existing Pydantic domain models in [`backend/app/evidence/models.py`](../backend/app/evidence/models.py) and evaluation logic in [`backend/app/possibility/engine.py`](../backend/app/possibility/engine.py).

### 3.1 Directly Compatible Attributes

| Observed Real-World Fact | Target Model Field | Value Type | Possibility Engine Evaluation |
|---|---|---|---|
| Calico Museum lacks wheelchair access | `STEP_FREE_ENTRANCE` | `bool (False)` | Directly machine-evaluable with `ConditionOperator.EQUALS`. Evaluates deterministically to `RequirementOutcome.CONTRADICTED` for visitors requiring step-free access. |
| Calico Museum has multi-story stairs without lifts | `INTERNAL_ELEVATOR` | `bool (False)` | Evaluates to `CONTRADICTED` for elevator requirements. |
| Calico and Kasturbhai Lalbhai require advance booking | `RESERVATION_REQUIRED` | `bool (True)` | Directly evaluable with `ConditionOperator.EQUALS`. |
| Conflictorium has free walk-in entry | `RESERVATION_REQUIRED` | `bool (False)` | Directly evaluable. |
| Dedicated inquiry emails and phone numbers | `CONTACT_FOR_ACCESS_INFO`| `bool (True)` | Supported by verified sources. |

### 3.2 Real-World Complexities & Schema Nuances

#### A. Multi-Level Scope Separation (Haveli vs. Chauk vs. Udyana)
- **Observation:** At Calico Museum, a visitor does not simply visit "the museum"; they select between distinct morning, afternoon, or garden tours with different collections, pathways, and duration.
- **Model Compatibility:** The existing [`EvidenceRecord`](../backend/app/evidence/models.py) architecture cleanly accommodates this via `venue` (`prop_ven_in_ahm_calico`) linked to individual [`ExperienceIdentity`](../backend/app/evidence/models.py) entries (`prop_exp_in_ahm_calico_haveli`, `prop_exp_in_ahm_calico_chauk`).
- **Engine Rule:** The conservative applicability rule in `PossibilityEngine` ensures that a venue-level claim does not inadvertently overrule experience-level stair barriers.

#### B. Sensory & Lighting Restrictions for Textile Conservation
- **Observation:** Calico enforces intentional low-lux illumination. Visitors with night blindness, retinitis pigmentosa, or specific visual impairments require advance notice of dim lighting.
- **Current Model:** `EvidenceAttribute.SENSORY_ADAPTED_SESSION` or `SENSORY_ENVIRONMENT`.
- **Nuance:** When a visitor expresses a requirement such as "adequate bright lighting", a free-text claim value like `"Low-Lux Conservation Lighting"` produces `RequirementOutcome.UNSUPPORTED_CONDITION` in the existing Possibility Engine because strings cannot be safely coerced to booleans.
- **Stage B Recommendation:** Do not alter the engine's deterministic comparison rules. Instead, maintain qualitative sensory details in `EvidenceClaim.details`, and allow the planning layer to surface this as an explicit confirmation note for visitors with visual accommodations.

#### C. Advance Lead-Time & Hard Capacity Quotas
- **Observation:** Calico's registration window opens strictly 90 days in advance and fills rapidly due to the 20-person cap. Kasturbhai Lalbhai caps groups at 12 persons.
- **Current Model:** `RESERVATION_REQUIRED` captures the binary requirement (`True`).
- **Nuance:** The model currently lacks a numeric field for booking lead-time (e.g. `advance_notice_days = 90`) or capacity ceiling (`group_size_cap = 20`).
- **Recommendation:** Preserve these details faithfully within `EvidenceClaim.details` (e.g. `"Online registration opens 90 days in advance; strictly capped at 20 visitors per tour"`). This maintains 100% schema backward compatibility without requiring immediate migrations.

#### D. Age Restrictions (Children Under 10 Prohibited)
- **Observation:** Calico strictly prohibits children below age 10, and requires adult accompaniment for ages 10–15.
- **Current Model:** `EvidenceAttribute.COMPANION_ENTRY_POLICY` captures carer and companion policies, but child minimum age is an admissions constraint.
- **Recommendation:** Record this under `COMPANION_ENTRY_POLICY` or as a qualification detail attached to `OPENING_AND_SESSIONS`.

---

## 4. Synthesis & Recommendations for Stage B

1. **Retain Stage A Boundaries:** Keep all Ahmedabad pilot findings in documentation (`docs/pilot/`) until explicit review by the maintainer.
2. **Execute Opt-in Qloo Query:** When authorized, run the proposed search script to verify entity IDs for Ahmedabad cultural venues.
3. **Coordinate Direct Primary Inquiries:** Send standardized email inquiries to `calicomuseum@gmail.com`, `klmuseum16@gmail.com`, and `dialogue@conflictorium.org` to resolve explicit unknowns (accessible restrooms, assistance animals, seating).
4. **Stage B Fixture Import:** Only after developer approval, construct `backend/app/evidence/fixtures_ahmedabad.py` and register candidates in `backend/app/agent/resolution.py`.
