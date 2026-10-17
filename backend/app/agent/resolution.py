"""Explicit candidate resolution abstraction for AccessAtlas.

Maps Qloo cultural entity identifiers to independently sourced evidence records.
Enforces a strict trust boundary: entities are never mapped via fuzzy or guessed
names, and unmapped entities are never assigned synthetic or fabricated records.
"""

from abc import ABC, abstractmethod

from pydantic import BaseModel, ConfigDict, Field

from app.agent.models import CandidateResolutionStatus, ResolvedCandidate
from app.evidence.repository import VenueEvidenceRepository
from app.qloo.models import QlooEntity


class CandidateMapping(BaseModel):
    """An explicit, human-reviewed mapping from a Qloo entity to evidence IDs."""

    model_config = ConfigDict(frozen=True)

    qloo_entity_id: str = Field(
        description="Unique identifier of the Qloo cultural entity"
    )
    venue_id: str = Field(
        description="Associated venue identifier in the evidence repository"
    )
    experience_id: str | None = Field(
        default=None,
        description="Optional experience identifier within the venue",
    )
    notes: str | None = Field(
        default=None,
        description="Auditor or reviewer notes regarding this mapping",
    )


class CandidateResolver(ABC):
    """Abstract interface for resolving Qloo entities to evidence repository keys."""

    @abstractmethod
    def resolve_entity(self, qloo_entity_id: str) -> CandidateMapping | None:
        """Resolve a Qloo entity identifier to a verified CandidateMapping.

        Returns None if no explicit reviewed mapping exists for this entity.
        """
        raise NotImplementedError


class InMemoryCandidateResolver(CandidateResolver):
    """In-memory implementation of CandidateResolver for testing and development."""

    def __init__(
        self,
        mappings: list[CandidateMapping] | dict[str, CandidateMapping] | None = None,
    ) -> None:
        self._mappings: dict[str, CandidateMapping] = {}
        if mappings:
            if isinstance(mappings, dict):
                self._mappings = dict(mappings)
            else:
                for m in mappings:
                    self._mappings[m.qloo_entity_id] = m

    def resolve_entity(self, qloo_entity_id: str) -> CandidateMapping | None:
        """Look up mapping by exact Qloo entity identifier."""
        return self._mappings.get(qloo_entity_id.strip())

    def add_mapping(self, mapping: CandidateMapping) -> None:
        """Add or update an explicit mapping."""
        self._mappings[mapping.qloo_entity_id] = mapping


def resolve_candidate(
    entity: QlooEntity,
    resolver: CandidateResolver,
    evidence_repo: VenueEvidenceRepository,
) -> ResolvedCandidate:
    """Resolve a QlooEntity against explicit mappings and evidence repository.

    Strict Invariants:
    1. If unmapped: returns UNMAPPED with no fabricated evidence.
    2. If mapped but record not in repository: returns MISSING_EVIDENCE.
    3. If mapped and record found: returns RESOLVED with retrieved EvidenceRecord.
    """
    mapping = resolver.resolve_entity(entity.entity_id)
    if mapping is None:
        return ResolvedCandidate(
            qloo_entity=entity,
            status=CandidateResolutionStatus.UNMAPPED,
            resolution_notes=(
                f"No verified mapping exists for Qloo entity '{entity.entity_id}' "
                f"('{entity.name}'). Unmapped entities cannot be evaluated."
            ),
        )

    # Look up evidence record by venue_id (or experience_id if venue lookup yields None)
    record = evidence_repo.get_by_venue_id(mapping.venue_id)
    if record is None and mapping.experience_id:
        record = evidence_repo.get_by_experience_id(mapping.experience_id)

    if record is None:
        return ResolvedCandidate(
            qloo_entity=entity,
            status=CandidateResolutionStatus.MISSING_EVIDENCE,
            venue_id=mapping.venue_id,
            experience_id=mapping.experience_id,
            resolution_notes=(
                f"Mapped venue '{mapping.venue_id}' was not found in the "
                "evidence repository."
            ),
        )

    return ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.RESOLVED,
        venue_id=mapping.venue_id,
        experience_id=mapping.experience_id,
        evidence_record=record,
        resolution_notes=mapping.notes,
    )
