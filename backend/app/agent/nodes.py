"""LangGraph workflow node operations for AccessAtlas.

Coordinates cultural discovery, explicit candidate resolution, deterministic
Possibility Engine evaluation, and participation planning with dependency injection.
"""

from typing import Any

from app.agent.models import (
    AgentState,
    CandidateParticipationPlan,
    CandidateResolutionStatus,
    ResolvedCandidate,
)
from app.agent.planning import build_candidate_participation_plan
from app.agent.resolution import CandidateResolver, resolve_candidate
from app.agent.threads import build_cultural_threads
from app.evidence.repository import VenueEvidenceRepository
from app.possibility.engine import PossibilityEngine
from app.qloo.client import QlooClient
from app.qloo.models import QlooError


class WorkflowNodes:
    """Encapsulates node handlers with injected dependencies for offline testability."""

    def __init__(
        self,
        qloo_client: QlooClient,
        resolver: CandidateResolver,
        evidence_repo: VenueEvidenceRepository,
        engine: PossibilityEngine,
    ) -> None:
        self.qloo_client = qloo_client
        self.resolver = resolver
        self.evidence_repo = evidence_repo
        self.engine = engine

    def discover_cultural_candidates(self, state: AgentState) -> dict[str, Any]:
        """Node: Discover cultural entities via Qloo search.

        Bounds candidate count and sanitizes any provider exceptions.
        """
        query = state.get("cultural_query", "").strip()
        max_candidates = state.get("max_candidates", 5)

        if not query:
            return {
                "discovered_entities": [],
                "discovery_error": "Cultural query was empty or invalid.",
            }

        try:
            search_res = self.qloo_client.search_entities(
                query=query,
                take=max_candidates,
            )
            # Bound explicitly to max_candidates
            entities = search_res.entities[:max_candidates]
            return {
                "discovered_entities": entities,
                "discovery_error": None,
            }
        except QlooError as exc:
            # Sanitize error message to avoid credential or raw dump disclosure
            return {
                "discovered_entities": [],
                "discovery_error": f"Qloo discovery unavailable: {type(exc).__name__}",
            }
        except Exception:
            return {
                "discovered_entities": [],
                "discovery_error": "Unexpected discovery error occurred.",
            }

    def resolve_candidates(self, state: AgentState) -> dict[str, Any]:
        """Node: Map discovered Qloo entities to evidence repository records."""
        entities = state.get("discovered_entities", [])
        resolved: list[ResolvedCandidate] = []

        for entity in entities:
            res = resolve_candidate(
                entity=entity,
                resolver=self.resolver,
                evidence_repo=self.evidence_repo,
            )
            resolved.append(res)

        return {"resolved_candidates": resolved}

    def evaluate_candidates(self, state: AgentState) -> dict[str, Any]:
        """Node: Evaluate resolved candidates with Possibility Engine."""
        candidates = state.get("resolved_candidates", [])
        requirements = state.get("requirements", [])
        evaluation_time = state.get("evaluation_time")

        updated_candidates: list[ResolvedCandidate] = []

        for c in candidates:
            if c.status == CandidateResolutionStatus.RESOLVED and c.evidence_record:
                assessment = self.engine.evaluate(
                    record=c.evidence_record,
                    requirements=requirements,
                    evaluation_time=evaluation_time,
                )
                updated_candidates.append(
                    ResolvedCandidate(
                        qloo_entity=c.qloo_entity,
                        status=c.status,
                        venue_id=c.venue_id,
                        experience_id=c.experience_id,
                        evidence_record=c.evidence_record,
                        possibility_assessment=assessment,
                        resolution_notes=c.resolution_notes,
                    )
                )
            else:
                updated_candidates.append(c)

        return {"resolved_candidates": updated_candidates}

    def build_participation_plans(self, state: AgentState) -> dict[str, Any]:
        """Node: Build structured, grounded participation plans for all candidates."""
        candidates = state.get("resolved_candidates", [])
        requirements = state.get("requirements", [])
        discovery_error = state.get("discovery_error")

        # Resolve expressed cultural interests
        raw_interests = state.get("cultural_interests")
        if not raw_interests:
            raw_query = state.get("cultural_query", "")
            raw_interests = [q.strip() for q in raw_query.split(",") if q.strip()]

        # Deterministically synthesize Cultural Threads
        threads = build_cultural_threads(raw_interests, candidates)
        threads_by_entity_id = {t.candidate.entity_id: t for t in threads}

        plans: list[CandidateParticipationPlan] = []
        for c in candidates:
            plan = build_candidate_participation_plan(
                c,
                requirements,
                cultural_thread=threads_by_entity_id.get(c.qloo_entity.entity_id),
            )
            plans.append(plan)

        # Formulate deterministic workflow summary
        if discovery_error:
            summary = f"Cultural discovery failed: {discovery_error}"
        elif not plans:
            summary = (
                f"No cultural candidates were found for query "
                f"'{state.get('cultural_query')}'."
            )
        else:
            resolved_count = sum(
                1
                for p in plans
                if p.resolution_status == CandidateResolutionStatus.RESOLVED
            )
            unmapped_count = sum(
                1
                for p in plans
                if p.resolution_status == CandidateResolutionStatus.UNMAPPED
            )
            summary = (
                f"Evaluated {len(plans)} cultural candidate(s): "
                f"{resolved_count} mapped to venue evidence, "
                f"{unmapped_count} unmapped."
            )

        return {
            "plans": plans,
            "cultural_threads": threads,
            "workflow_summary": summary,
        }
