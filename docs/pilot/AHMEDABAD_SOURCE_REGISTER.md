# AccessAtlas — Ahmedabad Pilot Source & Evidence Register (Stage A)

> **Status:** Stage A Source Register (Review Corrections).  
> **Retrieval Datetime:** 2026-10-18T16:25:00+05:30.  
> **Verification Level:** `SOURCE_RETRIEVED` (Official web publication review only; **`UNVERIFIED_INDEPENDENTLY`** on site).  
> **Notice:** All claims in this register represent preliminary research extracted from official venue websites and identified secondary sources. They are marked `PROPOSED` or `UNKNOWN` and have not yet been imported into application runtime fixtures.

---

## 1. Verified Source Register

The following primary and secondary sources were consulted during Stage A investigation:

| Source ID | Source Type | Organization / Title | URL | Verified At (ISO 8601) | Authority & Scope | Factual Verification Level |
|---|---|---|---|---|---|---|
| `SRC_AHM_CAL_01` | `official_venue_website` | Sarabhai Foundation — Tour Guidelines | `https://www.calicomuseum.org/tour-guidelines/` | `2026-10-18T16:25:00+05:30` | Primary official source for Calico Museum entry, capacity, timings, and access policies. | `SOURCE_RETRIEVED` (Published web text) |
| `SRC_AHM_CAL_02` | `official_venue_website` | Calico Museum of Textiles — Homepage & Contacts | `https://www.calicomuseum.org/` | `2026-10-18T16:25:00+05:30` | Official location, email, and contact numbers. | `SOURCE_RETRIEVED` (Published web text) |
| `SRC_AHM_KLM_01` | `official_venue_website` | Kasturbhai Lalbhai Museum — Guidelines & FAQ | `https://kasturbhailalbhaimuseum.com/` | `2026-10-18T16:25:00+05:30` | Primary official source for tour times, small-batch bookings, and contact details. | `SOURCE_RETRIEVED` (Published web text) |
| `SRC_AHM_KLM_02` | `third_party_directory` | Museums of India — Kasturbhai Lalbhai Museum Profile | `https://museumsofindia.org/` | `2026-10-18T16:25:00+05:30` | Secondary directory detailing architectural history and collection scope. | `SOURCE_RETRIEVED` (Secondary directory) |
| `SRC_AHM_CNF_01` | `official_venue_website` | Conflictorium — Official Website & Ahmedabad Location | `https://www.conflictorium.org/` | `2026-10-18T16:25:00+05:30` | Primary official source for Gool Lodge address, hours, admission, and email. | `SOURCE_RETRIEVED` (Published web text) |
| `SRC_AHM_CNF_02` | `official_venue_website` | Conflictorium — Locations & Raipur Branch Information | `https://www.conflictorium.org/` | `2026-10-18T16:25:00+05:30` | Disambiguation source establishing separate Raipur branch details. | `SOURCE_RETRIEVED` (Published web text) |

---

## 2. Proposed Claim-Level Evidence: Calico Museum of Textiles

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_calico`
- **Name:** Calico Museum of Textiles (Sarabhai Foundation)
- **Address:** "The Retreat", Opp. Underbridge, Shahibaug, Ahmedabad, Gujarat 380004, India.

| Attribute (from `EvidenceAttribute`) | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability & Classification | Proposed Status |
|---|---|---|---|---|---|---|
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Published text: *"The Foundation is currently unable to offer wheelchair access to visitors."* Physical entrance threshold and gate geometry are not published. | Not evaluable as physical threshold; converting wheelchair policy to entrance claim is unsupported. | `UNKNOWN` (Wheelchair policy documented) |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Galleries are spread over historic haveli multi-story structures. Elevator existence is not explicitly stated on official channels. | Not evaluable (silence on official channels). | `UNKNOWN` |
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `True` | `SRC_AHM_CAL_01` | Entry is free of charge but strictly regulated via advance online registration opening 90 days ahead. Capped at 20 persons per tour. | Direct boolean (`True`). Advance window (90 days) preserved in `details`. | `PROPOSED` |
| `SENSORY_ADAPTED_SESSION` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Low illumination is maintained for scientific textile conservation. No specialized sensory-adapted sessions are offered. | Not evaluable as an adapted session. Conservation lighting recorded in notes. | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Official policy is silent on personal assistant or carer admission for visitors with disabilities. (Child accompaniment rule: 10–15 accompanied; under 10 prohibited). | Not evaluable for disability companion policy. Child rules recorded as admission qualifications. | `UNKNOWN` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_02` | General contact published: `calicomuseum@gmail.com`; Phones: +91 (79) 22868172 / +91 (79) 22865995. No dedicated accessibility contact published. | General contact details only; does not substantiate dedicated accessibility coordination. | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | No published data on accessible restroom doors or grab rails. | Not evaluable. | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Official policy is silent regarding guide dogs or service animals. | Not evaluable. | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Continuous walking tour across multiple levels; rest bench frequency is unstated. | Not evaluable. | `UNKNOWN` |
| `ACCESSIBLE_PARKING` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Parking exists within the estate, but dedicated accessible stall dimensions are unrecorded. | Not evaluable. | `UNKNOWN` |

### Experience Identity 1: The Haveli Galleries Tour
- **Proposed Experience ID:** `prop_exp_in_ahm_calico_haveli`
- **Title:** The Haveli Galleries Morning Tour
- **Venue Link:** `prop_ven_in_ahm_calico`

| Attribute | Scope | Proposed Value | Source ID | Supporting Source Evidence | Proposed Status |
|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.EXPERIENCE` | `True` | `SRC_AHM_CAL_01` | 10:30 AM – 12:30 PM slot; mandatory online registration opens 90 days ahead; 20-person cap. | `PROPOSED` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.EXPERIENCE` | `None` | `SRC_AHM_CAL_01` | Historic wooden haveli multi-story structure; specific threshold steps uncataloged. | `UNKNOWN` |

### Experience Identity 2: The Chauk Galleries Tour
- **Proposed Experience ID:** `prop_exp_in_ahm_calico_chauk`
- **Title:** The Chauk Galleries Afternoon Tour
- **Venue Link:** `prop_ven_in_ahm_calico`

| Attribute | Scope | Proposed Value | Source ID | Supporting Source Evidence | Proposed Status |
|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.EXPERIENCE` | `True` | `SRC_AHM_CAL_01` | 2:30 PM – 4:30 PM slot; mandatory online registration opens 90 days ahead; 20-person cap. | `PROPOSED` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.EXPERIENCE` | `None` | `SRC_AHM_CAL_01` | Split-level pavilions; specific threshold steps uncataloged. | `UNKNOWN` |

---

## 3. Proposed Claim-Level Evidence: Kasturbhai Lalbhai Museum

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_kasturbhai`
- **Name:** Kasturbhai Lalbhai Museum
- **Address:** Lalbaug, Shahibaug, Ahmedabad, Gujarat 380004, India.

| Attribute (from `EvidenceAttribute`) | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability & Classification | Proposed Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `True` | `SRC_AHM_KLM_01` | Unguided walk-in visits not permitted for ordinary visits. Entry strictly via pre-booked guided tours (phone/email booking required). | Direct boolean (`True`). 4 daily slots (10am, 12pm, 2:30pm, 4pm), ~12 person cap recorded in `details`. | `PROPOSED` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Phone: +91 (79) 2286-5456 / +91 (79) 2286-6376; Email: `klmuseum16@gmail.com`. | General booking contact only; does not substantiate dedicated accessibility coordination. | `UNKNOWN` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Official website does not specify if the 1905 heritage colonial house or modern Batley wing has ramp access. | Not evaluable. | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Presence of an elevator within the two-story heritage domestic structure is unstated. | Not evaluable. | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Presence of seating along tour routes or in gallery rooms is unstated. | Not evaluable. | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Campus restroom accessibility details are unrecorded. | Not evaluable. | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | No guidance published regarding assistance dogs. | Not evaluable. | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | No carer / companion admission policy published. | Not evaluable. | `UNKNOWN` |

---

## 4. Proposed Claim-Level Evidence: Conflictorium (Ahmedabad)

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_conflictorium`
- **Name:** Conflictorium — Museum of Conflict (Ahmedabad)
- **Address:** Gool Lodge, Opp. R.C. High School of Commerce, Delhi Chakla, Mirzapur, Ahmedabad, Gujarat 380001, India.

| Attribute (from `EvidenceAttribute`) | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability & Classification | Proposed Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `False` | `SRC_AHM_CNF_01` | Free walk-in entry for ordinary museum visits; individual visits do not require advance ticketing. (Special events may require RSVP). | Direct boolean (`False`). Ordinary vs. special-event distinction noted in `details`. | `PROPOSED` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Email: `dialogue@conflictorium.org`; Phone: +91 (79) 25620747. | General institutional contact only; does not substantiate dedicated accessibility coordination. | `UNKNOWN` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Gool Lodge is a 1920s heritage house with a raised plinth. Physical ramp availability is unconfirmed on official website. | Not evaluable on official text (silence). | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Multi-story domestic bungalow with historic wooden staircase; elevator presence unstated. | Not evaluable. | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Interactive rooms feature various chairs/desks, but dedicated resting seating along circulation paths is uncataloged. | Not evaluable. | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Restroom dimensions and accessibility are unrecorded. | Not evaluable. | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | No published assistance animal policy. | Not evaluable. | `UNKNOWN` |
| `COMPANION_ENTRY_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | No carer / companion admission policy published. | Not evaluable. | `UNKNOWN` |

---

## 5. Discrepancy & Conflict Register

| Venue | Attribute / Subject | Official Primary Position | Secondary Discrepancy / Incompatibility | Severity & Risk Assessment | Mitigation Rule |
|---|---|---|---|---|---|
| **Calico Museum** | Wheelchair Accessibility | Official site explicitly states: *"The Foundation is currently unable to offer wheelchair access to visitors."* | Generic online travel portals and map aggregators occasionally show automated "Wheelchair accessible" green checkmarks. | **High Risk:** Relying on unverified secondary tags would lead a mobility device user to arrive at an inaccessible facility. | Primary official statement supersedes generic aggregator metadata. Record policy limitation; mark threshold attributes as requiring direct inquiry. |
| **Calico Museum** | Walk-in Admission | Official site mandates strict online registration opening 90 days in advance; 20-person tour limit; gates close 15 min prior. | Informal travel blogs frequently describe Calico as "Free museum entry in Ahmedabad" without emphasizing compulsory pre-booking and lockouts. | **Moderate Risk:** Visitors arriving without reservations are turned away. | Record `RESERVATION_REQUIRED = True` with mandatory confirmation notes and booking window details. |
| **Conflictorium** | Geographical Location & Branch | Conflictorium operates in Mirzapur, Ahmedabad (Gool Lodge). | Conflictorium opened a second physical branch in Raipur, Chhattisgarh (Katora Talaab) in 2022. Several online listings conflate the phone numbers and contact emails (`raipur@conflictorium.org`). | **High Risk:** Sending visitor inquiries or geotargeting to Raipur instead of Ahmedabad. | Strict locality filtering in identity schemas (`prop_ven_in_ahm_conflictorium`). Discard Raipur-specific contact information. |
| **Kasturbhai Lalbhai** | Walk-in Admission | Official site mandates guided tour bookings via phone or email in advance (4 daily slots, capped at ~12). | Tourism directories and travel aggregator sites occasionally list the museum as general walk-in without highlighting compulsory guided tour slots. | **Moderate Risk:** Visitors arriving expecting unguided walk-in entry are denied access. | Record `RESERVATION_REQUIRED = True` with advance phone/email requirement. |
