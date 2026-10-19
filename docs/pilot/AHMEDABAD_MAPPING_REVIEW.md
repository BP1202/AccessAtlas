# AccessAtlas — Ahmedabad Pilot Qloo Mapping & Schema Review (Stage A)

> **Status:** Stage A Review Deliverable (Review Corrections).  
> **Investigation State:** `UNVERIFIED_MAPPING` (No live queries run autonomously; no IDs invented).  
> **Notice:** This document reviews the Qloo candidate investigation contract, documents the developer-executable opt-in lookup script, and provides a thorough compatibility analysis comparing real-world Ahmedabad cultural evidence against the actual production `EvidenceAttribute` enum.

---

## 1. Qloo Identity Investigation Status

### 1.1 Strict Security & Invariant Adherence
- **No Private Credential Access:** In accordance with `AGENTS.md` and `SECURITY.md`, the agent has not inspected, read, printed, or staged `.env`, `.env.local`, or `QLOO_API_KEY`.
- **No Invented Identifiers:** No synthetic or guessed Qloo entity UUIDs or URNs have been introduced for the Ahmedabad pilot venues. All candidate mappings remain strictly **`UNVERIFIED_MAPPING`**.
- **Candidate Validity:** As established in AccessAtlas architecture, a cultural venue without a confirmed Qloo entity is still a valid pilot evidence candidate.

### 1.2 Proposed Candidate Queries Table

| Pilot Candidate Venue | Locality | Authorized Search Query | Target Qloo Type | Investigation Status | Confirmed Qloo ID |
|---|---|---|---|---|---|
| **Calico Museum of Textiles** | Shahibaug, Ahmedabad | `"Calico Museum of Textiles"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Awaiting manual developer execution* |
| **Kasturbhai Lalbhai Museum** | Shahibaug, Ahmedabad | `"Kasturbhai Lalbhai Museum"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Awaiting manual developer execution* |
| **Conflictorium (Ahmedabad)** | Mirzapur, Ahmedabad | `"Conflictorium, Ahmedabad"`, `"Conflictorium"` | `urn:entity:place` | `UNVERIFIED_MAPPING` | *Awaiting manual developer execution* |

---

## 2. Developer-Executable Opt-In Live Investigation Script

A safe, manually executable inspection script has been implemented at:
[`backend/app/qloo/ahmedabad_lookup.py`](../../backend/app/qloo/ahmedabad_lookup.py)

### 2.1 Developer Execution Instruction
To run the live candidate lookup using developer-configured credentials in `.env.local`:

```powershell
# In Windows PowerShell from the backend directory:
cd C:\Pro\AccessAtlas\backend
python -m app.qloo.ahmedabad_lookup
```

### 2.2 Security & Operational Guarantees
- **Configuration Loading:** Uses `app.core.config.get_settings()`, reading `QLOO_API_KEY` and `QLOO_BASE_URL` securely from the runtime environment or `.env.local`.
- **Zero Credential Exposure:** Prints only `"Credential status: configured"`. Never prints, slices, or logs the API key.
- **Normalized Data Only:** Avoids dumping raw provider JSON responses or request headers. Outputs only normalized fields supported by the production [`QlooEntity`](../../backend/app/qloo/models.py) model (`entity_id`, `name`, `entity_type`, `subtype`, `popularity`, `disambiguation`, `tags`).
- **No Invented Fields:** Does not pretend geographic fields (e.g. city, street) exist on `QlooEntity`.
- **Clear Outcome Differentiation:** Clearly separates zero results, provider errors (HTTP 401, 429, 5xx), and successful responses.
- **No Automatic Mappings:** Explicitly disclaims automatic entity binding. All correspondences require manual developer inspection.
- **Offline Test Coverage:** Accompanied by automated offline unit tests in [`backend/tests/test_ahmedabad_lookup.py`](../../backend/tests/test_ahmedabad_lookup.py) verifying error handling, mock search normalization, and secret leak prevention.

---

## 3. Evidence Schema & Vocabulary Compatibility Analysis

This section analyzes the relationship between real-world observations in Ahmedabad and the actual `EvidenceAttribute` enum in [`backend/app/evidence/models.py`](../../backend/app/evidence/models.py):

```python
class EvidenceAttribute(StrEnum):
    STEP_FREE_ENTRANCE = "step_free_entrance"
    INTERNAL_ELEVATOR = "internal_elevator"
    SEATING_AVAILABLE = "seating_available"
    REST_AREAS = "rest_areas"
    QUIET_SPACE = "quiet_space"
    AUDIO_DESCRIPTION = "audio_description"
    ASSISTIVE_LISTENING = "assistive_listening"
    SENSORY_ADAPTED_SESSION = "sensory_adapted_session"
    SERVICE_ANIMAL_POLICY = "service_animal_policy"
    COMPANION_ENTRY_POLICY = "companion_entry_policy"
    RESERVATION_REQUIRED = "reservation_required"
    STEP_FREE_RESTROOM = "step_free_restroom"
    ACCESSIBLE_PARKING = "accessible_parking"
    CONTACT_FOR_ACCESS_INFO = "contact_for_access_info"
```

### 3.1 Attribute-by-Attribute Vocabulary Comparison & Gaps

| Real-World Phenomenon | Nearest Schema Enum | Gap or Incompatibility | Recommended Stage A / Stage B Handling |
|---|---|---|---|
| **Calico: Wheelchair Access Limitation** (*"The Foundation is currently unable to offer wheelchair access to visitors."*) | `STEP_FREE_ENTRANCE` or `INTERNAL_ELEVATOR` | **Vocabulary Gap:** The schema lacks a broad `WHEELCHAIR_ACCESSIBLE` attribute. The published text is an operational policy regarding wheelchair accommodation across the tour, not a physical entrance threshold spec. | Do **not** force into `STEP_FREE_ENTRANCE = False`. Keep physical threshold as `UNKNOWN`; preserve published wheelchair limitation in claim `details`. Consider proposing a dedicated enum extension in Stage B. |
| **Calico: Internal Multi-Level Circulation** | `INTERNAL_ELEVATOR` | **Verification Gap:** Galleries span multiple haveli floors with stairs, but elevator absence is not explicitly published. | Keep `INTERNAL_ELEVATOR` as `UNKNOWN` rather than asserting negative facts without published substantiation. |
| **Calico: Textile Conservation Lighting** (*Low-lux illumination to protect organic dyes; eye adaptation required*) | `SENSORY_ADAPTED_SESSION` | **Semantic Incompatibility:** `SENSORY_ADAPTED_SESSION` represents sensory-friendly programming for neurodivergent visitors. Calico's dim light is a permanent conservation constraint, not an adapted session. | Mark `SENSORY_ADAPTED_SESSION` as `UNKNOWN`. Record low-lux conservation lighting in claim `details` to allow the planning agent to surface confirmation warnings for visually impaired visitors. |
| **Calico: Child Supervision Rules** (*Under 10 prohibited; 10–15 accompanied by parent*) | `COMPANION_ENTRY_POLICY` | **Semantic Incompatibility:** `COMPANION_ENTRY_POLICY` models carer/support person admission terms for disabled visitors. Child minimum age is an admission constraint. | Mark `COMPANION_ENTRY_POLICY` as `UNKNOWN`. Capture child rules under operational admission qualifications. |
| **All Venues: General Contact Information** (Telephone, Email) | `CONTACT_FOR_ACCESS_INFO` | **Semantic Incompatibility:** `CONTACT_FOR_ACCESS_INFO` implies a dedicated accessibility desk or accessibility officer. General box office / inquiry contacts do not substantiate this. | Mark `CONTACT_FOR_ACCESS_INFO` as `UNKNOWN` for all three candidates until a dedicated accessibility coordinator is substantiated. Record general emails/phones in venue metadata. |
| **Calico: 90-Day Advance Booking Window & 20-Person Cap** | `RESERVATION_REQUIRED` | **Data Shape Gap:** `RESERVATION_REQUIRED` is a boolean. The schema lacks numeric fields for `booking_window_days` or `capacity_limit`. | Record `RESERVATION_REQUIRED = True` (directly evaluable). Preserve 90-day booking window and 20-person cap in `EvidenceClaim.details`. |
| **Conflictorium: Ordinary Walk-In vs. Special Events** | `RESERVATION_REQUIRED` | **Scope / Context Gap:** Ordinary museum admission is free walk-in (`False`), while special workshops may require RSVP. | Record `RESERVATION_REQUIRED = False` for the general venue scope, qualifying special event sign-ups in `details`. |
| **Kasturbhai Lalbhai: Compulsory Guided Tours** | `RESERVATION_REQUIRED` | Directly compatible (`True`), with 4 daily slots and ~12 person cap recorded in `details`. | Evaluates cleanly in Possibility Engine with `ConditionOperator.EQUALS`. |

---

## 4. Synthesis & Recommendations for Stage B

1. **Maintain Stage A Documentation Boundary:** No proposed claims have been imported into `backend/app/evidence/fixtures.py`.
2. **Execute Developer-Authorized Qloo Lookup:** The developer can run `python -m app.qloo.ahmedabad_lookup` from the backend directory to inspect candidate Qloo entities.
3. **Coordinate Direct Venue Communications:** Primary telephone and email inquiries are needed to resolve explicit unknowns (accessible restrooms, ramp availability, seating, assistance animal policies, dedicated accessibility coordination).
4. **Follow-Up Schema Recommendations for Stage B:**
   - Propose an explicit `WHEELCHAIR_ACCESSIBLE` or `MOBILITY_DEVICE_POLICY` attribute to avoid conflating operational wheelchair policies with entrance threshold geometry.
   - Propose structured fields or standard detail conventions for booking windows and group capacity limits.
