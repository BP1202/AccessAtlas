"""Request and response schemas for AccessAtlas v1 Discovery API.

Enforces strict input validation:
- Restricted to pilot city Ahmedabad.
- User-expressed cultural interests bounded in count and length.
- Explicit participation requirements using domain enums.
- Forbidden extra attributes to prevent arbitrary credential or mapping injections.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.agent.models import CandidateParticipationPlan, CulturalThread
from app.possibility.models import ParticipationRequirement


class DiscoverRequest(BaseModel):
    """Request payload for cultural discovery and participation planning."""

    model_config = ConfigDict(extra="forbid")

    city: str = Field(
        default="Ahmedabad",
        description=(
            "Pilot city name. In the current release, only 'Ahmedabad' is supported."
        ),
    )
    cultural_interests: list[str] = Field(
        min_length=1,
        max_length=5,
        description="One to five user-expressed cultural interests or search topics.",
    )
    requirements: list[ParticipationRequirement] = Field(
        default_factory=list,
        max_length=20,
        description=(
            "Explicit user participation requirements to evaluate deterministically."
        ),
    )
    max_candidates: int = Field(
        default=5,
        ge=1,
        le=20,
        description=(
            "Maximum number of cultural discovery candidates to evaluate (1 to 20)."
        ),
    )
    evaluation_time: datetime | None = Field(
        default=None,
        description=(
            "Optional timezone-aware evaluation timestamp for reproducible results."
        ),
    )

    @field_validator("cultural_interests")
    @classmethod
    def validate_cultural_interests(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("cultural_interests must contain at least one item.")
        if len(v) > 5:
            raise ValueError("cultural_interests may contain at most 5 items.")
        cleaned: list[str] = []
        for i, item in enumerate(v):
            clean = item.strip()
            if not clean:
                raise ValueError(
                    f"cultural_interests item at index {i} must not be empty or blank."
                )
            if len(clean) > 100:
                raise ValueError(
                    f"cultural_interests item at index {i} exceeds "
                    "maximum length of 100 characters."
                )
            cleaned.append(clean)
        return cleaned

    @field_validator("evaluation_time")
    @classmethod
    def validate_evaluation_time(cls, v: datetime | None) -> datetime | None:
        if v is not None and (v.tzinfo is None or v.tzinfo.utcoffset(v) is None):
            raise ValueError(
                "evaluation_time must be timezone-aware (tzinfo cannot be None)."
            )
        return v


class DiscoverResponse(BaseModel):
    """Response payload for cultural discovery and participation planning."""

    model_config = ConfigDict(frozen=True)

    city: str = Field(
        default="Ahmedabad",
        description="Pilot city evaluated.",
    )
    cultural_interests: list[str] = Field(
        description="User-expressed cultural interests that were evaluated.",
    )
    total_candidates_found: int = Field(
        description="Total cultural candidates returned by cultural discovery.",
    )
    candidates_evaluated: int = Field(
        description="Number of candidates processed through resolution and evaluation.",
    )
    plans: list[CandidateParticipationPlan] = Field(
        default_factory=list,
        description="Deterministic participation plans for evaluated candidates.",
    )
    cultural_threads: list[CulturalThread] = Field(
        default_factory=list,
        description=(
            "Structured cultural discovery threads connecting visitor-expressed "
            "interests to discovered candidates with explicit source provenance."
        ),
    )
    discovery_error: str | None = Field(
        default=None,
        description="Sanitized provider or discovery error message if one occurred.",
    )
    workflow_summary: str = Field(
        description="Deterministic overview of orchestration results.",
    )
