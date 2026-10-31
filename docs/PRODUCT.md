# AccessAtlas — Product Specification & Boundaries

> **Core Positioning**:  
> *"AccessAtlas turns vague cultural curiosity into unexpected discoveries—and practical plans you can trust."*  
> **Core Principle**:  
> *"Qloo discovers the culturally possible. AccessAtlas investigates the practically possible."*

---

## 1. Product Overview

**AccessAtlas** helps people find cultural experiences that match their expressed interests, practical needs, energy preferences, and companions—not just places that are technically nearby.

Developed for the Qloo Agentic Hackathon, AccessAtlas combines:
1. **Qloo-Powered Cultural Discovery**: Surfaces resonant cultural experiences using cross-domain taste affinity rather than mere geographic proximity.
2. **Independently Sourced Venue Evidence**: Preserves verified operational guidelines, physical threshold facts, and timestamped source provenance.
3. **Deterministic Possibility Engine**: Evaluates explicit visitor requirements against evidence, strictly distinguishing verified fit, unconfirmed details, and requirement conflicts without synthetic confidence scores.
4. **Agentic Orchestration & Participation Planning**: Coordinates discovery, identity resolution, evaluation, and structured planning into actionable Visit Plans.
5. **Dignified Visitor Experience**: Avoids medical profiling or clinical questionnaires; practical preferences are treated as ordinary outing parameters.

---

## 2. Problem Statement

Mainstream search and navigation platforms fail cultural outing planning in two critical ways:
- **Nearby ≠ Culturally Resonant**: Standard search engines return places that are geographically close or optimized for commercial keywords, missing deep cultural affinities and unexpected connections across artistic disciplines.
- **Interesting ≠ Workable**: Mainstream recommendation tools stop at *"You might like this place."* They leave visitors—particularly those needing step-free access, seating, or advance planning—to guess whether they can actually participate.
- **Binary & Misleading Badges**: Generic "Accessible" tags often conceal critical barriers (e.g., historic multi-level haveli stairs, unrecorded rest seating, mandatory standing guided tours).
- **The Uncertainty Barrier**: The fear of unexpected physical, operational, or sensory friction leads many people to abandon cultural outings or return repeatedly to the same familiar spaces.

AccessAtlas bridges this divide by turning **unconstrained cultural curiosity** into **verifiable, actionable outing plans**.

---

## 3. Target User Personas & Visitor Outings

| Persona / Context | Profile & Curiosity | Practical Outing Consideration | AccessAtlas Resolution |
| :--- | :--- | :--- | :--- |
| **Priya** (Craft & Textile Enthusiast) | Curious about block printing, handloom weaving, and domestic craft heritage. | Requires step-free access and seating due to joint pain. Cannot manage long unseated tours. | Identifies cultural heritage spaces (e.g. Calico), transparently highlights historic stair barriers, and generates precise questions to ask the venue. |
| **Marcus & Elder Parent** (Intergenerational Travelers) | Interested in historic architecture, stepwells, and quiet courtyards. | Visiting with an aging parent who needs frequent rest seating and level entry. | Evaluates documented seating availability and surfaces visit advisories before travelling. |
| **Aarav** (Cross-Domain Explorer) | Loves modernist architecture and modernist art, looking for unexpected local resonances. | Flexible physical needs, but requires advance booking clarity and photography policy details. | Surfaces culturally connected venues via Qloo affinity and provides clear booking/registration instructions. |

---

## 4. Current Implementation Status vs. Planned Roadmap

To avoid ambiguity or false claims, all product capabilities are tracked in the lifecycle matrix below:

| Feature / Capability | Milestone | Current Status | Supporting Component |
| :--- | :--- | :--- | :--- |
| **Repository Governance & Agent Contract** | Phase 0 | **Implemented** | `AGENTS.md`, `SECURITY.md`, `docs/UX_VISION.md`. |
| **Qloo Cultural Discovery Integration** | Phase 1 | **Implemented** | `QlooClient.search_entities`, FastAPI `/api/v1/discover`. |
| **Explicit Candidate Resolution & Mapping** | Phase 1 | **Implemented** | `CandidateResolver`, `app.evidence.pilot_ahmedabad`. |
| **Independent Venue Evidence Repository** | Phase 1 | **Implemented** | Sourced evidence records with timestamped provenance. |
| **Deterministic Possibility Engine** | Phase 1 | **Implemented** | Strict 3-state evaluation (`VERIFIED_FIT`, `NEEDS_CONFIRMATION`, `REQUIREMENT_CONFLICT`). |
| **Actionable Participation Planning** | Phase 1 | **Implemented** | Structured Visit Plan, confirmation QuestionKit, copyable output. |
| **Ahmedabad Pilot Launch Destination** | Phase 1 | **Implemented** | 3 human-reviewed pilot spaces with verified documentation. |
| **Cross-Domain Taste Expansion (Cultural Compass)** | Phase 2 | *Planned (Not Implemented)* | Multi-hop taste graph using `QlooClient.get_insights`. |
| **Taste Memory & Saved Visit Plans** | Phase 3 | *Planned (Not Implemented)* | User profile and persistent plan storage. |
| **Multi-City Evidence Expansion** | Phase 3 | *Planned (Not Implemented)* | Evidence catalogues for additional cultural capitals. |

---

## 5. Scope Boundaries & Explicit Non-Goals

To maintain product integrity and visitor trust, the following areas are strictly **out of scope**:

- **Emergency & Medical Transport**: AccessAtlas is not an emergency response, patient transport, or healthcare routing platform.
- **Medical & Diagnostic Profiling**: AccessAtlas never asks for, infers, or stores personal medical diagnoses, disabilities, or protected characteristics.
- **Legal Compliance Certification**: AccessAtlas evidence does not replace official architectural compliance audits or government accessibility certification.
- **Live Ticket Transactions & POS Booking**: AccessAtlas provides verified booking guidelines, registration links, and contact advisories; it does not process financial payments or hold live ticket inventory.
- **Synthetic Suitability Scores**: AccessAtlas never fabricates percentage scores (e.g., "94% accessible") or guesses unrecorded access facts. Unrecorded attributes remain strictly unknown.

