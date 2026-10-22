# AccessAtlas — UX Vision & Visitor Journey Specification

> **Core Product Principle**:  
> *"Qloo discovers the culturally possible. AccessAtlas investigates the practically possible."*

---

## 1. Executive Summary & Positioning

AccessAtlas is an evidence-aware cultural discovery agent. It exists to bridge a fundamental divide in cultural travel and participation: **interesting does not automatically mean workable**, and **technically nearby does not mean culturally resonant**.

### The Central Question
AccessAtlas is designed to answer one question for every visitor:
> *"What cultural experiences might I love that I would never have thought to search for—and what would it actually take for me to experience them?"*

### Primary Product Line
> **"AccessAtlas turns vague cultural curiosity into unexpected discoveries—and practical plans you can trust."**

### Homepage Headline
> **"What if your next favourite place is somewhere you never thought to look?"**

### Supporting Message
*"Discover cultural experiences connected to what you love, with practical details that help you decide what works for your visit."*

---

## 2. Why AccessAtlas? (Beyond Ordinary Search)

| Ordinary Search & Maps | Generic Travel Aggregators | AccessAtlas |
| :--- | :--- | :--- |
| Returns places that are **geographically close** or high in keyword density. | Ranks venues by **commercial popularity** or paid placement. | Surfaces experiences based on **cultural affinity and unexpected taste connections** via Qloo. |
| Uses crude binary tags (*"Wheelchair accessible: Yes/No"*). | Emits generic advice (*"Call ahead to confirm"*). | Evaluates explicit visitor requirements against **source-backed, verifiable factual evidence**. |
| Assumes total certainty or fabricates suitability. | Leaves visitors to piece together policies across multiple blogs. | Explicitly distinguishes **verified facts**, **unresolved gaps**, and **requirement conflicts**. |
| Ends at: *"Here is where you might go."* | Ends at: *"Book a ticket."* | Delivers: **An actionable Visit Plan** with confirmation questions and operational advisories. |

---

## 3. Target Audience, Problem, & Value Proposition

### Primary Audience
1. **Curious Explorers with Specific Practical Needs**: Culture lovers who require step-free access, seating, or advance planning, and cannot risk travelling to a venue only to be turned away at the door.
2. **Thoughtful Companions & Planners**: Individuals planning an outing for friends, elders, or children with varied physical energy, sensory preferences, or mobility requirements.
3. **Cross-Domain Culture Seekers**: Visitors who know what genres, media, or crafts they love (e.g., miniature painting, modernist architecture, handloom textiles) but don't know the local cultural landscape of the city they are exploring.

### The Problem
Traditional discovery treats visitors as frictionless consumers. Either:
1. They search for places that match their accessibility needs, ending up with generic, institutional, or uninspiring spaces that lack cultural resonance; or
2. They find inspiring cultural spaces, only to discover on arrival that multi-level historic steps, unrecorded policies, or mandatory unseated tours prevent them from participating.

### The Value Proposition
AccessAtlas connects **unconstrained cultural curiosity** with **rigorous, deterministic participation feasibility**. Visitors can dream broadly without fear of unexpected physical, operational, or sensory friction.

### Desired Visitor Outcome
A visitor leaves AccessAtlas with:
- Cultural inspiration they would not have arrived at alone.
- Clarity on what is documented and verified about the venue.
- An honest understanding of what remains unrecorded.
- A **ready-to-use Visit Plan** equipped with specific questions to ask the venue and practical next steps.

---

## 4. Three First-Class Entry Paths

AccessAtlas must never force visitors into a rigid questionnaire or clinical intake form. The application provides three distinct, dignified entry paths:

```
               ┌────────────────────────────────────────────────────────┐
               │         "What are you curious about today?"            │
               └────────────────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         ▼                                 ▼                                ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Path A:         │             │  Path B:         │             │  Path C:         │
│  "Discover my    │             │  "I know what    │             │  "Surprise me"   │
│   direction"     │             │   I want"        │             │                  │
└──────────────────┘             └──────────────────┘             └──────────────────┘
│ Exploratory taste│             │ Direct text input│             │ Provocative      │
│ sparks & curated │             │ & specific search│             │ cross-domain     │
│ thematic chips   │             │ topics (1st class│             │ cultural prompt  │
│ (e.g. Textiles,  │             │ citizen)         │             │ (e.g. Haveli     │
│ Craft, Haveli)   │             │                  │             │ courtyards &     │
│                  │             │                  │             │ sound archives)  │
└──────────────────┘             └──────────────────┘             └──────────────────┘
```

### Path A: "Discover my direction" (Exploratory / Taste-Led)
- **Who it is for**: Visitors who have a general mood or curiosity but no specific destination in mind.
- **How it works**: Curated thematic prompts and spark tiles (e.g., *"Textile heritage & block printing"*, *"Modernist architecture & brick vaults"*, *"Quiet haveli courtyards"*).
- **Visitor Experience**: Clicking an editorial spark immediately populates their cultural direction and invites them to customize it.

### Path B: "I know what I want" (Manual Entry — A First-Class Citizen)
- **Who it is for**: Visitors with clear, specific cultural interests or references (e.g., *"Woodblock carving"*, *"Sidi Saiyyed stone jalis"*, *"Constructivist sculpture"*).
- **How it works**: A prominent, accessible search input at the top of the discovery journey.
- **Visitor Experience**: Free-form text input with instant chip creation, keyboard support (Enter to add, Backspace to delete), and clear bounds (1 to 5 interests, up to 100 characters each).

### Path C: "Surprise me" (Provocative Cultural Serendipity)
- **Who it is for**: Visitors seeking unexpected cultural connections across domains.
- **How it works**: Generates unexpected pairings grounded in cross-domain cultural relationships (e.g., pairing geometric textile weaving with Brutalist architecture).
- **Visitor Experience**: One-click serendipity trigger that loads a culturally cohesive prompt without requiring the visitor to invent one.

> **Key Rule**: Cultural Compass taste expansion is **strictly optional**. Manual interest entry must never be treated as secondary or inferior to automated suggestion.

---

## 5. The End-to-End Visitor Journey

The discovery experience follows a progressive, dignified 4-stage narrative:

```
Stage 1: Curiosity ──> Stage 2: Your Visit ──> Stage 3: Discoveries ──> Stage 4: Visit Plan
(What you love)       (Practical needs)       (Decision cards)          (Actionable plan)
```

### Stage 1: Your Curiosity (Unconstrained Expression)
- **Prompt**: *"What cultural experiences spark your curiosity?"*
- **Action**: Visitor inputs or selects cultural topics through any of the three entry paths.
- **Privacy Boundary**: No personal identity, medical conditions, or diagnostic labels are solicited. Cultural taste remains purely about cultural curiosity.

### Stage 2: Your Visit (Practical Preferences)
- **Prompt**: *"What matters for this outing?"*
- **Action**: Visitor configures practical requirements using clean tri-state controls:
  1. **Not specified** (default — unconstrained)
  2. **Nice to have** (optional preference — evaluated if evidence exists)
  3. **Essential** (mandatory hard requirement — determines fit vs conflict)
- **Supported Attributes**:
  - Step-free entrance
  - Wheelchair accessibility
  - Rest seating availability
  - Accessible restroom
  - Quiet / low sensory density hours
  - Advance booking or registration requirement
- **Dignity Rule**: The interface never asks *"Why do you need this?"* or *"What is your disability?"*. Preferences are treated simply as visit parameters.

### Stage 3: Discoveries (Decision Cards)
- **Headline**: *"Cultural Discoveries in Ahmedabad"*
- **Presentation**: Results are displayed as informative **Decision Cards**, not an undifferentiated list.
- **Honest Differentiation**:
  - **Culturally Discovered & Evidence-Reviewed**: Displays verified cultural context from Qloo alongside the deterministic Possibility Engine badge (`Verified fit`, `Needs confirmation`, `Requirement conflict`).
  - **Culturally Discovered & Unreviewed**: Displays what Qloo surfaced culturally with the honest badge `"Visit information not yet reviewed"`. The system never fabricates accessibility facts when documentation has not been audited.
- **Primary Card Action**: *"View visit plan"* (expands into the signature output).

### Stage 4: The Visit Plan (Signature Output & Practical Payoff)
The Visit Plan transforms discovery into confidence:
1. **Cultural Direction**: Summary of what cultural threads sparked this match.
2. **Why Explore This Space**: Contextual explanation grounded in Qloo cultural discovery.
3. **What We Know (Documented Facts)**: Bulleted list of attributes supported by verified publications, complete with source links and verification dates.
4. **What Needs Checking (Transparent Unknowns)**: Honest itemization of unrecorded details or operational ambiguities.
5. **Operational Advisories**: Documented policies (e.g., photography restrictions, mandatory guided tours, shoe-removal rules).
6. **Confirmation Question Kit**: Pre-formulated, polite questions the visitor can ask the venue by email or phone.
7. **One-Click Actions**: "Copy questions" and "Copy full visit plan" for easy sharing with companions.

---

## 6. Cultural Relevance vs. Participation Evidence

To maintain scientific integrity and visitor trust, AccessAtlas enforces an absolute conceptual and architectural separation:

```
┌───────────────────────────────────────────────┐
│              QLOO CULTURAL AI                 │
│  - Cultural affinity & taste mapping          │
│  - Cross-domain connections (books, art, etc.)│
│  - Aggregate cultural interest signals        │
│  * NEVER indicates physical accessibility     │
│  * NEVER indicates operational status         │
└───────────────────────────────────────┬───────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────┐
│             ACCESSATLAS PIPELINE              │
│  Candidate resolution to verified venue ID    │
└───────────────────────────────────────┬───────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────┐
│         INDEPENDENT EVIDENCE REPOSITORY       │
│  - Official venue guidelines & publications   │
│  - Physical layout & threshold facts          │
│  - Timestamped source provenance              │
└───────────────────────────────────────┬───────┘
                                        │
                                        ▼
┌───────────────────────────────────────────────┐
│         DETERMINISTIC POSSIBILITY ENGINE      │
│  - Strict 3-state evaluation                  │
│  - Zero synthetic percentage scores           │
│  - Hard requirement conflict detection       │
└───────────────────────────────────────────────┘
```

1. **Qloo is the Cultural Compass**: Qloo explains *why an experience is culturally resonant*. It never proves whether a ramp exists, whether the elevator works, or whether a ticket is required.
2. **Evidence is the Anchor**: Independent venue documentation proves *what is physically and operationally known*. Silence in published records remains strictly **unknown**.
3. **Deterministic Evaluation**: The Possibility Engine never lets an LLM guess or smooth over a missing ramp. If an essential requirement lacks proof, the status is honestly flagged as `Needs confirmation`.

---

## 7. Pilot Destination: Ahmedabad as First Chapter

- **Current Status**: AccessAtlas is currently launched in **Ahmedabad, Gujarat, India** as its first evidence-reviewed pilot destination.
- **Visitor-Facing Copy**:
  > *"Currently exploring Ahmedabad · More cultural capitals to come."*
- **Brand Identity**: The product is **AccessAtlas**, an international cultural outing planner. Ahmedabad is its initial proving ground, selected for its rich UNESCO World Heritage architectural traditions, world-renowned textile heritage (e.g. Calico Museum), and vibrant civil dialogue institutions (e.g. Conflictorium).
- **Integrity Rule**: Never claim or imply that unreviewed cities (e.g., London, Tokyo, New York, Mumbai) are currently operational in the evidence engine.

---

## 8. Interface Content-Writing Rules

Every word in the AccessAtlas interface must respect the visitor's intelligence, dignity, and time.

### Voice & Tone
- **Curious & Welcoming**: Warm, cultured, inviting—like an editorial cultural travel publication.
- **Grounded & Accountable**: Factual, transparent, never hyperbolic.
- **Dignified & Unintrusive**: Treats practical needs as ordinary aspects of an outing, not clinical deficits.

### Terminology Guide: What to Use vs. What to Avoid

| Category | Do Use | Do NOT Use | Reason |
| :--- | :--- | :--- | :--- |
| **Product Purpose** | Cultural discovery, participation planning, outing companion | Accessibility directory, venue database, map finder, hackathon project | Avoids sounding like a static telephone book or developer testbed. |
| **Practical Needs** | Practical requirements, visit preferences, outing needs | Disabilities, handicaps, medical conditions, patient intake | We never solicit personal medical diagnoses. |
| **Suitability Status** | Verified fit, Needs confirmation, Requirement conflict | 100% accessible, Certified compliant, AI confidence score | Accessibility is multi-dimensional; percentage scores are misleading. |
| **Missing Evidence** | Unrecorded in published records, Details to check | Accessible (when unproven), Inaccessible (when merely unrecorded) | Silence in records must remain strictly unknown, not guessed. |
| **System Architecture** | Independent venue records, verified publications | Possibility Engine, LangGraph, Pydantic, backend nodes | Visitors care about practical clarity, not internal framework names. |
| **Alternatives** | Another cultural option to investigate | Fully accessible alternative, Guaranteed substitute | Never promise perfection for an alternative space. |

---

## 9. Current Implementation Capabilities vs. Planned Evolution

To maintain engineering integrity, UI designs and visitor flows must clearly distinguish what is currently powered by the backend from what is planned for future milestones:

| Capability | Current Status | Supporting API / Component | Notes |
| :--- | :--- | :--- | :--- |
| **Cultural Interest Querying** | **Implemented** | `POST /api/v1/discover` (`cultural_interests: 1-5`) | Handled via Qloo entity search (`GET /search`). |
| **Tri-State Preference Evaluation** | **Implemented** | `POST /api/v1/discover` (`requirements: [...]`) | Evaluated deterministically via Possibility Engine. |
| **Ahmedabad Pilot Venue Evidence** | **Implemented** | `app.evidence.pilot_ahmedabad` | 3 pilot spaces with human-reviewed 1-to-1 mappings. |
| **Deterministic Visit Plans** | **Implemented** | `CandidateParticipationPlan` model | Grounded findings, gaps, confirmation questions, sources. |
| **Unmapped Candidate Presentation** | **Implemented** | `resolution_status: "unmapped"` | Renders cultural candidates without fabricated claims. |
| **Sanitized Error Handling** | **Implemented** | `DiscoverResponse` & FastAPI HTTP exceptions | HTTP 502/429/504 mapped honestly without leaking keys. |
| **Cross-Domain Taste Expansion** | *Planned (Phase 2)* | `QlooClient.get_insights` exists; agent node pending | Future Cultural Compass multi-hop affinity graph. |
| **Taste Memory & Saved Plans** | *Planned (Phase 3)* | Requires persistent database layer | Local storage or account persistence not yet enabled. |
| **Multi-City Discovery** | *Planned (Phase 3)* | Currently restricted to `city: "Ahmedabad"` | Additional city evidence catalogues required. |
| **Live Ticketing & Direct Booking** | *Out of Scope* | N/A | AccessAtlas provides contact details and guidelines, not live POS transactions. |

---

## 10. Summary Checklist for UI Changes

Before introducing or modifying any frontend component:
- [ ] Does this headline speak to curiosity and cultural travel rather than database search?
- [ ] Can a visitor enter their own custom cultural interest directly without being forced into a quiz?
- [ ] Are practical requirements free of medical or diagnostic phrasing?
- [ ] Is the Possibility Engine outcome badge clearly distinct from the Qloo cultural tags?
- [ ] Does the Visit Plan provide actionable, copyable next steps rather than a static report?
- [ ] Is all technical jargon (LangGraph, Pydantic, Possibility Engine) kept out of visitor-facing copy?
- [ ] Is Ahmedabad accurately described as the launch pilot destination?
