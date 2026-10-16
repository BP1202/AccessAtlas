# AccessAtlas — Independently Sourced Venue Evidence Foundation

This document defines the data models, source hierarchy, provenance standards, and operational guidelines for practical venue and experience evidence in AccessAtlas.

---

## 1. Core Principles

1. **Independence from Cultural Discovery (Qloo)**:
   - Qloo is our engine for aggregate cultural affinity and taste intelligence.
   - Qloo data **never** constitutes evidence of venue accessibility, operating hours, ticket availability, or personal suitability.
   - We never infer disability, health conditions, or personal requirements from cultural interests.
2. **Explicit Fact Semantics**:
   - Facts must be grounded in independently verified sources.
   - Missing or ambiguous information remains strictly **unknown**. We never invent sources or fabricate verification timestamps.
   - Discrepancies between independent sources are preserved as **conflicting**, rather than silently choosing a winner or averaging out claims.
3. **No Numerical Accessibility Scoring**:
   - AccessAtlas does not calculate arbitrary accessibility percentages or scores (e.g. "85% accessible").
   - Suitability is deterministic and requirement-specific (handled downstream by the Possibility Engine).

---

## 2. Practical Attribute Vocabulary

AccessAtlas uses an extensible vocabulary for practical participation attributes ([`app.evidence.models.EvidenceAttribute`](../backend/app/evidence/models.py)):

| Attribute | Description & Scope |
|---|---|
| `step_free_entrance` | Ramped or level entrance without steps, threshold heights, automated doors. |
| `internal_elevator` | Operational elevators servicing public levels, balconies, or galleries. |
| `seating_available` | Seating, benches, or portable chairs available during the visit. |
| `rest_areas` | Designated low-traffic quiet seating areas. |
| `quiet_space` | Designated sensory decompression or prayer spaces. |
| `audio_description` | Availability of live or recorded audio descriptive guides. |
| `assistive_listening` | Induction loops, FM systems, or personal listening devices. |
| `sensory_adapted_session` | Relaxed performances, low-sensory hours, reduced sound/lighting. |
| `service_animal_policy` | Documented admittance and relief policies for assistance dogs. |
| `companion_entry_policy` | Essential companion/carer complimentary or discounted ticket policies. |
| `reservation_required` | Timed-entry slots or advance booking requirements. |
| `step_free_restroom` | Wheelchair-accessible restroom facilities and door widths. |
| `accessible_parking` | Dedicated accessible parking bays or drop-off zones. |
| `contact_for_access_info` | Dedicated accessibility coordinator email or phone contact. |

> **Note**: This vocabulary represents a practical set of participation considerations, not an exhaustive architectural code or legal standard (e.g. ADA Title III or UK Equality Act).

---

## 3. Evidence Hierarchy & Source Provenance

Every source-backed practical claim must retain full provenance ([`app.evidence.models.EvidenceSource`](../backend/app/evidence/models.py)):

- **Source Type** (`source_type`):
  1. `official_venue_website`: Accessibility pages published by the operating venue.
  2. `primary_organizer_notice`: Direct guidance published by the event producer/organizer.
  3. `direct_venue_communication`: Direct email, phone, or written confirmation from venue staff.
  4. `on_site_audit`: Standardized on-site inspection conducted by an auditor.
  5. `community_report`: Direct firsthand report from a visitor.
  6. `third_party_directory`: Secondary cultural or municipal access directories.
- **Verification Timestamp** (`verified_at`):
  - Must be a **timezone-aware** ISO datetime. Naive datetimes are strictly rejected.
  - Represents when the specific claim was retrieved or verified by a human or automated check.
- **Source Reference** (`url` or title):
  - Valid HTTP/HTTPS URL when available online.
  - Organization or audit report title when derived from offline or direct communication.

---

## 4. Evidence States: Unknown vs. Source-Backed vs. Conflicting

Each attribute is evaluated and preserved as an [`AttributeEvidence`](../backend/app/evidence/models.py) record:

1. **`source_backed`**:
   - The attribute has at least one valid, source-backed claim from an independent source.
2. **`unknown`**:
   - Necessary information is missing, ambiguous, or unverified.
   - Unknown attributes **must have no claims attached** (`claims=[]`). We never fabricate placeholder sources.
3. **`conflicting`**:
   - Two or more independent sources report incompatible facts (e.g. website claims general seating is available, while an on-site report finds all seating was removed).
   - All conflicting claims are preserved side-by-side. The system never arbitrarily silences a dissenting claim.

---

## 5. Claim Scope: Venue vs. Experience

A critical design requirement is separating **venue-level** scope from **experience-level** scope ([`ClaimScope`](../backend/app/evidence/models.py)):

- **Venue Scope (`ClaimScope.VENUE`)**:
  - Pertains to the physical facility as a whole (e.g. main street entrance, perimeter parking, main building elevators).
- **Experience Scope (`ClaimScope.EXPERIENCE`)**:
  - Pertains to a specific event, exhibition, or tour hosted within a venue (e.g. an historic rooftop tour, a temporary exhibition, or an outdoor courtyard performance).

**Invariant**: Evidence regarding a building's front entrance does not automatically apply to an experience within it. For example, a museum building may have a step-free entrance, but a historic rooftop tour inside that museum may require climbing 120 spiral stairs without elevator access. [`EvidenceRecord`](../backend/app/evidence/models.py) strictly validates and enforces this separation.

---

## 6. Outdated Information & Review Guidelines

Built environments and operational policies change frequently:
- **Periodic Verification**: Claims retain `verified_at` timestamps to allow the Possibility Engine to flag aging records for re-confirmation.
- **Prohibition on Fabrication**: Never fabricate venue claims, audit dates, or source URLs.
- **Pilot-City Data Collection**: Real pilot-city data must not be introduced into the repository until explicit city selection, ethical review, and primary source verification protocols are established. Synthetic test fixtures ([`app.evidence.fixtures`](../backend/app/evidence/fixtures.py)) are clearly labelled and used exclusively for unit testing.
