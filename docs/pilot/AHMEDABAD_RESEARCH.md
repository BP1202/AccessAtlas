# AccessAtlas — Ahmedabad Pilot Evidence Research (Stage A)

> **Status:** Stage A Research Deliverable (Review Corrections).  
> **Pilot City:** Ahmedabad, Gujarat, India.  
> **Review Status:** `NEEDS_REVIEW` / `PROPOSED`.  
> **Verification Level:** `SOURCE_RETRIEVED` (Published website documentation only; **`NOT_INDEPENDENTLY_AUDITED`** on site).  
> **Notice:** This document contains research observations and source-grounded evidence proposals. No claims have been imported into runtime evidence fixtures, and no Qloo entity mappings have been confirmed.

---

## 1. Executive Summary & Pilot Scope

Ahmedabad, recognized as India's first UNESCO World Heritage City (2017), possesses an extraordinary concentration of vernacular, colonial, modern, and industrial architectural heritage. Cultural institutions in Ahmedabad frequently occupy converted heritage havelis, colonial residential bungalows, and institutional estates.

This presents distinct accessibility and operational dynamics:
- Many cultural experiences are housed in historic multi-level residential structures constructed before the advent of modern barrier-free design standards.
- Conservation restrictions on historic fabric often limit retrofitting of elevators, mechanical lifts, and concrete ramps.
- Several premier institutions enforce strict conservation protocols (e.g. low-lux illumination, controlled group sizes, compulsory guided tours, and advance registration).

Stage A establishes independent, source-backed evidence dossiers for three foundational cultural candidates in Ahmedabad:
1. **Calico Museum of Textiles** (Shahibaug)
2. **Kasturbhai Lalbhai Museum** (Shahibaug)
3. **Conflictorium — Museum of Conflict** (Mirzapur location — strictly distinguished from its Raipur branch)

### Critical Research Principle: Verification vs. Source Retrieval
Every observation in this document reflects **published text retrieved from official web channels** on specified retrieval dates. It must **not** be conflated with on-site physical auditing or direct operational confirmation. Missing information is recorded strictly as **`UNKNOWN`**; silence is never interpreted as a negative answer.

---

## 2. Candidate 1: Calico Museum of Textiles

### 2.1 Venue Identity & Operational Context
- **Institution:** Calico Museum of Textiles (managed by the Sarabhai Foundation).
- **Physical Location:** "The Retreat", Opp. Underbridge, Shahibaug, Ahmedabad, Gujarat 380004, India.
- **Primary Source:** Official Website — `https://www.calicomuseum.org/` (specifically `/tour-guidelines/`).
- **Campus Typology:** A historic residential estate ("The Retreat") comprising historic wooden havelis, marble pavilions, and landscaped courtyards housing premier collections of Indian court textiles, religious fabrics, and historical artifacts.

### 2.2 Venue-Level vs. Experience-Level Distinctions
Visits to the Calico Museum are strictly conducted as organized, supervised guided tours. Independent unguided wandering is prohibited. Access is partitioned across three distinct tour experiences:
1. **The Haveli Galleries Tour (Experience)**: Focuses on religious textiles, Pichhwais, Jain art, and miniature paintings. Conducted in the morning (10:30 AM – 12:30 PM).
2. **The Chauk Galleries Tour (Experience)**: Focuses on historical court costumes, Mughal and regional textiles, carpets, and armor. Conducted in the afternoon (2:30 PM – 4:30 PM).
3. **Udyana Garden Tour (Experience)**: Focuses on the botanical grounds and outdoor pavilions. Conducted Thursdays only (3:30 PM – 5:00 PM).

### 2.3 Operational Policies & Claim-Level Nuances

#### Wheelchair Accessibility Policy vs. Physical Entrance
- **Exact Official Published Text:** *"The Foundation is currently unable to offer wheelchair access to visitors."*
- **Operational Meaning:** Wheelchair accommodation is officially not supported on tours within the museum estate.
- **Distinction from Entrance Threshold (`STEP_FREE_ENTRANCE`):** The published policy explicitly addresses overall wheelchair accommodation. It does **not** document the physical threshold geometry, presence/absence of an entrance step, or threshold ramp availability at the outer gates. Automatically converting this policy into `STEP_FREE_ENTRANCE = False` is an unsupported assumption. Therefore:
  - Wheelchair accommodation status: Explicitly unsupported by policy.
  - Physical `STEP_FREE_ENTRANCE`: Strictly **`UNKNOWN` / `NEEDS_RECHECK`** pending direct inquiry or on-site audit.
  - Vocabulary Note: AccessAtlas `EvidenceAttribute` currently lacks an overarching `WHEELCHAIR_ACCESSIBLE` enum.

#### Internal Circulation & Elevators (`INTERNAL_ELEVATOR`)
- **Published Fact:** Galleries are spread over split levels and historic multi-story domestic havelis.
- **Elevator Status:** The official website makes **no explicit statement** regarding mechanical lifts or elevators. Extrapolating that "no elevators exist" from the historic haveli architecture is unverified.
- **Status:** Strictly **`UNKNOWN`** on official channels.

#### Advance Booking Window vs. Minimum Lead Time (`RESERVATION_REQUIRED`)
- **Exact Official Published Text:** Prior online registration through the official website is mandatory. Entry is free of cost, but capped at **20 persons per tour**.
- **Booking Window:** Online registration **opens 90 days in advance** of the tour date.
- **Clarification:** This is the *advance opening horizon* (bookings become available up to 90 days prior), **not** a "minimum 90-day lead time". Visitors may book any time between the 90-day mark and the tour date, provided vacancies remain.
- **Punctuality & Cancellation:** Multiple bookings for the same tour are automatically cancelled. Entry gates close promptly 15 minutes before tour commencement; late arrivals are strictly denied entry.

#### Textile Conservation Illumination vs. Sensory Sessions
- **Exact Official Published Text:** Galleries are maintained with **low illumination** based on scientific conservation research to prevent photo-degradation of fragile organic fibers and vegetable dyes. Visitors are notified that eyes require several minutes to adjust to the dim ambient lighting upon entry.
- **Distinction:** This is an intrinsic conservation lighting condition, **not** a `SENSORY_ADAPTED_SESSION` (which represents modified or sensory-friendly quiet hours for neurodivergent visitors).

#### Child Supervision Rules vs. Companion / Carer Policies
- **Exact Official Published Text:** Children below 10 years of age are **not permitted** on any tour. Children between 10 and 15 years old are admitted only when accompanied by a parent, guardian, or tutor.
- **Distinction from `COMPANION_ENTRY_POLICY`:** In AccessAtlas, `COMPANION_ENTRY_POLICY` represents policies for support persons, carers, or personal assistants accompanying disabled visitors. Child minimum age (10+) and parental accompaniment are general admission constraints, not disability companion policies.
- **Status for `COMPANION_ENTRY_POLICY`:** Strictly **`UNKNOWN`** (unrecorded on official website).

#### General Venue Contact vs. Dedicated Access Coordination
- **Official Contact Details:** Email `calicomuseum@gmail.com`; Phones +91 (79) 22868172 / +91 (79) 22865995.
- **Distinction:** These are published general administrative contacts. They do **not** substantiate a dedicated accessibility inquiry desk (`CONTACT_FOR_ACCESS_INFO`).
- **Status for `CONTACT_FOR_ACCESS_INFO`:** Strictly **`UNKNOWN` / `NEEDS_RECHECK`**.

### 2.4 Explicit Unknowns Summary
- Dedicated step-free entrance (`STEP_FREE_ENTRANCE`): **`UNKNOWN`**.
- Internal elevator (`INTERNAL_ELEVATOR`): **`UNKNOWN`**.
- Accessible restroom (`STEP_FREE_RESTROOM`): **`UNKNOWN`**.
- Assistance / service animal admission (`SERVICE_ANIMAL_POLICY`): **`UNKNOWN`**.
- Companion / carer entry policy (`COMPANION_ENTRY_POLICY`): **`UNKNOWN`**.
- Rest seating frequency on tour route (`SEATING_AVAILABLE`): **`UNKNOWN`**.
- Accessible parking bays (`ACCESSIBLE_PARKING`): **`UNKNOWN`**.
- Dedicated accessibility contact (`CONTACT_FOR_ACCESS_INFO`): **`UNKNOWN`**.

---

## 3. Candidate 2: Kasturbhai Lalbhai Museum

### 3.1 Venue Identity & Operational Context
- **Institution:** Kasturbhai Lalbhai Museum.
- **Physical Location:** Lalbaug, Shahibaug (near Shahibaug Underpass), Ahmedabad, Gujarat 380004, India.
- **Primary Source:** Official Website — `https://kasturbhailalbhaimuseum.com/`.
- **Campus Typology:** Restored 1905 colonial ancestral home ("Lalbaug") and a 1930s modernist house designed by Claude Batley, set in landscaped gardens. Displays historic miniature paintings, stone sculptures, metalwork, and modern/contemporary Indian art.

### 3.2 Venue-Level vs. Experience-Level Distinctions
- **Campus Grounds (Venue Scope)**: Tree-lined pathways, outdoor sculpture displays, amphitheater, and administrative buildings.
- **Heritage House & Gallery Tours (Experience Scope)**: Conducted guided tours through the historic domestic interiors and modern display wings.

### 3.3 Operational Policies & Claim-Level Nuances

#### Ordinary Admission vs. Special Event Admission
- **Ordinary Admission (`RESERVATION_REQUIRED`)**:
  - General walk-in admission is **not permitted** for regular museum visits.
  - Visits are strictly by **conducted tour only**.
  - Advance booking via telephone (+91 79 2286-5456 / +91 79 2286-6376) or email (`klmuseum16@gmail.com`) is mandatory.
  - Tours are conducted in small batches (capped at approximately 12 people).
  - Open Tuesday to Sunday; closed Mondays and public holidays. Four daily tour slots: 10:00 AM, 12:00 PM, 2:30 PM, 4:00 PM. Each tour duration is approximately 30 minutes.
- **Special Events / Exhibitions**:
  - Temporary art exhibitions in the Claude Batley wing or cultural performances in the amphitheater may operate under separate event-specific guidelines announced per program.

#### Contact Information vs. Dedicated Access Service
- **Published Contacts:** Telephone numbers and email address are provided for booking tours and general inquiries.
- **Distinction:** No dedicated accessibility desk or accessibility officer is mentioned.
- **Status for `CONTACT_FOR_ACCESS_INFO`:** Strictly **`UNKNOWN`**.

### 3.4 Explicit Unknowns Summary
- Step-free entrance ramp to 1905 ancestral home (`STEP_FREE_ENTRANCE`): **`UNKNOWN`**.
- Elevator access to upper domestic floors (`INTERNAL_ELEVATOR`): **`UNKNOWN`**.
- Seating along the 30-minute tour route (`SEATING_AVAILABLE`): **`UNKNOWN`**.
- Accessible restroom availability (`STEP_FREE_RESTROOM`): **`UNKNOWN`**.
- Service dog policy (`SERVICE_ANIMAL_POLICY`): **`UNKNOWN`**.
- Carer / companion entry policy (`COMPANION_ENTRY_POLICY`): **`UNKNOWN`**.
- Dedicated accessibility contact (`CONTACT_FOR_ACCESS_INFO`): **`UNKNOWN`**.

---

## 4. Candidate 3: Conflictorium — Museum of Conflict

### 4.1 Venue Identity & Geographical Disambiguation
- **Institution:** Conflictorium (Museum of Conflict).
- **Physical Location:** Gool Lodge, Opposite R.C. High School of Commerce, Near Chalte Peer Ni Dargah, Delhi Chakla, Mirzapur, Ahmedabad, Gujarat 380001, India.
- **Primary Source:** Official Website — `https://www.conflictorium.org/`.
- **Critical Geographic Safeguard:** Conflictorium operates two distinct physical locations:
  1. **Ahmedabad (Pilot Candidate)**: Gool Lodge, Mirzapur, Ahmedabad, Gujarat 380001.
  2. **Raipur (Out of Scope)**: 35/1237, Punjabi Colony Chowk, Katora Talaab, Raipur, Chhattisgarh 492001.
  *Rule:* Evidence, timings, and contacts for the Raipur branch must not be mixed with the Ahmedabad pilot candidate.

### 4.2 Building Typology
- Housed in **Gool Lodge**, a historic 1920s Parsi residential bungalow in the historic walled city of Ahmedabad.
- A participatory museum exploring social conflict, non-violence, the Indian Constitution, and human rights through experiential installations (e.g. Memory Lab, Empathy Alley, The Third Space).

### 4.3 Operational Policies & Claim-Level Nuances

#### Ordinary Walk-In Admission vs. Special Events
- **Ordinary Walk-In Admission (`RESERVATION_REQUIRED = False`)**:
  - General walk-in admission to Gool Lodge is **free and open to the public**.
  - Operating hours: 11:00 AM to 7:00 PM, Tuesday to Sunday. Closed on Mondays.
  - No tickets or advance reservations are required for individual or family walk-in visits.
- **Special-Event Admission**:
  - Organized workshops, theatrical readings, film screenings, and curated community dialogues in "The Third Space" may require prior sign-up or RSVP depending on event capacity.

#### Physical Access Observations vs. Official Documentation
- **Physical Entrance (`STEP_FREE_ENTRANCE`)**: Third-party architectural photographs show raised masonry plinth steps at the street facade of Gool Lodge. However, the official website makes **no statement** regarding physical accessibility, portable ramps, or alternative ground-level access.
- **Rule:** Silence on official channels must remain **`UNKNOWN`**. We do not record negative claims from unverified imagery.
- **Internal Circulation (`INTERNAL_ELEVATOR`)**: Gool Lodge features an upper floor and mezzanine accessed by historic wooden stairs; elevator installation is unstated on official channels -> **`UNKNOWN`**.

#### Digital Accessibility vs. Physical Accessibility
- **Website Features:** The official website integrates digital accessibility tools (screen-reader compatibility and contrast adjustment options).
- **Distinction:** Digital web accessibility must not be conflated with on-site physical accessibility.

#### Contact Information vs. Dedicated Access Service
- **Published Contacts:** Email `dialogue@conflictorium.org` / `conflictorium@gmail.com`; Phone +91 (79) 25620747.
- **Distinction:** General inquiry contacts do not prove a dedicated accessibility service.
- **Status for `CONTACT_FOR_ACCESS_INFO`:** Strictly **`UNKNOWN`**.

### 4.4 Explicit Unknowns Summary
- Step-free entrance (`STEP_FREE_ENTRANCE`): **`UNKNOWN`**.
- Internal elevator (`INTERNAL_ELEVATOR`): **`UNKNOWN`**.
- Accessible restroom (`STEP_FREE_RESTROOM`): **`UNKNOWN`**.
- Seating available throughout galleries (`SEATING_AVAILABLE`): **`UNKNOWN`**.
- Service animal policy (`SERVICE_ANIMAL_POLICY`): **`UNKNOWN`**.
- Companion entry policy (`COMPANION_ENTRY_POLICY`): **`UNKNOWN`**.
- Dedicated access contact (`CONTACT_FOR_ACCESS_INFO`): **`UNKNOWN`**.

---

## 5. Summary Matrix of Proposed Evidence

| Candidate Venue | Scope | Reservation Required | Step-Free Entrance | Internal Elevator | Seating | Service Animals | Dedicated Access Contact |
|---|---|---|---|---|---|---|---|
| **Calico Museum of Textiles** | Venue | **Yes** (Opens 90d ahead; cap 20) | `UNKNOWN` (Policy unoffered) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` (General only) |
| **Calico: Haveli Tour** | Experience | **Yes** (Morning slot; cap 20) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Calico: Chauk Tour** | Experience | **Yes** (Afternoon slot; cap 20) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Kasturbhai Lalbhai Museum** | Venue | **Yes** (Phone/Email booking) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` (General only) |
| **Kasturbhai Lalbhai Museum** | Experience | **Yes** (4 tours daily; cap ~12) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` |
| **Conflictorium (Ahmedabad)** | Venue | **No** (Free walk-in) | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` (General only) |

---

## 6. Pre-Integration Checklist for Stage B

Before importing any claims into runtime fixtures or candidate resolvers:
1. **Direct Primary Venue Inquiries**: Conduct standardized email and phone communications to resolve explicit unknowns (accessible restrooms, ramp availability, seating, assistance animal policies).
2. **Qloo Identity Review**: Execute authorized manual lookup script (`python -m app.qloo.ahmedabad_lookup`) from the backend directory and review results with the developer.
3. **Schema Vocabulary Alignment**: Address schema gaps (such as general wheelchair accessibility and child admission age) via claim details rather than schema mutation.
