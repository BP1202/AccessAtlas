"""Domain models for deterministic possibility and participation suitability evaluation.

Defines explicit user requirements, condition operators, requirement priorities,
and per-requirement and aggregate assessment outcomes.
"""

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.evidence.models import ClaimScope, EvidenceAttribute, EvidenceClaim


class RequirementPriority(StrEnum):
    """Priority level for a participation requirement."""

    MANDATORY = "mandatory"
    OPTIONAL = "optional"


class ConditionOperator(StrEnum):
    """Machine-evaluable condition operators for participation requirements."""

    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN_OR_EQUAL = "greater_than_or_equal"
    LESS_THAN_OR_EQUAL = "less_than_or_equal"
    IS_PRESENT = "is_present"


class RequirementOutcome(StrEnum):
    """Deterministic evaluation outcome for a single practical requirement."""

    SUPPORTED = "supported"
    CONTRADICTED = "contradicted"
    MISSING_EVIDENCE = "missing_evidence"
    CONFLICTING_EVIDENCE = "conflicting_evidence"
    EXPIRED_EVIDENCE = "expired_evidence"
    INSUFFICIENT_SCOPE = "insufficient_scope"
    UNSUPPORTED_CONDITION = "unsupported_condition"


class PossibilityOutcome(StrEnum):
    """Aggregate suitability outcome for a venue or experience evaluation.

    Follows the exact 3-state product invariant:
    1. VERIFIED_FIT: all mandatory requirements are supported by verified evidence.
    2. NEEDS_CONFIRMATION: information is missing, conflicting, stale, or out of scope.
    3. REQUIREMENT_CONFLICT: at least one mandatory requirement is contradicted.
    """

    VERIFIED_FIT = "VERIFIED_FIT"
    NEEDS_CONFIRMATION = "NEEDS_CONFIRMATION"
    REQUIREMENT_CONFLICT = "REQUIREMENT_CONFLICT"


class ParticipationRequirement(BaseModel):
    """Explicit participation requirement expressed by a visitor."""

    model_config = ConfigDict(frozen=True)

    requirement_id: str = Field(
        description="Unique identifier for this requirement (e.g., 'req_step_free')"
    )
    attribute: EvidenceAttribute = Field(
        description="Target practical attribute from the evidence vocabulary"
    )
    scope: ClaimScope = Field(
        default=ClaimScope.VENUE,
        description="Applicable scope: venue or experience",
    )
    priority: RequirementPriority = Field(
        default=RequirementPriority.MANDATORY,
        description="Whether requirement is mandatory or an optional preference",
    )
    operator: ConditionOperator = Field(
        default=ConditionOperator.EQUALS,
        description="Condition operator for evaluation",
    )
    expected_value: Any = Field(
        default=True,
        description="Expected value or boundary for satisfaction",
    )
    description: str | None = Field(
        default=None,
        description="Optional human-readable description of the user requirement",
    )

    @field_validator("requirement_id")
    @classmethod
    def validate_requirement_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("requirement_id must not be empty.")
        return clean


class RequirementAssessment(BaseModel):
    """Deterministic assessment result for an individual requirement."""

    model_config = ConfigDict(frozen=True)

    requirement_id: str = Field(description="Identifier of the evaluated requirement")
    attribute: EvidenceAttribute = Field(description="Attribute that was evaluated")
    priority: RequirementPriority = Field(description="Priority of the requirement")
    scope: ClaimScope = Field(
        description="Scope at which the requirement was evaluated"
    )
    outcome: RequirementOutcome = Field(
        description="Deterministic per-requirement outcome"
    )
    explanation: str = Field(
        description="Concise deterministic explanation of why this outcome was reached"
    )
    evidence_references: list[EvidenceClaim] = Field(
        default_factory=list,
        description="Preserved applicable supporting, conflicting, or expired claims",
    )
    confirmation_need: str | None = Field(
        default=None,
        description="Confirmation needed when outcome is not SUPPORTED",
    )


class PossibilityAssessment(BaseModel):
    """Aggregate suitability evaluation for a venue or experience."""

    model_config = ConfigDict(frozen=True)

    venue_id: str = Field(description="Identifier of the evaluated venue")
    experience_id: str | None = Field(
        default=None,
        description="Identifier of the evaluated experience, if applicable",
    )
    aggregate_outcome: PossibilityOutcome = Field(
        description="Aggregate 3-state deterministic outcome"
    )
    evaluation_time: datetime = Field(
        description="Timezone-aware datetime when the evaluation was performed"
    )
    assessments: list[RequirementAssessment] = Field(
        default_factory=list,
        description="Ordered list of per-requirement assessments",
    )
    summary: str = Field(
        description="Concise, explainable summary of the aggregate evaluation"
    )

    @field_validator("evaluation_time")
    @classmethod
    def validate_evaluation_time(cls, v: datetime) -> datetime:
        if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
            raise ValueError(
                "evaluation_time must be timezone-aware (tzinfo cannot be None)."
            )
        return v
