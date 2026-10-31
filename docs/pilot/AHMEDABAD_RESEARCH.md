# AccessAtlas — Ahmedabad Pilot Evidence Research & Implementation (Stage B)

> **Status:** Stage B Implemented Pilot Evidence Deliverable.  
> **Pilot City:** Ahmedabad, Gujarat, India.  
> **Review Status:** `IMPLEMENTED_AND_REVIEWED` (Integrated in `backend/app/evidence/pilot_ahmedabad.py`).  
> **Verification Level:** `SOURCE_RETRIEVED` (Official web publication review; **`NOT_INDEPENDENTLY_AUDITED`** on site).  
> **Notice:** This document details the reviewed real-world evidence records, approved Qloo entity correspondences, schema extension rationale, deferred claims, and remaining unknowns for the Ahmedabad pilot.

---

## 1. Executive Summary & Pilot Scope

Ahmedabad, recognized as India's first UNESCO World Heritage City (2017), possesses an extraordinary concentration of vernacular, colonial, modern, and industrial architectural heritage. Cultural institutions in Ahmedabad frequently occupy converted heritage havelis, colonial residential bungalows, and institutional estates.

This presents distinct accessibility and operational dynamics:
- Many cultural experiences are housed in historic multi-level residential structures constructed before the advent of modern barrier-free design standards.
- Conservation restrictions on historic fabric often limit retrofitting of elevators, mechanical lifts, and concrete ramps.
- Several premier institutions enforce strict conservation protocols (e.g. low-lux illumination, controlled group sizes, compulsory guided tours, and advance registration).

Stage B establishes real, source-backed evidence records in [`backend/app/evidence/pilot_ahmedabad.py`](../../backend/app/evidence/pilot_ahmedabad.py) for three foundational cultural candidates in Ahmedabad:
1. **Calico Museum of Textiles** (Shahibaug)
2. **Kasturbhai Lalbhai Museum** (Shahibaug)
3. **Conflictorium — Museum of Conflict** (Mirzapur location — strictly distinguished from its Raipur branch)

---

## 2. Approved Qloo Identity Mappings & Exclusions

These entity correspondences were reviewed against developer-executed Qloo Search results, candidate names, and Ahmedabad geographical details:

| Candidate Venue | Locality | Approved Qloo Entity ID | Implementation Status | Review Basis |
|---|---|---|---|---|
| **Calico Museum of Textiles** | Shahibaug, Ahmedabad | `783C0235-681D-4235-BA4D-A57992F7C97A` | `MAPPED_AND_VERIFIED` | Matches Sarabhai Foundation estate in Shahibaug. |
| **Kasturbhai Lalbhai Museum** | Shahibaug, Ahmedabad | `36537424-5653-418C-A39E-33C17214D423` | `MAPPED_AND_VERIFIED` | Matches Lalbaug ancestral estate and Batley gallery wing. |
| **Conflictorium — Ahmedabad** | Mirzapur, Ahmedabad | `8090F76A-F5EE-4931-8942-12B1FF3C4996` | `MAPPED_AND_VERIFIED` | Matches Gool Lodge, Mirzapur, Ahmedabad location. |

### Explicitly Excluded Non-Approved IDs
The candidate resolver strictly excludes the following entities:
- **Raipur Conflictorium (`7A72825D-1C1F-4433-9113-AE6DADA44862`):** Second physical branch established in Raipur, Chhattisgarh (2022). Out of scope for the Ahmedabad pilot.
- **Geographically Inconsistent Duplicate (`D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D`):** Duplicate record with inconsistent metadata; rejected to prevent ambiguous resolution.

---

## 3. Candidate Evidence Dossiers & Operational Nuances

### 3.1 Candidate 1: Calico Museum of Textiles

#### Identity & Identifiers
- **Venue ID:** `ven_in_ahm_calico`
- **Location:** "The Retreat", Opp. Underbridge, Shahibaug, Ahmedabad, Gujarat 380004.
- **Experiences Implemented:**
  - `exp_in_ahm_calico_haveli`: The Haveli Galleries Morning Tour (10:30 AM – 12:30 PM).
  - `exp_in_ahm_calico_chauk`: The Chauk Galleries Afternoon Tour (2:30 PM – 4:30 PM).

#### Operational Wheelchair Policy & Schema Extension
- **Published Text:** *"The Foundation is currently unable to offer wheelchair access to visitors."*
- **Schema Decision:** Added `EvidenceAttribute.WHEELCHAIR_ACCESS = "wheelchair_access"` to the production schema.
- **Rationale:** Prevents falsely misrepresenting an overall operational wheelchair accommodation limitation as an architectural entrance threshold claim (`STEP_FREE_ENTRANCE=False`).
- **Implementation:**
  - `WHEELCHAIR_ACCESS`: `value=False` (`SOURCE_BACKED`).
  - `STEP_FREE_ENTRANCE`: Strictly `UNKNOWN` (entrance threshold geometry unrecorded on official channels).
  - `INTERNAL_ELEVATOR`: Strictly `UNKNOWN` (mechanical lift existence unrecorded).
  - **Participation Plan Integration:** Surfaced in `suggested_next_actions` so visitors are never blindsided by this operational limitation.

#### Advance Booking Window vs. Minimum Lead Time
- **Published Policy:** Prior online registration is mandatory; entry is free, capped at **20 persons per tour**. Registration opens **90 days in advance**.
- **Qualification:** This represents the opening horizon (bookings accepted up to 90 days ahead), not a minimum advance notice requirement.
- **Implementation:** `RESERVATION_REQUIRED = True` at venue and experience scopes. Details capture the 90-day window and 20-person cap.

#### Claims Deferred from Machine Evaluation
- **Low-Lux Illumination:** Implemented for organic dye textile preservation. Not a `SENSORY_ADAPTED_SESSION`. Retained as a qualification note for visually impaired visitors.
- **Child Admission Rules:** Children under 10 prohibited; ages 10–15 must be accompanied by an adult. Retained in admission notes; `COMPANION_ENTRY_POLICY` remains `UNKNOWN`.

---

### 3.2 Candidate 2: Kasturbhai Lalbhai Museum

#### Identity & Identifiers
- **Venue ID:** `ven_in_ahm_kasturbhai`
- **Location:** Lalbaug, Shahibaug, Ahmedabad, Gujarat 380004.
- **Experience Implemented:**
  - `exp_in_ahm_klm_guided_tour`: Guided Heritage House & Gallery Tour.

#### Ordinary vs. Special Event Admission
- **Ordinary Admission (`RESERVATION_REQUIRED = True`):** Visits strictly by conducted tour only; unguided walk-in visits not permitted. Advance booking required via phone (+91 79 2286-5456 / +91 79 2286-6376) or email (`klmuseum16@gmail.com`). 4 daily slots (10am, 12pm, 2:30pm, 4pm), batches capped at ~12 people.
- **Special Events:** Exhibitions in Claude Batley wing or amphitheater programs follow event-specific guidelines.

#### Remaining Unknown Attributes
- `STEP_FREE_ENTRANCE`: `UNKNOWN` (ramp provision unrecorded).
- `INTERNAL_ELEVATOR`: `UNKNOWN` (elevator in 2-story domestic building unrecorded).
- `SEATING_AVAILABLE`: `UNKNOWN` (rest benches on tour route unrecorded).
- `STEP_FREE_RESTROOM`, `SERVICE_ANIMAL_POLICY`, `COMPANION_ENTRY_POLICY`: `UNKNOWN`.
- `CONTACT_FOR_ACCESS_INFO`: `UNKNOWN` (general booking contacts only).

---

### 3.3 Candidate 3: Conflictorium — Museum of Conflict

#### Identity & Identifiers
- **Venue ID:** `ven_in_ahm_conflictorium`
- **Location:** Gool Lodge, Opp. R.C. High School of Commerce, Delhi Chakla, Mirzapur, Ahmedabad, Gujarat 380001.

#### Ordinary Walk-In vs. Special Events
- **Ordinary Walk-In Admission (`RESERVATION_REQUIRED = False`):** Free and open to the public without reservations (Tuesday to Sunday, 11:00 AM – 7:00 PM).
- **Special Events:** Workshops, panel dialogues, or performances in "The Third Space" may require prior sign-up depending on room capacity (deferred from boolean machine evaluation and retained in claim `details`).

#### Physical Access & Remaining Unknown Attributes
- `STEP_FREE_ENTRANCE`: `UNKNOWN` (raised masonry plinth visible in photos, but ramp existence unstated on official channels).
- `INTERNAL_ELEVATOR`: `UNKNOWN` (multi-story bungalow with wooden staircase; elevator presence unstated).
- `STEP_FREE_RESTROOM`, `SERVICE_ANIMAL_POLICY`, `SEATING_AVAILABLE`: `UNKNOWN`.
- `CONTACT_FOR_ACCESS_INFO`: `UNKNOWN` (general inquiry contact `dialogue@conflictorium.org` published).

---

## 4. Summary Matrix of Integrated Attributes

| Candidate Venue | Scope | Reservation Required | Wheelchair Access | Step-Free Entrance | Elevator | Seating | Service Animals |
|---|---|---|---|---|---|---|---|
| **Calico Museum** | Venue | **Yes** (Opens 90d ahead; cap 20) | **No** (Policy limitation) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Calico: Haveli Tour** | Experience | **Yes** (Morning slot; cap 20) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Calico: Chauk Tour** | Experience | **Yes** (Afternoon slot; cap 20) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Kasturbhai Lalbhai** | Venue | **Yes** (Phone/Email booking) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Kasturbhai: Guided Tour** | Experience | **Yes** (4 slots daily; cap ~12) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Conflictorium** | Venue | **No** (Free walk-in) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |

---

## 5. Source Freshness & Recheck Limitations

- **Source Check Timestamp:** All evidence claims were extracted and validated against official websites on `2026-10-18T16:25:00+05:30`.
- **Limitation:** Institutional rules and hours may shift seasonally. Missing physical accessibility details remain unverified until direct venue coordination or on-site audit.

---

## 6. Offline Integration Testing Instructions

Run the dedicated test suite from `backend/`:

```powershell
cd C:\Pro\AccessAtlas\backend
python -m pytest tests/test_pilot_ahmedabad.py -v
```

This verifies:
- Approved Qloo identity mappings (Calico, Kasturbhai, Conflictorium).
- Exclusion of Raipur Conflictorium and duplicate entity IDs.
- Timezone-aware IST timestamps and official website source types.
- Scope integrity between venue and experience levels.
- Non-misrepresentation of Calico's wheelchair policy as an entrance claim.
- Fully mocked end-to-end workflow execution with zero live network calls.
