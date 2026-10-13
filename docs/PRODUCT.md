# AccessAtlas — Product Specification & Boundaries

> **Status Notice**: This document outlines the product scope, target personas, and functional boundaries of **AccessAtlas**. AccessAtlas is currently in **Phase 0 (Repository Governance & Baseline)**. No application runtime or end-user features are currently implemented.

---

## 1. Product Overview

**AccessAtlas** is a geospatial accessibility intelligence platform designed to map, assess, and communicate granular accessibility attributes for physical venues, urban pathways, and public infrastructure.

Mainstream navigation platforms typically classify accessibility using crude binary indicators (e.g., "Wheelchair accessible: Yes/No"). In reality, accessibility is multi-dimensional. A restaurant labeled "accessible" may have an automated door and level dining area, but an inaccessible 2-inch threshold or a restroom stall that cannot accommodate a motorized wheelchair.

AccessAtlas solves this information gap by collecting, structuring, and visualizing high-fidelity accessibility attributes, enabling dignified, predictable, and barrier-free navigation.

---

## 2. Problem Statement

Over 1.3 billion people globally live with significant disabilities. Mobility device users, individuals with sensory sensitivities, parents with strollers, and seniors routinely encounter unexpected barriers in the built environment:
- **Binary & Misleading Information**: "Accessible" badges often omit critical friction points (e.g., heavy manual push doors, steep ramp gradients, single steps).
- **Stale Operational State**: Broken elevators, out-of-order accessible restrooms, or construction barriers are rarely reflected in real time.
- **Fragmented Data**: Accessibility notes are buried in informal reviews or blogs rather than structured geospatial datasets.
- **Cognitive & Sensory Gaps**: Lack of data regarding ambient noise levels, high-contrast flashing lights, or crowded hours for neurodivergent visitors.

---

## 3. Target User Personas

| Persona | Profile & Needs | Primary Pain Point |
| :--- | :--- | :--- |
| **Maya** (Manual Wheelchair User) | Needs exact measurements: door width (≥32 in), entrance threshold (≤0.5 in), and ramp incline. | Arriving at a venue only to find a single 4-inch step with no ramp. |
| **Carlos** (Motorized Wheelchair User) | Needs wide turning radiuses, heavy-duty ramp clearance, and reliable elevator status. | Getting trapped when an elevator is out of order with no prior warning. |
| **Liam** (Neurodivergent / Sensory Sensitive) | Seeks sensory profiles (acoustic levels, fluorescent lighting, peak crowd density). | Sensory overload in poorly acoustically-designed public spaces. |
| **Elena & Child** (Parent with Stroller) | Navigating transit stations and shopping centers requiring step-free paths. | Inability to easily filter step-free routes on standard transit maps. |
| **Jordan** (Certified Venue Auditor / Contributor) | Community volunteer documenting venue accessibility with photos and checklists. | Lack of a structured, standardized auditing schema to contribute findings. |

---

## 4. Current Implementation Status vs. Planned Roadmap

To avoid ambiguity or false claims, all product capabilities are tracked in the lifecycle matrix below:

| Feature / Capability | Target Milestone | Current Status | Notes |
| :--- | :--- | :--- | :--- |
| **Repository Governance & Agent Contract** | Phase 0 | **Implemented** | `AGENTS.md`, `SECURITY.md`, `docs/`, `.gitignore` active. |
| **CI Hygiene & Baseline Automation** | Phase 0 | **Implemented** | Automated secret and hygiene scanning in GitHub Actions. |
| **Standardized Accessibility Data Schema** | Phase 1 | **Planned (Not Implemented)** | Schema definition for venue attributes and thresholds underway. |
| **Interactive Geospatial Map Explorer** | Phase 1 | **Planned (Not Implemented)** | Web-based map interface for browsing venue accessibility. |
| **Venue Accessibility Profile View** | Phase 1 | **Planned (Not Implemented)** | Detailed view of door width, restrooms, elevators, and steps. |
| **Crowd-Sourced Contribution & Reviews** | Phase 2 | **Planned (Not Implemented)** | Community submissions with photo evidence and vote verification. |
| **Auditor Verification & Trust Scoring** | Phase 2 | **Planned (Not Implemented)** | Verification badges for certified accessibility auditors. |
| **Step-Free Route & Pathfinding Engine** | Phase 3 | **Planned (Not Implemented)** | Sidewalk routing engine with slope and curb-cut awareness. |
| **Sensory & Neurodivergent Venue Profiles** | Phase 3 | **Planned (Not Implemented)** | Ambient noise, lighting ratings, and quiet hours schedule. |

---

## 5. Scope Boundaries & Explicit Non-Goals

To maintain product focus and integrity, the following areas are strictly **out of scope**:

- **Emergency Dispatch**: AccessAtlas is not an emergency response or medical transport routing platform.
- **Legal Certification**: AccessAtlas crowd-sourced data does not replace legally binding architectural compliance audits (e.g., ADA title III compliance certification).
- **Proprietary Data Lock-in**: AccessAtlas is committed to open standards (e.g., compatibility with OpenStreetMap accessibility tags and GeoJSON standards).
- **Automated Vehicle Navigation**: AccessAtlas focuses on pedestrian, mobility-device, and venue-level navigation, not vehicular traffic routing.
