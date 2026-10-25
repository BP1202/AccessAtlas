"""Domain models and state definitions for LangGraph agent orchestration.

Defines workflow inputs, state containers, candidate resolution models,
and structured participation plans.
"""

from datetime import datetime
from enum import StrEnum
from typing import Any, TypedDict

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.evidence.models import EvidenceRecord, EvidenceSource
from app.possibility.models import (
    ParticipationRequirement,
    PossibilityAssessment,
)
from app.qloo.models import QlooEntity


class CandidateResolutionStatus(StrEnum):
    """Resolution status of a Qloo cultural entity to physical evidence."""

    RESOLVED = "resolved"
    UNMAPPED = "unmapped"
    MISSING_EVIDENCE = "missing_evidence"


class ThreadSourceType(StrEnum):
    """Auditable classification of where a data point or signal originated."""

    EXPLICIT_VISITOR_SELECTION = "explicit_visitor_selection"
    ACTUAL_QLOO_RESPONSE = "actual_qloo_response"
    DETERMINISTIC_APPLICATION_MAPPING = "deterministic_application_mapping"


class ThreadConnectionType(StrEnum):
    """Deterministic classification of how the connection was established."""

    EXPLICIT_INTEREST_MATCH = "explicit_interest_match"
    SHARED_TAG = "shared_tag"
    SHARED_SUBTYPE = "shared_subtype"
    DISCOVERED_CANDIDATE = "discovered_candidate"


class CulturalThreadAnchor(BaseModel):
    """The visitor-supplied starting interest and any resolved provider entity/tag."""

    model_config = ConfigDict(frozen=True)

    interest: str = Field(description="The visitor-supplied starting interest term.")
    source_type: ThreadSourceType = Field(
        default=ThreadSourceType.EXPLICIT_VISITOR_SELECTION,
        description="Source classification of this starting signal.",
    )
    resolved_entity_id: str | None = Field(
        default=None,
        description=(
            "Qloo entity ID if the starting interest was resolved to an entity."
        ),
    )
    resolved_entity_name: str | None = Field(
        default=None,
        description="Name of the resolved provider entity, if available.",
    )
    matched_tag: str | None = Field(
        default=None,
        description="Qloo tag or category name matching the interest, if present.",
    )


class CulturalThreadConnection(BaseModel):
    """Auditable connection describing why and how a candidate was connected."""

    model_config = ConfigDict(frozen=True)

    connection_type: ThreadConnectionType = Field(
        description="Classification of the relationship."
    )
    source_type: ThreadSourceType = Field(
        description="Source classification for the connection logic."
    )
    shared_descriptors: list[str] = Field(
        default_factory=list,
        description=(
            "Specific matched terms, tags, or subtypes connecting interest "
            "to candidate."
        ),
    )
    rationale: str = Field(
        description="Human-readable, deterministic explanation of the connection.",
    )


class CulturalThreadCandidate(BaseModel):
    """Discovered candidate reference with clear mapping and evidence flags."""

    model_config = ConfigDict(frozen=True)

    entity_id: str = Field(
        description="Stable Qloo entity identifier (UUID or provider ID)."
    )
    name: str = Field(
        description="Discovered candidate place or cultural experience name."
    )
    entity_type: str = Field(
        description="Qloo entity type URN (e.g. urn:entity:place)."
    )
    subtype: str | None = Field(
        default=None,
        description=(
            "Entity subtype if provided by Qloo (e.g. museum, gallery, historic_site)."
        ),
    )
    popularity: float | None = Field(
        default=None,
        description=(
            "Global Qloo entity popularity score (0.0 to 1.0) if returned by provider."
        ),
    )
    mapping_status: CandidateResolutionStatus = Field(
        description=(
            "Mapping status to local venue evidence "
            "(resolved, unmapped, missing_evidence)."
        ),
    )
    has_reviewed_evidence: bool = Field(
        description=(
            "True if factual, reviewed participation evidence exists in repository."
        ),
    )
    is_evaluation_eligible: bool = Field(
        description="True if eligible for deterministic Possibility Engine evaluation.",
    )
    venue_id: str | None = Field(
        default=None,
        description="Local venue identifier in evidence repository if mapped.",
    )


class CulturalThread(BaseModel):
    """Provenance-aware cultural thread connecting visitor interest to candidate."""

    model_config = ConfigDict(frozen=True)

    thread_id: str = Field(
        description=(
            "Deterministic unique identifier for this thread "
            "(e.g. 'thread_calico_textiles')."
        )
    )
    starting_interest: str = Field(
        description="The visitor-supplied starting interest that initiated this thread."
    )
    anchor: CulturalThreadAnchor = Field(
        description="Anchor details for the starting interest."
    )
    candidate: CulturalThreadCandidate = Field(
        description=(
            "The discovered cultural candidate and its evidence verification status."
        )
    )
    connection: CulturalThreadConnection = Field(
        description="The provenance-aware connection explanation."
    )
    provenance: str = Field(
        default="qloo_search_discovery",
        description="Provenance of discovery (e.g. 'qloo_search_discovery').",
    )


class ResolvedCandidate(BaseModel):
    """A cultural entity paired with its resolved venue evidence if available."""

    model_config = ConfigDict(frozen=True)

    qloo_entity: QlooEntity = Field(description="Cultural discovery entity from Qloo")
    status: CandidateResolutionStatus = Field(
        description="Explicit mapping and evidence retrieval status"
    )
    venue_id: str | None = Field(
        default=None,
        description="Resolved venue identifier if mapped",
    )
    experience_id: str | None = Field(
        default=None,
        description="Resolved experience identifier if mapped",
    )
    evidence_record: EvidenceRecord | None = Field(
        default=None,
        description="Retrieved evidence record if resolved",
    )
    possibility_assessment: PossibilityAssessment | None = Field(
        default=None,
        description="Possibility Engine assessment if evaluated",
    )
    resolution_notes: str | None = Field(
        default=None,
        description="Explanatory notes regarding mapping or retrieval",
    )


class CandidateParticipationPlan(BaseModel):
    """Deterministic participation plan for a specific cultural candidate."""

    model_config = ConfigDict(frozen=True)

    candidate: QlooEntity = Field(description="Cultural discovery candidate reference")
    resolution_status: CandidateResolutionStatus = Field(
        description="Mapping and evidence resolution status"
    )
    venue_id: str | None = Field(
        default=None,
        description="Associated venue identifier if mapped",
    )
    experience_id: str | None = Field(
        default=None,
        description="Associated experience identifier if mapped",
    )
    possibility_assessment: PossibilityAssessment | None = Field(
        default=None,
        description="Legitimate Possibility Engine assessment, if evaluated",
    )
    supported_findings: list[str] = Field(
        default_factory=list,
        description="Explicit participation attributes supported by verified evidence",
    )
    unresolved_gaps: list[str] = Field(
        default_factory=list,
        description="Identified gaps, missing evidence, or conflicts",
    )
    confirmation_questions: list[str] = Field(
        default_factory=list,
        description="Questions grounded in explicit evidence gaps",
    )
    suggested_next_actions: list[str] = Field(
        default_factory=list,
        description="Grounded next actions for the visitor",
    )
    provenance_sources: list[EvidenceSource] = Field(
        default_factory=list,
        description="Preserved independent evidence sources consulted",
    )
    cultural_thread: CulturalThread | None = Field(
        default=None,
        description="Associated cultural thread for this candidate.",
    )


class AgentWorkflowInput(BaseModel):
    """Expressed visitor input for cultural discovery and participation planning."""

    model_config = ConfigDict(frozen=True)

    cultural_query: str = Field(
        description="Expressed cultural interest or search term (e.g. 'Studio Ghibli')"
    )
    cultural_interests: list[str] = Field(
        default_factory=list,
        description="List of user-expressed cultural interests if provided separately.",
    )
    target_type: str = Field(
        default="urn:entity:place",
        description="Target Qloo entity type for discovery",
    )
    requirements: list[ParticipationRequirement] = Field(
        default_factory=list,
        description="Explicit user participation requirements",
    )
    max_candidates: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of discovery candidates to evaluate",
    )
    evaluation_time: datetime | None = Field(
        default=None,
        description="Optional timezone-aware timestamp for reproducible evaluation",
    )

    @field_validator("cultural_query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("cultural_query must not be empty.")
        return clean

    @field_validator("evaluation_time")
    @classmethod
    def validate_evaluation_time(cls, v: datetime | None) -> datetime | None:
        if v is not None and (v.tzinfo is None or v.tzinfo.utcoffset(v) is None):
            raise ValueError(
                "evaluation_time must be timezone-aware (tzinfo cannot be None)."
            )
        return v


class AgentWorkflowOutput(BaseModel):
    """Final structured output produced by the LangGraph orchestration workflow."""

    model_config = ConfigDict(frozen=True)

    cultural_query: str = Field(description="Original cultural query")
    total_candidates_found: int = Field(
        description="Total cultural candidates returned by discovery"
    )
    candidates_evaluated: int = Field(
        description="Number of candidates processed through resolution"
    )
    plans: list[CandidateParticipationPlan] = Field(
        default_factory=list,
        description="Structured participation plans for evaluated candidates",
    )
    cultural_threads: list[CulturalThread] = Field(
        default_factory=list,
        description=(
            "Structured cultural discovery threads connecting visitor interests to "
            "candidates."
        ),
    )
    discovery_error: str | None = Field(
        default=None,
        description="Sanitized provider or discovery error message if one occurred",
    )
    workflow_summary: str = Field(
        description="Deterministic overview of orchestration results"
    )


class AgentState(TypedDict, total=False):
    """Typed state dictionary for LangGraph workflow execution."""

    cultural_query: str
    cultural_interests: list[str]
    target_type: str
    requirements: list[ParticipationRequirement]
    max_candidates: int
    evaluation_time: datetime
    discovered_entities: list[QlooEntity]
    resolved_candidates: list[ResolvedCandidate]
    plans: list[CandidateParticipationPlan]
    cultural_threads: list[CulturalThread]
    discovery_error: str | None
    workflow_summary: str
    raw_context: dict[str, Any]
