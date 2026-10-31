# AccessAtlas — System Architecture

**Status:** Planned architecture; implementation to be verified incrementally.

## 1. Architectural objective

Build a maintainable agentic application that combines Qloo-grounded cultural discovery, independently sourced venue evidence and deterministic participation suitability evaluation.

The architecture must make each component independently understandable and testable.

## 2. Technology decisions

| Layer | Technology |
|---|---|
| Frontend | Next.js and TypeScript |
| Backend | Python and FastAPI |
| Agent orchestration | LangGraph Python |
| External cultural intelligence | Qloo API |
| Python schemas | Pydantic |
| Backend testing | Pytest |
| Frontend testing | Vitest and Playwright when introduced |
| Persistence | PostgreSQL, introduced when required |

The exact hosting providers, database schema, LLM provider and pilot city are not yet finalized.

## 3. Planned high-level flow

```text
Visitor
   |
   v
Next.js frontend
   |
   v
FastAPI backend
   |
   v
Input validation
   |
   v
LangGraph agent
   |
   +----> Qloo integration
   |          |
   |          v
   |     Cultural affinities
   |
   +----> Experience discovery
   |          |
   |          v
   |     Actual experience candidates
   |
   +----> Venue evidence
   |          |
   |          v
   |     Source-backed practical information
   |
   +----> Possibility Engine
   |          |
   |          v
   |     Deterministic requirement evaluation
   |
   v
Participation planning
   |
   v
Validated API response
   |
   v
Frontend result and visit plan
```

This diagram represents intended responsibilities, not completed integrations.

## 4. Frontend responsibilities

The Next.js application is responsible for:

- Collecting explicit visitor inputs.
- Presenting discovery results.
- Showing suitability states and evidence.
- Distinguishing unknown information from verified information.
- Presenting visit plans and relevant next actions.
- Handling loading, empty and error states.
- Providing accessible interactions.

The frontend must not contain privileged Qloo or LLM credentials.

It must not independently determine venue suitability.

## 5. Backend responsibilities

FastAPI provides the application boundary.

Responsibilities include:

- Request validation.
- Response validation.
- Agent invocation.
- Integration configuration.
- Safe error handling.
- Authentication or abuse protection where required.
- Server-side access to privileged providers.
- Logging that excludes credentials and unnecessary personal information.

API endpoints will be defined through implementation issues.

Do not assume endpoint paths exist before they are implemented and tested.

## 6. Agent responsibilities

LangGraph coordinates the discovery and participation planning workflow.

The core orchestration workflow is implemented in `backend/app/agent` (`AccessAtlasAgent`, `create_agent_graph`, `WorkflowNodes`, `CandidateResolver`, `build_candidate_participation_plan`). Complete documentation of graph topology, trust boundaries, and grounded planning contracts is provided in `docs/AGENT_ORCHESTRATION.md`.

Node sequence:
1. `discover`: Qloo cultural discovery bounded to `max_candidates`.
2. `resolve`: Explicit mapping of cultural entities to venue identifiers via `CandidateResolver`.
3. `evaluate`: Deterministic evaluation with the Possibility Engine for resolved entities.
4. `plan`: Grounded participation plan generation with confirmation questions and next actions.

The agent preserves all deterministic hard-requirement outcomes and never infers sensitive user requirements from cultural signals. Real pilot-city entity mapping and venue data collection remain future work.

## 7. Qloo integration boundary

Qloo provides cultural intelligence and cross-domain affinity information.

The integration layer must:

- Use verified event-authorized access.
- Keep credentials server-side.
- Validate requests and responses.
- Normalize provider-specific data into internal models.
- Handle authentication errors, timeouts and rate limits.
- Distinguish empty results from malformed requests where possible.
- Preserve sufficient provenance for debugging without exposing private data.

The official Qloo Hackathon Kit may be used for experimentation and workflow discovery.

The initial production approach is a direct server-side HTTP integration, subject to verification against current event documentation and observed API responses.

MCP is optional and must only be introduced through a scoped architectural decision.

## 8. Experience discovery boundary

Cultural affinity does not prove that a corresponding local event or venue exists.

Experience discovery must connect cultural signals to real-world options using authorized sources.

Every actual experience candidate should have sufficient identifying information to distinguish it from similarly named venues or events.

Do not fabricate a venue or event to complete a recommendation list.

## 9. Venue evidence boundary

Venue evidence must be independent of Qloo cultural affinity data.

The evidence model should support, where relevant:

- The factual claim.
- Source reference.
- Source type.
- Verification or retrieval information.
- Applicable scope.
- Whether the information is sufficient for the requirement being evaluated.

The evidence foundation schema is implemented in `backend/app/evidence` (`EvidenceRecord`, `AttributeEvidence`, `EvidenceClaim`, `EvidenceSource`, `VenueIdentity`, `ExperienceIdentity`, and `InMemoryVenueEvidenceRepository`). Detailed specification and vocabulary are documented in `docs/EVIDENCE.md`.

Real venue data collection is not operational; synthetic fixtures are used for development and testing. Do not assume that an official venue webpage guarantees every detail is current.

## 10. Possibility Engine

The deterministic Possibility Engine is implemented in `backend/app/possibility` (`PossibilityEngine`, `ParticipationRequirement`, `PossibilityAssessment`, `RequirementAssessment`). Detailed specification, vocabulary, and precedence rules are documented in `docs/POSSIBILITY_ENGINE.md`.

Inputs:

- Explicit user requirements (`ParticipationRequirement`).
- Independently sourced venue and experience evidence (`EvidenceRecord`).
- Reproducible timezone-aware evaluation timestamp (`evaluation_time`).

Outputs:

- Requirement-level evaluations (`RequirementAssessment`).
- Preserved supporting or conflicting evidence references.
- Missing information and explicit confirmation needs.
- Identified conflicts.
- An overall suitability outcome (`PossibilityOutcome`).

Primary states:

1. `VERIFIED_FIT`: All mandatory requirements are supported by verified evidence.
2. `NEEDS_CONFIRMATION`: Information is missing, conflicting, expired, out of scope, or non-machine-evaluable (or no mandatory requirements were provided).
3. `REQUIREMENT_CONFLICT`: At least one mandatory requirement is contradicted by applicable evidence.

The language model may explain the result in downstream planning but must not silently modify or override deterministic evaluations.

## 11. Participation planning

Planning uses cultural discovery results and deterministic suitability evaluations to propose structured, actionable next steps for each candidate (`CandidateParticipationPlan`).

A plan includes:

- Cultural discovery candidate reference (`QlooEntity`).
- Explicit mapping and resolution status (`RESOLVED`, `UNMAPPED`, `MISSING_EVIDENCE`).
- Possibility Engine assessment, only when legitimately evaluated.
- Supported findings verified by independent evidence.
- Unresolved evidence gaps (missing, expired, or conflicting attributes).
- Specific confirmation questions grounded directly in actual evidence gaps.
- Grounded next actions distinguishing verified fits from items needing confirmation.
- Preserved source provenance references.

The plan strictly distinguishes culturally relevant candidates from verified practical fits and never claims that a venue was contacted or a booking was checked when no such integration completed.

## 12. Data boundaries

### User-provided data

Collect only what is necessary for the requested task.

Sensitive participation information must not be inferred from cultural signals.

### Qloo data

Use for cultural discovery within applicable provider conditions.

Do not treat it as venue suitability evidence.

### Venue data

Use independently sourced information with provenance.

### Agent-generated text

Treat as explanatory output requiring grounding in structured tool results.

### Persisted data

Introduce persistence only through a scoped issue with defined retention, access and deletion behaviour.

## 13. Error handling

Each integration must distinguish relevant failure categories.

Examples include:

- Invalid user input.
- Unresolved or ambiguous cultural interest.
- Qloo authentication failure.
- Qloo rate limiting.
- Qloo timeout.
- No relevant cultural result.
- Missing venue evidence.
- External provider failure.
- Agent execution failure.

Do not silently replace a failed live API response with fabricated recommendations.

Fallback behaviour must be explicit and visible.

## 14. Observability

The application should eventually support:

- Safe request identifiers.
- Agent execution traces.
- Tool invocation outcomes.
- Error categories.
- Relevant execution timing.
- Testable decision paths.

Never log API keys, full authentication headers or unnecessary sensitive user information.

Observability tooling will be selected through a separate implementation task.

## 15. Testing architecture

### Unit tests

Test deterministic services, validation and transformations without external network calls.

### Integration tests

Verify component boundaries using controlled fixtures and mocked providers.

### Live integration checks

Use the developer's authorized credentials to verify real provider behaviour without committing private responses.

### End-to-end tests

Verify the user journey from frontend input to an actionable result.

### Evaluation tests

Compare the Qloo-grounded workflow against a baseline under controlled scenarios.

A mocked test must never be reported as proof of live Qloo connectivity.

## 16. Deployment principles

- Frontend and backend must be publicly accessible for judging.
- Secrets must be configured through protected hosting settings.
- Development-only functionality must not be exposed unnecessarily.
- The application must provide reproducible setup instructions.
- Deployment must be tested independently of local development.
- The public demo must function as described in the submission.

The exact deployment configuration is not yet finalized.

## 17. Architecture change policy

Changes to major components, provider choices, persistence strategy or integration approach require:

1. A documented reason.
2. An explicit decision.
3. Consideration of trade-offs.
4. Updated documentation.
5. Appropriate tests.

Do not change architecture merely because an agent prefers a different library.