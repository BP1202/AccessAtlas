"""Qloo API client for verified cultural discovery.

Conforms strictly to the official Qloo LLM Hackathon Developer Guide:
- Base URL: https://hackathon.api.qloo.com (default)
- Authentication: X-Api-Key header
- Entity Search: GET /search (parameters: query, types, take, page)
- Cross-Domain Insights: GET /v2/insights
  (parameters: filter.type, signal.interests.entities, take, page)
"""

from typing import Any

import httpx

from app.core.config import Settings, get_settings
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooEntity,
    QlooEntityTag,
    QlooInsightsResult,
    QlooRateLimitError,
    QlooResponseError,
    QlooSearchResult,
    QlooTimeoutError,
)

# Supported Insights target types per official Qloo Hackathon Guide
SUPPORTED_INSIGHTS_TYPES = {
    "urn:entity:artist",
    "urn:entity:book",
    "urn:entity:brand",
    "urn:entity:destination",
    "urn:entity:movie",
    "urn:entity:person",
    "urn:entity:place",
    "urn:entity:podcast",
    "urn:entity:tv_show",
    "urn:entity:video_game",
}


def _normalize_entity(raw: dict[str, Any]) -> QlooEntity:
    """Normalize a raw Qloo entity dictionary into a clean QlooEntity domain model."""
    entity_id = raw.get("entity_id") or raw.get("id") or raw.get("uuid") or ""
    name = raw.get("name") or raw.get("title") or ""
    entity_type = raw.get("type") or raw.get("subtype") or "urn:entity"
    subtype = raw.get("subtype")

    popularity = raw.get("popularity")
    if popularity is not None:
        try:
            popularity = float(popularity)
        except (ValueError, TypeError):
            popularity = None

    disambiguation = raw.get("disambiguation")

    # Normalize tags
    normalized_tags: list[QlooEntityTag] = []
    raw_tags = raw.get("tags")
    if isinstance(raw_tags, list):
        for t in raw_tags:
            if isinstance(t, dict) and "id" in t:
                normalized_tags.append(
                    QlooEntityTag(
                        id=str(t["id"]),
                        name=str(t.get("name") or t["id"]),
                        tag_type=str(t.get("type")) if t.get("type") else None,
                    )
                )

    # Safe properties extraction: avoid private dumps or massive nested akas
    raw_props = raw.get("properties")
    safe_properties: dict[str, Any] = {}
    if isinstance(raw_props, dict):
        for key in (
            "description",
            "release_year",
            "release_date",
            "content_rating",
            "duration",
            "filming_location",
            "production_companies",
            "websites",
        ):
            if key in raw_props and raw_props[key] is not None:
                safe_properties[key] = raw_props[key]
        if "image" in raw_props and isinstance(raw_props["image"], dict):
            if "url" in raw_props["image"]:
                safe_properties["image_url"] = raw_props["image"]["url"]

    return QlooEntity(
        entity_id=str(entity_id),
        name=str(name),
        entity_type=str(entity_type),
        subtype=str(subtype) if subtype else None,
        popularity=popularity,
        disambiguation=str(disambiguation) if disambiguation else None,
        tags=normalized_tags,
        properties=safe_properties,
    )


class QlooClient:
    """Outbound HTTP client for Qloo Cultural Discovery API.

    Requires QLOO_API_KEY when initialized. Outbound calls use bounded timeouts,
    authentication via X-Api-Key, and strict error classification.
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float = 10.0,
        settings: Settings | None = None,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        resolved_settings = settings or get_settings()
        self.api_key = api_key or resolved_settings.QLOO_API_KEY
        if not self.api_key or not self.api_key.strip():
            raise QlooConfigurationError(
                "QLOO_API_KEY is not configured. Provide it directly or "
                "configure it in .env.local"
            )

        raw_base_url = (base_url or resolved_settings.QLOO_BASE_URL).rstrip("/")
        self.base_url = raw_base_url
        self.timeout = timeout

        self._client = httpx.Client(
            base_url=self.base_url,
            headers={
                "X-Api-Key": self.api_key.strip(),
                "Accept": "application/json",
            },
            timeout=self.timeout,
            transport=transport,
        )

    def close(self) -> None:
        """Close the underlying HTTP client session."""
        self._client.close()

    def __enter__(self) -> "QlooClient":
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    def _handle_response(
        self, response: httpx.Response, endpoint_label: str
    ) -> dict[str, Any]:
        """Validate response status and return parsed JSON safely."""
        status = response.status_code

        if status == 401:
            raise QlooAuthenticationError(
                "Qloo authentication failed (HTTP 401). "
                "Verify your QLOO_API_KEY and QLOO_BASE_URL."
            )
        elif status == 403:
            raise QlooResponseError(
                f"Qloo access forbidden (HTTP 403) on {endpoint_label}. "
                "Check entity type permissions.",
                status_code=403,
            )
        elif status == 404:
            # 404 on search represents an empty result in Qloo's schema contract
            return {"success": True, "results": []}
        elif status == 429:
            raise QlooRateLimitError(
                "Qloo rate limit or monthly quota exceeded (HTTP 429)."
            )
        elif status >= 400:
            raise QlooResponseError(
                f"Qloo request failed with HTTP {status} on {endpoint_label}.",
                status_code=status,
            )

        try:
            data = response.json()
        except Exception as exc:
            raise QlooResponseError(
                f"Malformed JSON response from Qloo on {endpoint_label}."
            ) from exc

        if not isinstance(data, dict):
            raise QlooResponseError(
                f"Unexpected JSON format from Qloo on {endpoint_label} "
                "(expected object)."
            )

        return data

    def search_entities(
        self,
        query: str,
        types: list[str] | None = None,
        take: int = 10,
        page: int = 1,
    ) -> QlooSearchResult:
        """Search for cultural entities by name or term via GET /search.

        Parameters:
            query: Search query string (e.g. 'Studio Ghibli', 'Balthazar')
            types: Optional list of entity type URNs (e.g. ['urn:entity:movie'])
            take: Number of results to return (1-100)
            page: Page number (1-100)
        """
        clean_query = query.strip()
        if not clean_query:
            raise ValueError("Search query cannot be empty.")

        params: dict[str, Any] = {
            "query": clean_query,
            "take": max(1, min(take, 100)),
            "page": max(1, page),
        }
        if types:
            params["types"] = ",".join(types)

        try:
            response = self._client.get("/search", params=params)
        except httpx.TimeoutException as exc:
            raise QlooTimeoutError("Request to Qloo /search timed out.") from exc
        except httpx.RequestError as exc:
            raise QlooResponseError("Network error contacting Qloo /search.") from exc

        data = self._handle_response(response, "/search")

        # Parse results: Qloo returns results as a list under "results"
        raw_results = data.get("results")
        entities: list[QlooEntity] = []

        if isinstance(raw_results, list):
            for item in raw_results:
                if isinstance(item, dict):
                    entities.append(_normalize_entity(item))
        elif isinstance(raw_results, dict):
            # Fallback if wrapped in an entities list
            sub_entities = raw_results.get("entities")
            if isinstance(sub_entities, list):
                for item in sub_entities:
                    if isinstance(item, dict):
                        entities.append(_normalize_entity(item))

        return QlooSearchResult(
            query=clean_query,
            total_results=len(entities),
            entities=entities,
        )

    def get_insights(
        self,
        filter_type: str,
        signal_entities: list[str],
        take: int = 10,
        page: int = 1,
    ) -> QlooInsightsResult:
        """Query cross-domain cultural recommendations via GET /v2/insights.

        Parameters:
            filter_type: Target entity type (e.g. 'urn:entity:movie')
            signal_entities: List of anchor entity IDs discovered via search
            take: Number of results to return
            page: Page number
        """
        clean_target = filter_type.strip()
        if not clean_target:
            raise ValueError("filter_type must be specified.")
        if clean_target not in SUPPORTED_INSIGHTS_TYPES:
            types_str = ", ".join(sorted(SUPPORTED_INSIGHTS_TYPES))
            raise ValueError(
                f"Unsupported filter.type: '{clean_target}'. "
                f"Supported types: {types_str}"
            )

        if not signal_entities:
            raise ValueError(
                "signal_entities must contain at least one valid entity ID."
            )

        clean_signals = [s.strip() for s in signal_entities if s.strip()]
        if not clean_signals:
            raise ValueError("signal_entities cannot be blank.")

        params: dict[str, Any] = {
            "filter.type": clean_target,
            "signal.interests.entities": ",".join(clean_signals),
            "take": max(1, min(take, 100)),
            "page": max(1, page),
        }

        try:
            response = self._client.get("/v2/insights", params=params)
        except httpx.TimeoutException as exc:
            raise QlooTimeoutError("Request to Qloo /v2/insights timed out.") from exc
        except httpx.RequestError as exc:
            raise QlooResponseError(
                "Network error contacting Qloo /v2/insights."
            ) from exc

        data = self._handle_response(response, "/v2/insights")

        # In /v2/insights, entities are typically under results.entities or results
        raw_results = data.get("results")
        entities: list[QlooEntity] = []

        if isinstance(raw_results, dict):
            raw_entities = raw_results.get("entities")
            if isinstance(raw_entities, list):
                for item in raw_entities:
                    if isinstance(item, dict):
                        entities.append(_normalize_entity(item))
        elif isinstance(raw_results, list):
            for item in raw_results:
                if isinstance(item, dict):
                    entities.append(_normalize_entity(item))

        return QlooInsightsResult(
            target_type=clean_target,
            total_results=len(entities),
            entities=entities,
        )
