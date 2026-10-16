"""Domain models and exceptions for Qloo cultural discovery integration.

These models represent normalized data consumed by AccessAtlas without exposing
raw provider internals or inventing confidence ratings/accessibility claims.
"""

from typing import Any

from pydantic import BaseModel, Field


class QlooError(Exception):
    """Base exception for all Qloo integration failures."""


class QlooConfigurationError(QlooError):
    """Raised when required Qloo configuration (e.g. API key) is missing or invalid."""


class QlooAuthenticationError(QlooError):
    """Raised when Qloo authentication fails (e.g. HTTP 401 Unauthorized)."""


class QlooRateLimitError(QlooError):
    """Raised when Qloo rate limit or quota is exceeded (HTTP 429)."""


class QlooTimeoutError(QlooError):
    """Raised when an outbound HTTP request to Qloo times out."""


class QlooResponseError(QlooError):
    """Raised when Qloo returns a provider error (HTTP 4xx/5xx)."""

    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class QlooEntityTag(BaseModel):
    """A cultural or descriptive tag associated with a Qloo entity."""

    id: str = Field(description="Unique tag URN, e.g. urn:tag:genre:media:comedy")
    name: str = Field(description="Human-readable tag display name")
    tag_type: str | None = Field(
        default=None,
        description="Tag domain/category URN if provided by Qloo",
    )


class QlooEntity(BaseModel):
    """Normalized cultural entity representation for AccessAtlas."""

    entity_id: str = Field(description="Qloo unique entity identifier or UUID")
    name: str = Field(description="Name or title of the cultural entity")
    entity_type: str = Field(
        description="Primary entity type/URN, e.g. urn:entity:movie"
    )
    subtype: str | None = Field(
        default=None, description="Detailed subtype URN if present"
    )
    popularity: float | None = Field(
        default=None,
        description="Percentile popularity score [0.0, 1.0] as provided by Qloo",
    )
    disambiguation: str | None = Field(
        default=None,
        description="Disambiguation metadata such as release year or creators",
    )
    tags: list[QlooEntityTag] = Field(
        default_factory=list,
        description="Normalized tags associated with the entity",
    )
    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Safe subset of normalized entity attributes",
    )


class QlooSearchResult(BaseModel):
    """Normalized result set from entity lookup /search."""

    query: str
    total_results: int
    entities: list[QlooEntity] = Field(default_factory=list)


class QlooInsightsResult(BaseModel):
    """Normalized result set from cross-domain Insights /v2/insights."""

    target_type: str = Field(description="Target filter.type requested")
    total_results: int
    entities: list[QlooEntity] = Field(default_factory=list)
