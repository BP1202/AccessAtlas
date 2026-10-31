"""Mocked unit tests for Qloo cultural discovery integration.

Validates:
- Valid entity lookup (/search)
- Valid cross-domain insights (/v2/insights)
- Request authentication header (without displaying its value)
- Correct HTTP methods and parameter construction
- Empty results handling (both HTTP 404 and empty results array)
- Missing configuration handling
- Authentication failure (HTTP 401)
- Rate limiting (HTTP 429)
- Request timeout
- Malformed/unexpected provider response
- Response normalization to internal Pydantic models
"""

import httpx
import pytest

from app.core.config import Settings
from app.qloo import (
    QlooAuthenticationError,
    QlooClient,
    QlooConfigurationError,
    QlooRateLimitError,
    QlooResponseError,
    QlooTimeoutError,
)

FAKE_API_KEY = "test_fake_api_key_12345"
FAKE_BASE_URL = "https://hackathon.api.qloo.com"


def test_missing_api_key_raises_configuration_error() -> None:
    """Verify that creating a QlooClient without key raises QlooConfigurationError."""
    empty_settings = Settings(_env_file=(), QLOO_API_KEY=None)
    with pytest.raises(QlooConfigurationError) as exc_info:
        QlooClient(settings=empty_settings)
    assert "QLOO_API_KEY is not configured" in str(exc_info.value)


def test_search_entities_success() -> None:
    """Verify successful entity search call and normalization."""
    recorded_requests: list[httpx.Request] = []

    def mock_handler(request: httpx.Request) -> httpx.Response:
        recorded_requests.append(request)
        # Verify method and path
        assert request.method == "GET"
        assert request.url.path == "/search"
        # Verify header is present and format is valid
        assert "x-api-key" in request.headers
        assert request.headers["x-api-key"] == FAKE_API_KEY
        # Verify query parameters
        assert "query=Studio+Ghibli" in str(request.url)
        assert "take=5" in str(request.url)

        payload = {
            "success": True,
            "results": [
                {
                    "entity_id": "ghibli-001",
                    "name": "Studio Ghibli",
                    "type": "urn:entity:brand",
                    "popularity": 0.88,
                    "disambiguation": "Japanese animation studio",
                    "tags": [
                        {
                            "id": "urn:tag:genre:animation",
                            "name": "Animation",
                            "type": "urn:tag:genre",
                        }
                    ],
                    "properties": {
                        "description": "Acclaimed animation studio based in Tokyo.",
                    },
                }
            ],
        }
        return httpx.Response(200, json=payload)

    transport = httpx.MockTransport(mock_handler)
    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=transport,
    )

    result = client.search_entities(query="Studio Ghibli", take=5)

    assert len(recorded_requests) == 1
    assert result.query == "Studio Ghibli"
    assert result.total_results == 1
    entity = result.entities[0]
    assert entity.entity_id == "ghibli-001"
    assert entity.name == "Studio Ghibli"
    assert entity.entity_type == "urn:entity:brand"
    assert entity.popularity == 0.88
    assert entity.disambiguation == "Japanese animation studio"
    assert len(entity.tags) == 1
    assert entity.tags[0].id == "urn:tag:genre:animation"
    assert entity.tags[0].name == "Animation"
    assert (
        entity.properties["description"] == "Acclaimed animation studio based in Tokyo."
    )


def test_get_insights_success() -> None:
    """Verify successful cross-domain insights call and normalization."""
    recorded_requests: list[httpx.Request] = []

    def mock_handler(request: httpx.Request) -> httpx.Response:
        recorded_requests.append(request)
        assert request.method == "GET"
        assert request.url.path == "/v2/insights"
        assert request.headers.get("x-api-key") == FAKE_API_KEY
        assert "filter.type=urn%3Aentity%3Amovie" in str(
            request.url
        ) or "filter.type=urn:entity:movie" in str(request.url)
        assert "signal.interests.entities=ghibli-001" in str(request.url)

        payload = {
            "success": True,
            "results": {
                "entities": [
                    {
                        "entity_id": "movie-sp-01",
                        "name": "Spirited Away",
                        "type": "urn:entity",
                        "subtype": "urn:entity:movie",
                        "popularity": 0.95,
                        "disambiguation": "2001, Hayao Miyazaki",
                        "tags": [
                            {
                                "id": "urn:tag:genre:media:fantasy",
                                "name": "Fantasy",
                            }
                        ],
                        "properties": {
                            "release_year": 2001,
                            "description": "During her family's move to the suburbs...",
                        },
                    }
                ]
            },
        }
        return httpx.Response(200, json=payload)

    transport = httpx.MockTransport(mock_handler)
    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=transport,
    )

    result = client.get_insights(
        filter_type="urn:entity:movie",
        signal_entities=["ghibli-001"],
    )

    assert len(recorded_requests) == 1
    assert result.target_type == "urn:entity:movie"
    assert result.total_results == 1
    movie = result.entities[0]
    assert movie.entity_id == "movie-sp-01"
    assert movie.name == "Spirited Away"
    assert movie.subtype == "urn:entity:movie"
    assert movie.popularity == 0.95
    assert movie.properties["release_year"] == 2001


def test_search_entities_empty_results_and_404_handling() -> None:
    """Verify both 404 response and empty 200 list correctly normalize to 0 results."""

    # Qloo documented behavior: 404 on /search means 'No results'
    def not_found_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(404, json={"code": 404, "reason": "No results"})

    client_404 = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(not_found_handler),
    )
    res_404 = client_404.search_entities(query="Nonexistent123")
    assert res_404.total_results == 0
    assert res_404.entities == []

    # 200 OK with empty array
    def empty_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"success": True, "results": []})

    client_empty = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(empty_handler),
    )
    res_empty = client_empty.search_entities(query="NothingHere")
    assert res_empty.total_results == 0
    assert res_empty.entities == []


def test_authentication_failure_raises_qloo_auth_error() -> None:
    """Verify HTTP 401 raises QlooAuthenticationError."""

    def auth_err_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"message": "No API key found in request"})

    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(auth_err_handler),
    )
    with pytest.raises(QlooAuthenticationError) as exc_info:
        client.search_entities(query="test")
    assert "authentication failed" in str(exc_info.value).lower()


def test_rate_limit_raises_qloo_rate_limit_error() -> None:
    """Verify HTTP 429 raises QlooRateLimitError."""

    def rate_limit_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={"message": "Rate limit exceeded"})

    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(rate_limit_handler),
    )
    with pytest.raises(QlooRateLimitError) as exc_info:
        client.get_insights("urn:entity:movie", ["dummy-id"])
    assert "rate limit" in str(exc_info.value).lower()


def test_timeout_raises_qloo_timeout_error() -> None:
    """Verify httpx.TimeoutException maps to QlooTimeoutError."""

    def timeout_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("Read timed out")

    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(timeout_handler),
    )
    with pytest.raises(QlooTimeoutError) as exc_info:
        client.search_entities("test")
    assert "timed out" in str(exc_info.value).lower()


def test_unexpected_provider_error_status() -> None:
    """Verify HTTP 500 error raises QlooResponseError."""

    def server_err_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"message": "Internal Server Error"})

    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(server_err_handler),
    )
    with pytest.raises(QlooResponseError) as exc_info:
        client.search_entities("test")
    assert exc_info.value.status_code == 500


def test_malformed_json_response() -> None:
    """Verify non-JSON response raises QlooResponseError."""

    def html_err_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="<html>Gateway Error</html>")

    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(html_err_handler),
    )
    with pytest.raises(QlooResponseError) as exc_info:
        client.search_entities("test")
    assert "malformed json" in str(exc_info.value).lower()


def test_invalid_input_validation() -> None:
    """Verify local validation on bad search query or unsupported insights types."""
    client = QlooClient(
        api_key=FAKE_API_KEY,
        base_url=FAKE_BASE_URL,
        transport=httpx.MockTransport(lambda req: httpx.Response(200, json={})),
    )

    # Empty search query
    with pytest.raises(ValueError) as exc:
        client.search_entities("   ")
    assert "cannot be empty" in str(exc.value)

    # Unsupported insights type
    with pytest.raises(ValueError) as exc:
        client.get_insights("urn:entity:music", ["some-id"])
    assert "Unsupported filter.type" in str(exc.value)

    # Empty signals list
    with pytest.raises(ValueError) as exc:
        client.get_insights("urn:entity:movie", [])
    assert "at least one valid entity ID" in str(exc.value)


def test_live_smoke_skip_when_api_key_missing(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify live smoke returns 1 and prints skip message when API key is missing."""
    from app.qloo.live_smoke_test import run_live_smoke

    settings = Settings(_env_file=(), QLOO_API_KEY=None)
    exit_code = run_live_smoke(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 1
    assert "[SKIP] QLOO_API_KEY is not configured" in captured


def test_live_smoke_zero_search_entities_fails_verification(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify live smoke test fails verification if search returns zero entities."""
    from app.qloo.live_smoke_test import run_live_smoke

    settings = Settings(_env_file=(), QLOO_API_KEY="test_key_abc")

    def empty_search_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"success": True, "results": []})

    monkeypatch.setattr(
        "app.qloo.live_smoke_test.QlooClient",
        lambda settings: QlooClient(
            settings=settings,
            transport=httpx.MockTransport(empty_search_transport),
        ),
    )

    exit_code = run_live_smoke(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 1
    assert "Credential status: configured" in captured
    assert "test_key_abc" not in captured
    assert "Incomplete verification: Search returned zero entities" in captured
    assert "Live Smoke Test Completed Successfully" not in captured


def test_live_smoke_success_path_does_not_leak_key(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify successful smoke test execution exits 0 without printing any key slice."""
    from app.qloo.live_smoke_test import run_live_smoke

    secret_key = "super_secret_qloo_token_123"
    settings = Settings(_env_file=(), QLOO_API_KEY=secret_key)

    def success_transport(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/search":
            return httpx.Response(
                200,
                json={
                    "success": True,
                    "results": [
                        {
                            "entity_id": "ent-1",
                            "name": "Sample Entity",
                            "type": "urn:entity:brand",
                        }
                    ],
                },
            )
        elif request.url.path == "/v2/insights":
            return httpx.Response(
                200,
                json={
                    "success": True,
                    "results": {
                        "entities": [
                            {
                                "entity_id": "ent-2",
                                "name": "Recommended Entity",
                                "type": "urn:entity",
                                "subtype": "urn:entity:movie",
                            }
                        ]
                    },
                },
            )
        return httpx.Response(404, json={})

    monkeypatch.setattr(
        "app.qloo.live_smoke_test.QlooClient",
        lambda settings: QlooClient(
            settings=settings,
            transport=httpx.MockTransport(success_transport),
        ),
    )

    exit_code = run_live_smoke(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 0
    assert "Credential status: configured" in captured
    # Ensure no slice of secret_key is present anywhere in output
    assert "super" not in captured
    assert "secret" not in captured
    assert "123" not in captured
    assert "Outcome: Request succeeded" in captured
    assert "Live Smoke Test Completed Successfully" in captured
