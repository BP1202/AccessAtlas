"""Models for independently sourced venue and experience practical evidence.

Preserves factual participation information, claim scopes, and source provenance
for downstream deterministic suitability evaluation.
"""

from datetime import datetime
from enum import StrEnum
from typing import Any
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ClaimScope(StrEnum):
    """Scope of an evidence claim.

    Differentiates whether a claim applies to the entire physical venue
    (e.g., main street entrance) or specifically to a sub-activity / experience
    within that venue (e.g., a specific gallery or tour).
    """

    VENUE = "venue"
    EXPERIENCE = "experience"


class EvidenceStatus(StrEnum):
    """Fact status of a specific practical attribute or claim."""

    SOURCE_BACKED = "source_backed"
    UNKNOWN = "unknown"
    CONFLICTING = "conflicting"


class SourceType(StrEnum):
    """Classification of the provenance source."""

    OFFICIAL_VENUE_WEBSITE = "official_venue_website"
    PRIMARY_ORGANIZER_NOTICE = "primary_organizer_notice"
    DIRECT_VENUE_COMMUNICATION = "direct_venue_communication"
    ON_SITE_AUDIT = "on_site_audit"
    COMMUNITY_REPORT = "community_report"
    THIRD_PARTY_DIRECTORY = "third_party_directory"


class EvidenceAttribute(StrEnum):
    """Extensible vocabulary for practical participation attributes.

    Note: This is a practical vocabulary, not an exhaustive accessibility code.
    """

    STEP_FREE_ENTRANCE = "step_free_entrance"
    INTERNAL_ELEVATOR = "internal_elevator"
    SEATING_AVAILABLE = "seating_available"
    REST_AREAS = "rest_areas"
    QUIET_SPACE = "quiet_space"
    AUDIO_DESCRIPTION = "audio_description"
    ASSISTIVE_LISTENING = "assistive_listening"
    SENSORY_ADAPTED_SESSION = "sensory_adapted_session"
    SERVICE_ANIMAL_POLICY = "service_animal_policy"
    COMPANION_ENTRY_POLICY = "companion_entry_policy"
    RESERVATION_REQUIRED = "reservation_required"
    STEP_FREE_RESTROOM = "step_free_restroom"
    ACCESSIBLE_PARKING = "accessible_parking"
    CONTACT_FOR_ACCESS_INFO = "contact_for_access_info"


class EvidenceSource(BaseModel):
    """Provenance and verification metadata for an evidence claim."""

    model_config = ConfigDict(frozen=True)

    source_type: SourceType = Field(description="Classification of the source")
    url: str | None = Field(
        default=None,
        description="Public URL of the source document or official website",
    )
    title: str = Field(description="Name, organization, or title of the source")
    verified_at: datetime = Field(
        description="Timezone-aware datetime when this source was checked"
    )
    author_or_auditor: str | None = Field(
        default=None,
        description="Name of auditor, staff, or reporter if recorded",
    )

    @field_validator("verified_at")
    @classmethod
    def validate_timezone_aware(cls, v: datetime) -> datetime:
        if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
            raise ValueError(
                "Verification timestamp must be timezone-aware (tzinfo cannot be None)."
            )
        return v

    @field_validator("url")
    @classmethod
    def validate_url_format(cls, v: str | None) -> str | None:
        if v is None:
            return None
        clean = v.strip()
        if not clean:
            return None
        parsed = urlparse(clean)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError(
                f"Source URL must be a valid HTTP/HTTPS URL with host, got '{v}'."
            )
        return clean


class EvidenceClaim(BaseModel):
    """An individual piece of practical evidence regarding an attribute.

    Represents a single observation, rule, or report from a specific source.
    """

    model_config = ConfigDict(frozen=True)

    attribute: EvidenceAttribute = Field(description="Practical attribute discussed")
    scope: ClaimScope = Field(
        description="Whether claim applies to venue or experience"
    )
    value: Any = Field(
        description="Observed fact or value (e.g. True/False/description)"
    )
    details: str | None = Field(
        default=None,
        description="Specific contextual notes, dimensions, or qualifications",
    )
    source: EvidenceSource = Field(description="Independent source provenance")

    @field_validator("details")
    @classmethod
    def strip_empty_details(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            return None
        return v


class AttributeEvidence(BaseModel):
    """Aggregated status and supporting claims for a single attribute.

    Preserves multiple claims and explicitly denotes if evidence is unknown,
    verified/source-backed, or conflicting.
    """

    attribute: EvidenceAttribute
    status: EvidenceStatus
    claims: list[EvidenceClaim] = Field(
        default_factory=list,
        description="Preserved individual claims from independent sources",
    )
    summary: str | None = Field(
        default=None,
        description="Neutral summary of current evidence without overriding conflicts",
    )

    @model_validator(mode="after")
    def validate_status_claims_consistency(self) -> "AttributeEvidence":
        if self.status == EvidenceStatus.UNKNOWN:
            if self.claims:
                raise ValueError("Attribute with UNKNOWN status must not have claims.")
        elif self.status == EvidenceStatus.SOURCE_BACKED:
            if not self.claims:
                raise ValueError(
                    "Attribute with SOURCE_BACKED status must have at least one claim."
                )
        elif self.status == EvidenceStatus.CONFLICTING:
            if len(self.claims) < 2:
                raise ValueError(
                    "Attribute with CONFLICTING status must have at least 2 claims."
                )
        return self


class VenueIdentity(BaseModel):
    """Identifier and core descriptor for a physical venue."""

    model_config = ConfigDict(frozen=True)

    venue_id: str = Field(description="Deterministic venue identifier (e.g. 'ven_123')")
    name: str = Field(description="Official display name of the venue")
    address: str = Field(description="Physical location or street address")
    locality: str = Field(description="City or administrative area")
    postal_code: str | None = Field(default=None)
    country_code: str = Field(
        default="US",
        description="Two-letter ISO country code (e.g. 'US')",
    )

    @field_validator("venue_id")
    @classmethod
    def validate_venue_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean or len(clean) < 3:
            raise ValueError(f"Invalid venue_id: '{v}'. Must be at least 3 characters.")
        return clean


class ExperienceIdentity(BaseModel):
    """Identifier and descriptor for an experience, linked to a venue if applicable."""

    model_config = ConfigDict(frozen=True)

    experience_id: str = Field(
        description="Deterministic experience identifier (e.g. 'exp_456')"
    )
    title: str = Field(description="Title of the event, exhibition, or activity")
    venue_id: str | None = Field(
        default=None,
        description="Linked venue identifier if physically anchored",
    )
    description: str | None = Field(default=None)

    @field_validator("experience_id")
    @classmethod
    def validate_experience_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean or len(clean) < 3:
            raise ValueError(
                f"Invalid experience_id: '{v}'. Must be at least 3 characters."
            )
        return clean


class EvidenceRecord(BaseModel):
    """Structured collection of evidence for a venue and optionally an experience.

    Keeps venue-scoped claims separate from experience-scoped claims.
    """

    venue: VenueIdentity
    experience: ExperienceIdentity | None = Field(
        default=None,
        description="Associated experience if evidence is anchored to one",
    )
    venue_evidence: dict[EvidenceAttribute, AttributeEvidence] = Field(
        default_factory=dict,
        description="Evidence records scoped specifically to the physical venue",
    )
    experience_evidence: dict[EvidenceAttribute, AttributeEvidence] = Field(
        default_factory=dict,
        description="Evidence records scoped specifically to the experience",
    )

    @model_validator(mode="after")
    def validate_scope_integrity(self) -> "EvidenceRecord":
        # Validate that all claims inside venue_evidence have ClaimScope.VENUE
        for attr, attr_ev in self.venue_evidence.items():
            for claim in attr_ev.claims:
                if claim.scope != ClaimScope.VENUE:
                    raise ValueError(
                        f"Claim in venue_evidence for {attr} has scope {claim.scope}. "
                        "Must be ClaimScope.VENUE."
                    )
        # Validate that all claims inside experience_evidence have ClaimScope.EXPERIENCE
        for attr, attr_ev in self.experience_evidence.items():
            for claim in attr_ev.claims:
                if claim.scope != ClaimScope.EXPERIENCE:
                    raise ValueError(
                        f"Claim in experience_evidence for {attr} has scope "
                        f"{claim.scope}. Must be ClaimScope.EXPERIENCE."
                    )

        # Experience evidence requires experience identity
        if self.experience_evidence and self.experience is None:
            raise ValueError(
                "experience_evidence cannot be present without an experience identity."
            )

        # If experience is present and defines a venue_id, it must match venue.venue_id
        if self.experience and self.experience.venue_id:
            if self.experience.venue_id != self.venue.venue_id:
                raise ValueError(
                    f"Experience venue_id '{self.experience.venue_id}' does not match "
                    f"EvidenceRecord venue_id '{self.venue.venue_id}'."
                )

        return self
