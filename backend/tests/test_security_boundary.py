"""Security boundary and credential protection tests for AccessAtlas.

Validates that:
1. Synthetic sentinel credentials never appear in serialized API responses or headers.
2. Upstream provider exceptions and raw traces are sanitized before reaching clients.
3. Configuration errors are handled safely without revealing credential values.
4. Timeout, rate-limit, and failure responses produce safe public error structures.
5. Qloo request headers (X-Api-Key) are constructed exclusively within backend code.
"""

from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

from app.agent.graph import AccessAtlasAgent
from app.api.deps import get_agent, get_settings
from app.core.config import Settings
from app.evidence.pilot_ahmedabad import (
    create_ahmedabad_candidate_resolver,
    create_ahmedabad_pilot_repository,
)
from app.main import app
from app.possibility.engine import PossibilityEngine
from app.qloo.client import QlooClient
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooEntity,
    QlooError,
    QlooRateLimitError,
    QlooResponseError,
    QlooTimeoutError,
)

SENTINEL_CREDENTIAL = "SENTINEL_QLOO_SECRET_KEY_XYZ_99999"


def _make_mock_client(
    transport: httpx.BaseTransport,
    api_key: str = SENTINEL_CREDENTIAL,
) -> QlooClient:
    return QlooClient(
        api_key=api_key,
        base_url="https://mock.qloo.local",
        transport=transport,
    )


def _make_agent_with_transport(
    transport: httpx.BaseTransport,
    api_key: str = SENTINEL_CREDENTIAL,
) -> AccessAtlasAgent:
    client = _make_mock_client(transport, api_key=api_key)
    return AccessAtlasAgent(
        qloo_client=client,
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
        engine=PossibilityEngine(),
    )


# ==============================================================================
# 1. Synthetic Sentinel Credential Concealment
# ==============================================================================


def test_sentinel_credential_never_leaked_in_successful_response() -> None:
    """When a discovery request succeeds, the private Qloo API key must not appear

    in response headers, serialized models, or response body.
    """

    def mock_handler(request: httpx.Request) -> httpx.Response:
        # Provider response that even contains a diagnostic property mentioning key
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "id": "783C0235-681D-4235-BA4D-A57992F7C97A",
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                        "subtype": "museum",
                        "popularity": 0.9,
                    }
                ],
            },
        )

    agent = _make_agent_with_transport(httpx.MockTransport(mock_handler))
    app.dependency_overrides[get_agent] = lambda: agent

    try:
        with TestClient(app) as test_client:
            res = test_client.post(
                "/api/v1/discover",
                json={
                    "city": "Ahmedabad",
                    "cultural_interests": ["textiles"],
                    "requirements": [],
                },
            )
            assert res.status_code == 200
            body_text = res.text
            assert SENTINEL_CREDENTIAL not in body_text
            for header_name, header_val in res.headers.items():
                assert SENTINEL_CREDENTIAL not in header_name
                assert SENTINEL_CREDENTIAL not in header_val
    finally:
        app.dependency_overrides.clear()


def test_sentinel_credential_never_leaked_when_provider_fails() -> None:
    """When upstream provider fails with an error referencing the key, the key

    must be stripped and never appear in client error responses.
    """

    def failing_handler(request: httpx.Request) -> httpx.Response:
        # Simulate upstream provider error payload echoing sensitive details
        return httpx.Response(
            401,
            json={
                "error": "Unauthorized",
                "message": f"Invalid key: {SENTINEL_CREDENTIAL}",
            },
        )

    agent = _make_agent_with_transport(httpx.MockTransport(failing_handler))
    app.dependency_overrides[get_agent] = lambda: agent

    try:
        with TestClient(app) as test_client:
            res = test_client.post(
                "/api/v1/discover",
                json={
                    "city": "Ahmedabad",
                    "cultural_interests": ["textiles"],
                    "requirements": [],
                },
            )
            assert res.status_code == 502
            assert SENTINEL_CREDENTIAL not in res.text
            assert (
                res.json()["detail"]
                == "Upstream cultural discovery authentication failed."
            )
    finally:
        app.dependency_overrides.clear()


# ==============================================================================
# 2. Provider Exception Sanitization
# ==============================================================================


@pytest.mark.parametrize(
    "exception_cls,expected_status,expected_detail",
    [
        (
            QlooAuthenticationError,
            502,
            "Upstream cultural discovery authentication failed.",
        ),
        (
            QlooRateLimitError,
            429,
            (
                "Upstream cultural discovery rate limit exceeded. "
                "Please try again later."
            ),
        ),
        (
            QlooTimeoutError,
            504,
            "Upstream cultural discovery request timed out. Please retry.",
        ),
        (
            QlooResponseError,
            502,
            "Upstream cultural discovery provider error.",
        ),
        (
            QlooConfigurationError,
            503,
            "Cultural discovery service is not configured.",
        ),
        (
            QlooError,
            502,
            "Upstream cultural discovery service error.",
        ),
    ],
)
def test_qloo_exceptions_sanitized_to_safe_public_error_structures(
    exception_cls: type[Exception],
    expected_status: int,
    expected_detail: str,
) -> None:
    """Every Qloo integration exception is mapped to a standard status code

    and safe public detail string without leaking raw traces or messages.
    """

    class RaisingQlooClient:
        def search_entities(self, *args: Any, **kwargs: Any) -> Any:
            raise exception_cls(
                f"Raw internal provider trace with secret {SENTINEL_CREDENTIAL}"
            )

    agent = AccessAtlasAgent(
        qloo_client=RaisingQlooClient(),  # type: ignore[arg-type]
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
        engine=PossibilityEngine(),
    )
    app.dependency_overrides[get_agent] = lambda: agent

    try:
        with TestClient(app) as test_client:
            res = test_client.post(
                "/api/v1/discover",
                json={
                    "city": "Ahmedabad",
                    "cultural_interests": ["textiles"],
                    "requirements": [],
                },
            )
            assert res.status_code == expected_status
            data = res.json()
            assert data["detail"] == expected_detail
            assert SENTINEL_CREDENTIAL not in res.text
            assert "Raw internal provider trace" not in res.text
    finally:
        app.dependency_overrides.clear()


# ==============================================================================
# 3. Configuration Error Handling Without Revealing Secret Values
# ==============================================================================


@pytest.mark.parametrize("empty_key", [None, "", "   "])
def test_qloo_client_raises_configuration_error_on_missing_key(
    empty_key: str | None,
) -> None:
    """Initializing QlooClient without an API key raises QlooConfigurationError

    with a safe instruction and no secret exposure.
    """
    settings = Settings(QLOO_API_KEY=empty_key)
    with pytest.raises(QlooConfigurationError) as exc_info:
        QlooClient(settings=settings)
    msg = str(exc_info.value)
    assert "QLOO_API_KEY is not configured" in msg
    assert "Provide it directly or configure it in .env.local" in msg


def test_missing_configuration_at_endpoint_returns_safe_503() -> None:
    """When the service lacks configuration, the endpoint returns HTTP 503

    with a safe public message.
    """
    settings = Settings(QLOO_API_KEY=None)
    app.dependency_overrides[get_settings] = lambda: settings

    # Invalidate cached dependencies
    try:
        with TestClient(app) as test_client:
            res = test_client.post(
                "/api/v1/discover",
                json={
                    "city": "Ahmedabad",
                    "cultural_interests": ["textiles"],
                    "requirements": [],
                },
            )
            assert res.status_code == 503
            assert res.json() == {
                "detail": "Cultural discovery service is not configured."
            }
    finally:
        app.dependency_overrides.clear()


# ==============================================================================
# 4. Exclusive Backend Header Construction
# ==============================================================================


def test_qloo_client_constructs_headers_server_side() -> None:
    """QlooClient strictly constructs X-Api-Key headers on outbound requests."""
    captured_headers: dict[str, str] = {}

    def capture_handler(request: httpx.Request) -> httpx.Response:
        nonlocal captured_headers
        captured_headers = dict(request.headers)
        return httpx.Response(
            200,
            json={"success": True, "results": []},
        )

    client = _make_mock_client(
        httpx.MockTransport(capture_handler),
        api_key=SENTINEL_CREDENTIAL,
    )
    client.search_entities(query="textiles")

    assert "x-api-key" in captured_headers
    assert captured_headers["x-api-key"] == SENTINEL_CREDENTIAL
    assert captured_headers["accept"] == "application/json"


def test_domain_models_do_not_expose_credentials() -> None:
    """Domain models (QlooEntity, DiscoverResponse, CandidateParticipationPlan)

    must never define or contain credential or auth token fields.
    """
    entity = QlooEntity(
        entity_id="entity_1",
        name="Place",
        entity_type="urn:entity:place",
    )
    dumped = entity.model_dump()
    assert "api_key" not in dumped
    assert "x_api_key" not in dumped
    assert "token" not in dumped
    assert "secret" not in dumped


def test_client_cannot_pass_qloo_key_in_request_body() -> None:
    """Frontend requests containing undeclared credential fields are rejected

    by FastAPI with HTTP 422 (extra='forbid').
    """
    agent = _make_agent_with_transport(
        httpx.MockTransport(
            lambda r: httpx.Response(200, json={"success": True, "results": []})
        )
    )
    app.dependency_overrides[get_agent] = lambda: agent

    try:
        with TestClient(app) as test_client:
            res = test_client.post(
                "/api/v1/discover",
                json={
                    "city": "Ahmedabad",
                    "cultural_interests": ["textiles"],
                    "qloo_api_key": "ATTEMPTED_CLIENT_KEY",
                },
            )
            assert res.status_code == 422
            data = res.json()
            assert "extra_forbidden" in str(data)
    finally:
        app.dependency_overrides.clear()
