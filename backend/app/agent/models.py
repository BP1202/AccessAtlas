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


class AgentWorkflowInput(BaseModel):
    """Expressed visitor input for cultural discovery and participation planning."""

    model_config = ConfigDict(frozen=True)

    cultural_query: str = Field(
        description="Expressed cultural interest or search term (e.g. 'Studio Ghibli')"
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
    target_type: str
    requirements: list[ParticipationRequirement]
    max_candidates: int
    evaluation_time: datetime
    discovered_entities: list[QlooEntity]
    resolved_candidates: list[ResolvedCandidate]
    plans: list[CandidateParticipationPlan]
    discovery_error: str | None
    workflow_summary: str
    raw_context: dict[str, Any]
