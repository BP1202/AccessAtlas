# AccessAtlas — Ahmedabad Pilot Source & Evidence Register (Stage B)

> **Status:** Stage B Implemented Source Register.  
> **Retrieval Datetime:** 2026-10-18T16:25:00+05:30.  
> **Implementation Module:** [`backend/app/evidence/pilot_ahmedabad.py`](../../backend/app/evidence/pilot_ahmedabad.py).  
> **Notice:** All claims in this register have been integrated into `backend/app/evidence/pilot_ahmedabad.py`.

---

## 1. Verified Source Register

| Source ID | Source Type | Organization / Title | URL | Verified At (ISO 8601) | Authority & Scope |
|---|---|---|---|---|---|
| `SRC_AHM_CAL_01` | `official_venue_website` | Sarabhai Foundation — Tour Guidelines | `https://www.calicomuseum.org/tour-guidelines/` | `2026-10-18T16:25:00+05:30` | Official guidelines for Calico entry, group caps, punctuality, and access policies. |
| `SRC_AHM_CAL_02` | `official_venue_website` | Calico Museum of Textiles — Homepage & Contacts | `https://www.calicomuseum.org/` | `2026-10-18T16:25:00+05:30` | Official address, contact email, and phone numbers. |
| `SRC_AHM_KLM_01` | `official_venue_website` | Kasturbhai Lalbhai Museum — Guidelines & FAQ | `https://kasturbhailalbhaimuseum.com/` | `2026-10-18T16:25:00+05:30` | Official source for guided tour times, batch caps, and booking contacts. |
| `SRC_AHM_CNF_01` | `official_venue_website` | Conflictorium — Official Website (Ahmedabad) | `https://www.conflictorium.org/` | `2026-10-18T16:25:00+05:30` | Official source for Gool Lodge address, walk-in hours, and dialogue contacts. |

---

## 2. Integrated Evidence Records & Claims

### 2.1 Calico Museum of Textiles (`ven_in_ahm_calico`)
- **Location:** "The Retreat", Opp. Underbridge, Shahibaug, Ahmedabad, Gujarat 380004.
- **Approved Qloo Entity ID:** `783C0235-681D-4235-BA4D-A57992F7C97A`.

| Attribute | Scope | Value | Source ID | Exact Source Wording / Note | Evaluability | Status |
|---|---|---|---|---|---|---|
| `WHEELCHAIR_ACCESS` | `VENUE` | `False` | `SRC_AHM_CAL_01` | *"The Foundation is currently unable to offer wheelchair access to visitors."* | Machine evaluable (`EQUALS`) | `SOURCE_BACKED` |
| `RESERVATION_REQUIRED` | `VENUE` | `True` | `SRC_AHM_CAL_01` | Free online registration opens 90 days in advance; strictly capped at 20 visitors per tour. | Machine evaluable (`EQUALS`) | `SOURCE_BACKED` |
| `STEP_FREE_ENTRANCE` | `VENUE` | `None` | `SRC_AHM_CAL_01` | Physical entrance threshold geometry unrecorded on official channels. | Not evaluable | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `VENUE` | `None` | `SRC_AHM_CAL_01` | Elevator presence is not explicitly stated on official channels. | Not evaluable | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `VENUE` | `None` | `SRC_AHM_CAL_01` | Restroom dimensions and grab rails unrecorded. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY`| `VENUE` | `None` | `SRC_AHM_CAL_01` | Assistance animal policy unstated. | Not evaluable | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY`| `VENUE`| `None` | `SRC_AHM_CAL_01` | Disability carer policy unstated. (Child policy: under 10 prohibited; 10–15 accompanied). | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `VENUE` | `None` | `SRC_AHM_CAL_01` | Rest bench frequency along guided route unrecorded. | Not evaluable | `UNKNOWN` |
| `CONTACT_FOR_ACCESS_INFO`| `VENUE`| `None` | `SRC_AHM_CAL_02` | General administrative contacts only; dedicated access coordinator unrecorded. | Not evaluable | `UNKNOWN` |

#### Linked Experiences
1. **The Haveli Galleries Morning Tour (`exp_in_ahm_calico_haveli`)**:
   - `RESERVATION_REQUIRED = True` (10:30 AM – 12:30 PM slot, capped at 20, 90-day window).
   - `STEP_FREE_ENTRANCE = UNKNOWN` (historic split-level wooden haveli).
2. **The Chauk Galleries Afternoon Tour (`exp_in_ahm_calico_chauk`)**:
   - `RESERVATION_REQUIRED = True` (2:30 PM – 4:30 PM slot, capped at 20, 90-day window).
   - `STEP_FREE_ENTRANCE = UNKNOWN` (split-level pavilions).

---

### 2.2 Kasturbhai Lalbhai Museum (`ven_in_ahm_kasturbhai`)
- **Location:** Lalbaug, Shahibaug, Ahmedabad, Gujarat 380004.
- **Approved Qloo Entity ID:** `36537424-5653-418C-A39E-33C17214D423`.

| Attribute | Scope | Value | Source ID | Exact Source Wording / Note | Evaluability | Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `VENUE` | `True` | `SRC_AHM_KLM_01` | Guided tours only; phone/email pre-booking mandatory; 4 daily slots, capped at ~12. | Machine evaluable (`EQUALS`) | `SOURCE_BACKED` |
| `STEP_FREE_ENTRANCE` | `VENUE` | `None` | `SRC_AHM_KLM_01` | Ramp access to 1905 house or Batley wing unrecorded. | Not evaluable | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `VENUE` | `None` | `SRC_AHM_KLM_01` | Elevator to upper floors unrecorded. | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `VENUE` | `None` | `SRC_AHM_KLM_01` | Tour route seating unrecorded. | Not evaluable | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `VENUE` | `None` | `SRC_AHM_KLM_01` | Restroom accessibility unrecorded. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY`| `VENUE` | `None` | `SRC_AHM_KLM_01` | Assistance animal policy unrecorded. | Not evaluable | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY`| `VENUE`| `None` | `SRC_AHM_KLM_01` | Carer admission policy unrecorded. | Not evaluable | `UNKNOWN` |
| `CONTACT_FOR_ACCESS_INFO`| `VENUE`| `None` | `SRC_AHM_KLM_01` | General booking contacts only; dedicated access coordination unrecorded. | Not evaluable | `UNKNOWN` |

#### Linked Experience
- **Guided Heritage House & Gallery Tour (`exp_in_ahm_klm_guided_tour`)**:
  - `RESERVATION_REQUIRED = True` (4 slots daily, capped at ~12 people).

---

### 2.3 Conflictorium — Museum of Conflict (`ven_in_ahm_conflictorium`)
- **Location:** Gool Lodge, Opp. R.C. High School of Commerce, Delhi Chakla, Mirzapur, Ahmedabad, Gujarat 380001.
- **Approved Qloo Entity ID:** `8090F76A-F5EE-4931-8942-12B1FF3C4996`.

| Attribute | Scope | Value | Source ID | Exact Source Wording / Note | Evaluability | Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `VENUE` | `False` | `SRC_AHM_CNF_01` | Free walk-in ordinary admission (Tue–Sun, 11am–7pm). Special events may require RSVP. | Machine evaluable (`EQUALS`) | `SOURCE_BACKED` |
| `STEP_FREE_ENTRANCE` | `VENUE` | `None` | `SRC_AHM_CNF_01` | Raised street plinth visible in photos; physical ramp unconfirmed on official site. | Not evaluable | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `VENUE` | `None` | `SRC_AHM_CNF_01` | Multi-story bungalow with wooden staircase; elevator presence unstated. | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `VENUE` | `None` | `SRC_AHM_CNF_01` | Exhibition circulation seating unrecorded. | Not evaluable | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `VENUE` | `None` | `SRC_AHM_CNF_01` | Restroom accessibility unrecorded. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY`| `VENUE` | `None` | `SRC_AHM_CNF_01` | Assistance animal policy unrecorded. | Not evaluable | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY`| `VENUE`| `None` | `SRC_AHM_CNF_01` | Carer admission policy unrecorded. | Not evaluable | `UNKNOWN` |
| `CONTACT_FOR_ACCESS_INFO`| `VENUE`| `None` | `SRC_AHM_CNF_01` | General dialogue contacts only; dedicated access desk unrecorded. | Not evaluable | `UNKNOWN` |

---

## 3. Discrepancy & Exclusion Register

| Subject | Official Primary Position | Discrepancy / Excluded Entity | Mitigation Rule |
|---|---|---|---|
| **Calico Wheelchair Access** | Published: *"The Foundation is currently unable to offer wheelchair access to visitors."* | Third-party travel aggregators occasionally show automated "Wheelchair accessible" checkmarks. | Primary statement supersedes secondary aggregators. Recorded as `WHEELCHAIR_ACCESS=False`; surfaced in plans. |
| **Calico Booking Horizon** | Online booking opens 90 days ahead; strictly capped at 20 visitors per tour. | Travel blogs mention "free entry museum" without explaining compulsory pre-booking and gate lockouts. | Recorded as `RESERVATION_REQUIRED=True` with explicit 90-day booking window qualifications. |
| **Conflictorium Raipur Branch** | Ahmedabad location is Gool Lodge, Mirzapur, Ahmedabad 380001. | Qloo entity `7A72825D-1C1F-4433-9113-AE6DADA44862` represents Conflictorium Raipur, Chhattisgarh. | Strictly excluded from candidate resolver. |
| **Conflictorium Duplicate Entity** | Ahmedabad candidate verified as `8090F76A-F5EE-4931-8942-12B1FF3C4996`. | Qloo entity `D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D` is a duplicate with inconsistent metadata. | Strictly excluded from candidate resolver. |
