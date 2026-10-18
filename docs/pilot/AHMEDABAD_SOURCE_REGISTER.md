# AccessAtlas — Ahmedabad Pilot Source & Evidence Register (Stage A)

> **Status:** Stage A Source Register (Pre-Integration).  
> **Retrieval Datetime:** 2026-10-18T16:25:00+05:30.  
> **Notice:** All claims in this register represent preliminary research extracted from official venue websites and identified secondary sources. They are marked `PROPOSED` and have not yet been imported into application runtime fixtures.

---

## 1. Verified Source Register

The following primary and secondary sources were consulted during Stage A investigation:

| Source ID | Source Type | Organization / Title | URL | Verified At (ISO 8601) | Authority & Scope |
|---|---|---|---|---|---|
| `SRC_AHM_CAL_01` | `official_venue_website` | Sarabhai Foundation — Tour Guidelines | `https://www.calicomuseum.org/tour-guidelines/` | `2026-10-18T16:25:00+05:30` | Primary official source for Calico Museum entry, capacity, timings, and access policies. |
| `SRC_AHM_CAL_02` | `official_venue_website` | Calico Museum of Textiles — Homepage & Contacts | `https://www.calicomuseum.org/` | `2026-10-18T16:25:00+05:30` | Official location, email, and contact numbers. |
| `SRC_AHM_KLM_01` | `official_venue_website` | Kasturbhai Lalbhai Museum — Guidelines & FAQ | `https://kasturbhailalbhaimuseum.com/` | `2026-10-18T16:25:00+05:30` | Primary official source for tour times, small-batch bookings, and contact details. |
| `SRC_AHM_KLM_02` | `third_party_directory` | Museums of India — Kasturbhai Lalbhai Museum Profile | `https://museumsofindia.org/` | `2026-10-18T16:25:00+05:30` | Secondary directory detailing architectural history and collection scope. |
| `SRC_AHM_CNF_01` | `official_venue_website` | Conflictorium — Official Website & Ahmedabad Location | `https://www.conflictorium.org/` | `2026-10-18T16:25:00+05:30` | Primary official source for Gool Lodge address, hours, admission, and email. |
| `SRC_AHM_CNF_02` | `official_venue_website` | Conflictorium — Locations & Raipur Branch Information | `https://www.conflictorium.org/` | `2026-10-18T16:25:00+05:30` | Disambiguation source establishing separate Raipur branch details. |

---

## 2. Proposed Claim-Level Evidence: Calico Museum of Textiles

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_calico`
- **Name:** Calico Museum of Textiles (Sarabhai Foundation)
- **Address:** "The Retreat", Opp. Underbridge, Shahibaug, Ahmedabad, Gujarat 380004, India.

| Attribute | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability | Proposed Status |
|---|---|---|---|---|---|---|
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `False` | `SRC_AHM_CAL_01` | *"The Foundation is currently unable to offer wheelchair access to visitors."* Multi-level historic haveli buildings with varying floor surfaces. | Direct boolean (`False`) | `PROPOSED` |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `False` | `SRC_AHM_CAL_01` | Galleries are spread across multiple levels with historic staircases; no mechanical lifts installed in heritage structures. | Direct boolean (`False`) | `PROPOSED` |
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `True` | `SRC_AHM_CAL_01` | Entry is free of charge but strictly regulated via advance online registration opening 90 days ahead. Capped at 20 persons per tour. | Direct boolean (`True`) | `PROPOSED` |
| `SENSORY_ENVIRONMENT` | `ClaimScope.VENUE` | `"Low-Lux Conservation Lighting"` | `SRC_AHM_CAL_01` | Illumination levels are kept deliberately low to prevent degradation of organic textiles and ancient dyes. Eyes require adaptation time. | Qualitative note (needs confirmation if evaluating numerical thresholds) | `PROPOSED` |
| `COMPANION_POLICY` | `ClaimScope.VENUE` | `True` | `SRC_AHM_CAL_01` | Children 10–15 years admitted only with parent/guardian. (Children under 10 not admitted). | Machine evaluable with qualifications | `PROPOSED` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `True` | `SRC_AHM_CAL_02` | Email: `calicomuseum@gmail.com`; Phones: +91 (79) 22868172 / +91 (79) 22865995. | Direct boolean (`True`) | `PROPOSED` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | No published data on accessible restroom door width or grab rails. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Official policy is silent regarding guide dogs or service animals. | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CAL_01` | Continuous walking tour across multiple levels; rest bench frequency is unstated. | Not evaluable | `UNKNOWN` |

### Experience Identity 1: The Haveli Galleries Tour
- **Proposed Experience ID:** `prop_exp_in_ahm_calico_haveli`
- **Title:** The Haveli Galleries Morning Tour
- **Venue Link:** `prop_ven_in_ahm_calico`

| Attribute | Scope | Proposed Value | Source ID | Supporting Source Evidence | Proposed Status |
|---|---|---|---|---|---|
| `STEP_FREE_ENTRANCE` | `ClaimScope.EXPERIENCE` | `False` | `SRC_AHM_CAL_01` | Historic wooden haveli multi-story structure with step thresholds. | `PROPOSED` |
| `RESERVATION_REQUIRED` | `ClaimScope.EXPERIENCE` | `True` | `SRC_AHM_CAL_01` | 10:30 AM – 12:30 PM slot; mandatory online registration. | `PROPOSED` |

### Experience Identity 2: The Chauk Galleries Tour
- **Proposed Experience ID:** `prop_exp_in_ahm_calico_chauk`
- **Title:** The Chauk Galleries Afternoon Tour
- **Venue Link:** `prop_ven_in_ahm_calico`

| Attribute | Scope | Proposed Value | Source ID | Supporting Source Evidence | Proposed Status |
|---|---|---|---|---|---|
| `STEP_FREE_ENTRANCE` | `ClaimScope.EXPERIENCE` | `False` | `SRC_AHM_CAL_01` | Multi-level split floor pavilions with steps. | `PROPOSED` |
| `RESERVATION_REQUIRED` | `ClaimScope.EXPERIENCE` | `True` | `SRC_AHM_CAL_01` | 2:30 PM – 4:30 PM slot; mandatory online registration. | `PROPOSED` |

---

## 3. Proposed Claim-Level Evidence: Kasturbhai Lalbhai Museum

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_kasturbhai`
- **Name:** Kasturbhai Lalbhai Museum
- **Address:** Lalbaug, Shahibaug, Ahmedabad, Gujarat 380004, India.

| Attribute | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability | Proposed Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `True` | `SRC_AHM_KLM_01` | Unguided walk-in visits not permitted. Entry strictly via pre-booked guided tours (phone/email booking required). | Direct boolean (`True`) | `PROPOSED` |
| `OPENING_AND_SESSIONS` | `ClaimScope.VENUE` | `"Tuesday-Sunday, 4 daily slots"` | `SRC_AHM_KLM_01` | Open Tue–Sun (Closed Mon/Holidays). Fixed tour slots: 10:00 AM, 12:00 PM, 2:30 PM, 4:00 PM (~30 min). | String / Schedule | `PROPOSED` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `True` | `SRC_AHM_KLM_01` | Phone: +91 (79) 2286-5456 / +91 (79) 2286-6376; Email: `klmuseum16@gmail.com`. | Direct boolean (`True`) | `PROPOSED` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Official website does not specify if the 1905 heritage colonial house has ramp access. | Not evaluable | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Presence of an elevator within the two-story heritage domestic structures is unstated. | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Presence of seating along tour routes or in gallery rooms is unstated. | Not evaluable | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | Campus restroom accessibility details are unrecorded. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_KLM_01` | No guidance published regarding assistance dogs. | Not evaluable | `UNKNOWN` |

---

## 4. Proposed Claim-Level Evidence: Conflictorium (Ahmedabad)

### Venue Identity
- **Proposed Venue ID:** `prop_ven_in_ahm_conflictorium`
- **Name:** Conflictorium — Museum of Conflict (Ahmedabad)
- **Address:** Gool Lodge, Opp. R.C. High School of Commerce, Delhi Chakla, Mirzapur, Ahmedabad, Gujarat 380001, India.

| Attribute | Scope | Proposed Value | Source ID | Exact Source Wording / Faithful Paraphrase | Machine Evaluability | Proposed Status |
|---|---|---|---|---|---|---|
| `RESERVATION_REQUIRED` | `ClaimScope.VENUE` | `False` | `SRC_AHM_CNF_01` | Free walk-in entry; general public visits do not require advance ticketing. | Direct boolean (`False`) | `PROPOSED` |
| `OPENING_AND_SESSIONS` | `ClaimScope.VENUE` | `"Tuesday-Sunday, 11:00 AM - 7:00 PM"` | `SRC_AHM_CNF_01` | Open Tue–Sun, 11:00 AM to 7:00 PM. Closed on Mondays. | String / Schedule | `PROPOSED` |
| `CONTACT_FOR_ACCESS_INFO` | `ClaimScope.VENUE` | `True` | `SRC_AHM_CNF_01` | Email: `dialogue@conflictorium.org`; Phone: +91 (79) 25620747. | Direct boolean (`True`) | `PROPOSED` |
| `STEP_FREE_ENTRANCE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Gool Lodge is a 1920s heritage house with a raised plinth; physical ramp availability is unconfirmed on official website. | Not evaluable | `UNKNOWN` |
| `INTERNAL_ELEVATOR` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Multi-story domestic bungalow with historic wooden staircase; elevator presence unstated. | Not evaluable | `UNKNOWN` |
| `SEATING_AVAILABLE` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Interactive rooms feature various chairs/desks, but dedicated resting seating is uncataloged. | Not evaluable | `UNKNOWN` |
| `STEP_FREE_RESTROOM` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | Restroom dimensions and accessibility are unrecorded. | Not evaluable | `UNKNOWN` |
| `SERVICE_ANIMAL_POLICY` | `ClaimScope.VENUE` | `None` | `SRC_AHM_CNF_01` | No published assistance animal policy. | Not evaluable | `UNKNOWN` |

---

## 5. Discrepancy & Conflict Register

| Venue | Attribute / Subject | Official Primary Position | Secondary Discrepancy / Incompatibility | Risk & Mitigation |
|---|---|---|---|---|
| **Calico Museum** | Wheelchair Accessibility | Official site explicitly states: *"The Foundation is currently unable to offer wheelchair access to visitors."* | Generic online travel portals and map aggregators occasionally show automated "Wheelchair accessible" green checkmarks. | **High Risk:** Relying on unverified secondary tags would lead a mobility device user to arrive at an inaccessible facility. **Mitigation:** Primary official statement must supersede generic aggregator metadata. |
| **Calico Museum** | Walk-in Admission | Official site mandates strict online registration 90 days in advance; 20-person tour limit. | Informal travel blogs frequently describe Calico as "Free museum entry in Ahmedabad" without emphasizing compulsory pre-booking. | **Moderate Risk:** Visitors arriving without reservations are turned away. **Mitigation:** Record `RESERVATION_REQUIRED = True` with mandatory confirmation notes. |
| **Conflictorium** | Geographical Location | Conflictorium operates in Mirzapur, Ahmedabad (Gool Lodge). | Conflictorium opened a second physical branch in Raipur, Chhattisgarh (Katora Talaab) in 2022. Several online listings conflate the phone numbers and contact emails (`raipur@conflictorium.org`). | **High Risk:** Sending visitor inquiries or geotargeting to Raipur instead of Ahmedabad. **Mitigation:** Strict locality filtering in identity schemas (`prop_ven_in_ahm_conflictorium`). |
