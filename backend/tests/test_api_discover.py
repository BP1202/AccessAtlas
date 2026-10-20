"""Offline automated tests for the AccessAtlas Discovery API (POST /api/v1/discover).

Covers all 18 acceptance criteria:
1. Health endpoint remains unchanged.
2. Valid Ahmedabad discovery request.
3. Mandatory and optional requirement serialization.
4. Malformed and unsupported requirement validation.
5. Unsupported city.
6. Empty or oversized interests.
7. Maximum candidate bounds.
8. Exact approved mapping.
9. Unmapped Qloo candidate.
10. Missing evidence record.
11. VERIFIED_FIT, NEEDS_CONFIRMATION and REQUIREMENT_CONFLICT preservation.
12. Requirement-level outcomes and source provenance.
13. Calico operational wheelchair advisory remains distinct from step-free
    entrance evidence.
14. No inferred personal characteristics.
15. Missing Qloo configuration.
16. Sanitized upstream authentication, rate-limit, timeout and response failures.
17. No live network calls in automated tests.
18. No credentials or internal exception details in responses.
"""

import socket
from collections.abc import Generator
from typing import Any

import httpx
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.agent.graph import AccessAtlasAgent
from app.agent.resolution import CandidateMapping, InMemoryCandidateResolver
from app.api.deps import get_agent, get_qloo_client
from app.core.config import Settings, get_settings
from app.evidence.models import (
    SourceType,
)
from app.evidence.pilot_ahmedabad import (
    QLOO_ID_CALICO,
    QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
    QLOO_ID_KASTURBHAI,
    VENUE_ID_CALICO,
)
from app.evidence.repository import InMemoryVenueEvidenceRepository
from app.main import app
from app.possibility.engine import PossibilityEngine
from app.possibility.models import (
    PossibilityOutcome,
    RequirementOutcome,
)
from app.qloo.client import QlooClient

client = TestClient(app)

FIXED_EVAL_TIME = "2026-10-19T12:00:00Z"


def _build_mock_client(
    transport_handler: Any,
    api_key: str = "test-mock-key-secret-12345",
) -> QlooClient:
    """Helper to instantiate an offline QlooClient with MockTransport."""
    settings = Settings(_env_file=(), QLOO_API_KEY=api_key)
    return QlooClient(
        settings=settings,
        transport=httpx.MockTransport(transport_handler),
    )


@pytest.fixture(autouse=True)
def default_mock_qloo() -> Generator[None, None, None]:
    """Default offline Qloo mock client so tests can run completely offline."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"success": True, "results": []})

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo
    yield
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Criterion 1: Health endpoint remains unchanged
# ---------------------------------------------------------------------------
def test_1_health_endpoint_remains_unchanged() -> None:
    """Verify that GET /health continues to return HTTP 200 and documented schema."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "status": "ok",
        "service": "accessatlas-backend",
    }


# ---------------------------------------------------------------------------
# Criterion 2: Valid Ahmedabad discovery request
# ---------------------------------------------------------------------------
def test_2_valid_ahmedabad_discovery_request() -> None:
    """Verify valid Ahmedabad request returns 200 matching DiscoverResponse schema."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["textiles", "historic museum"],
        "requirements": [
            {
                "requirement_id": "req_res",
                "attribute": "reservation_required",
                "scope": "venue",
                "priority": "mandatory",
                "operator": "equals",
                "expected_value": True,
            }
        ],
        "max_candidates": 3,
        "evaluation_time": FIXED_EVAL_TIME,
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["city"] == "Ahmedabad"
    assert data["cultural_interests"] == ["textiles", "historic museum"]
    assert data["total_candidates_found"] == 1
    assert data["candidates_evaluated"] == 1
    assert len(data["plans"]) == 1
    plan = data["plans"][0]
    assert plan["candidate"]["name"] == "Calico Museum of Textiles"
    assert plan["resolution_status"] == "resolved"
    assert plan["venue_id"] == VENUE_ID_CALICO
    assert plan["possibility_assessment"] is not None
    assert (
        plan["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.VERIFIED_FIT
    )


# ---------------------------------------------------------------------------
# Criterion 3: Mandatory and optional requirement serialization
# ---------------------------------------------------------------------------
def test_3_mandatory_and_optional_requirement_serialization() -> None:
    """Verify mandatory and optional requirements serialize and evaluate correctly."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["textiles"],
        "requirements": [
            {
                "requirement_id": "req_mand",
                "attribute": "reservation_required",
                "scope": "venue",
                "priority": "mandatory",
                "operator": "equals",
                "expected_value": True,
            },
            {
                "requirement_id": "req_opt",
                "attribute": "seating_available",
                "scope": "venue",
                "priority": "optional",
                "operator": "equals",
                "expected_value": True,
            },
        ],
        "evaluation_time": FIXED_EVAL_TIME,
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    plan = data["plans"][0]
    assessments = plan["possibility_assessment"]["assessments"]
    assert len(assessments) == 2

    mand_ass = next(a for a in assessments if a["requirement_id"] == "req_mand")
    assert mand_ass["priority"] == "mandatory"
    assert mand_ass["outcome"] == RequirementOutcome.SUPPORTED

    opt_ass = next(a for a in assessments if a["requirement_id"] == "req_opt")
    assert opt_ass["priority"] == "optional"
    assert opt_ass["outcome"] == RequirementOutcome.MISSING_EVIDENCE

    # Aggregate outcome remains VERIFIED_FIT as unsupported requirement was optional
    assert (
        plan["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.VERIFIED_FIT
    )


# ---------------------------------------------------------------------------
# Criterion 4: Malformed and unsupported requirement validation
# ---------------------------------------------------------------------------
@pytest.mark.parametrize(
    "invalid_requirement, expected_substr",
    [
        (
            {
                "requirement_id": "req_1",
                "attribute": "unsupported_attribute_name",
                "operator": "equals",
                "expected_value": True,
            },
            "attribute",
        ),
        (
            {
                "requirement_id": "req_1",
                "attribute": "step_free_entrance",
                "priority": "urgent",
                "operator": "equals",
                "expected_value": True,
            },
            "priority",
        ),
        (
            {
                "requirement_id": "req_1",
                "attribute": "step_free_entrance",
                "operator": "matches_regex",
                "expected_value": True,
            },
            "operator",
        ),
        (
            {
                "requirement_id": "   ",
                "attribute": "step_free_entrance",
                "operator": "equals",
                "expected_value": True,
            },
            "requirement_id",
        ),
    ],
)
def test_4_malformed_and_unsupported_requirement_validation(
    invalid_requirement: dict[str, Any], expected_substr: str
) -> None:
    """Verify malformed or unsupported requirements are rejected with HTTP 422."""
    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["textiles"],
        "requirements": [invalid_requirement],
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    error_text = response.text.lower()
    assert expected_substr in error_text


# ---------------------------------------------------------------------------
# Criterion 5: Unsupported city
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("unsupported_city", ["Mumbai", "Delhi", "London", "New York"])
def test_5_unsupported_city(unsupported_city: str) -> None:
    """Verify requesting an unsupported city returns HTTP 400 Bad Request."""
    payload = {
        "city": unsupported_city,
        "cultural_interests": ["museums"],
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    data = response.json()
    assert "Unsupported pilot city" in data["detail"]
    assert "Ahmedabad" in data["detail"]


# ---------------------------------------------------------------------------
# Criterion 6: Empty or oversized interests
# ---------------------------------------------------------------------------
@pytest.mark.parametrize(
    "invalid_interests",
    [
        [],  # Empty list
        [""],  # Empty string item
        ["   "],  # Whitespace-only item
        ["a" * 101],  # Item exceeding 100 chars
        ["item1", "item2", "item3", "item4", "item5", "item6"],  # More than 5 items
    ],
)
def test_6_empty_or_oversized_interests(invalid_interests: list[str]) -> None:
    """Verify empty, oversized, or whitespace-only interests return HTTP 422."""
    payload = {
        "city": "Ahmedabad",
        "cultural_interests": invalid_interests,
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ---------------------------------------------------------------------------
# Criterion 7: Maximum candidate bounds
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("invalid_max", [0, -1, 21, 100])
def test_7_maximum_candidate_bounds_invalid(invalid_max: int) -> None:
    """Verify candidate count outside [1, 20] returns HTTP 422."""
    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["museums"],
        "max_candidates": invalid_max,
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_7_maximum_candidate_bounds_applied() -> None:
    """Verify max_candidates limits the number of candidates passed to evaluation."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {"entity_id": QLOO_ID_CALICO, "name": "Calico", "type": "place"},
                    {
                        "entity_id": QLOO_ID_KASTURBHAI,
                        "name": "Kasturbhai",
                        "type": "place",
                    },
                    {
                        "entity_id": QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
                        "name": "Conflictorium",
                        "type": "place",
                    },
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["heritage"],
        "max_candidates": 2,
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["candidates_evaluated"] <= 2
    assert len(data["plans"]) <= 2


# ---------------------------------------------------------------------------
# Criterion 8: Exact approved mapping
# ---------------------------------------------------------------------------
def test_8_exact_approved_mapping() -> None:
    """Verify an approved Qloo ID resolves to the exact Ahmedabad venue identity."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["textiles"],
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK
    plan = response.json()["plans"][0]
    assert plan["candidate"]["entity_id"] == QLOO_ID_CALICO
    assert plan["resolution_status"] == "resolved"
    assert plan["venue_id"] == VENUE_ID_CALICO


# ---------------------------------------------------------------------------
# Criterion 9: Unmapped Qloo candidate
# ---------------------------------------------------------------------------
def test_9_unmapped_qloo_candidate() -> None:
    """Verify unmapped Qloo candidate never receives VERIFIED_FIT or assessment."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": "00000000-0000-0000-0000-000000000000",
                        "name": "Unmapped Heritage Gallery",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["art"],
        "requirements": [
            {
                "requirement_id": "req_1",
                "attribute": "step_free_entrance",
                "priority": "mandatory",
            }
        ],
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK

    plan = response.json()["plans"][0]
    assert plan["resolution_status"] == "unmapped"
    assert plan["venue_id"] is None
    assert plan["possibility_assessment"] is None
    assert any(
        "no independently verified venue evidence is mapped" in g.lower()
        for g in plan["unresolved_gaps"]
    )


# ---------------------------------------------------------------------------
# Criterion 10: Missing evidence record
# ---------------------------------------------------------------------------
def test_10_missing_evidence_record() -> None:
    """Verify a mapped candidate missing from repository cannot produce VERIFIED_FIT."""
    entity_id = "11111111-2222-3333-4444-555555555555"

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": entity_id,
                        "name": "Venue With Missing Repo Record",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)
    # Resolver maps to a nonexistent venue_id in empty repo
    resolver = InMemoryCandidateResolver(
        [
            CandidateMapping(
                qloo_entity_id=entity_id,
                venue_id="ven_nonexistent_id",
            )
        ]
    )
    empty_repo = InMemoryVenueEvidenceRepository([])
    agent = AccessAtlasAgent(
        qloo_client=mock_qloo,
        resolver=resolver,
        evidence_repo=empty_repo,
        engine=PossibilityEngine(),
    )

    app.dependency_overrides[get_agent] = lambda: agent

    payload = {
        "city": "Ahmedabad",
        "cultural_interests": ["art"],
    }
    response = client.post("/api/v1/discover", json=payload)
    assert response.status_code == status.HTTP_200_OK

    plan = response.json()["plans"][0]
    assert plan["resolution_status"] == "missing_evidence"
    assert plan["possibility_assessment"] is None
    assert any(
        "not found in the local evidence repository" in g
        for g in plan["unresolved_gaps"]
    )


# ---------------------------------------------------------------------------
# Criterion 11: VERIFIED_FIT, NEEDS_CONFIRMATION and REQUIREMENT_CONFLICT preservation
# ---------------------------------------------------------------------------
def test_11_outcomes_preservation() -> None:
    """Verify all 3 aggregate PossibilityEngine outcomes are preserved exactly."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    # Case A: VERIFIED_FIT (mandatory requirement satisfied)
    res_fit = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
            "requirements": [
                {
                    "requirement_id": "r1",
                    "attribute": "reservation_required",
                    "expected_value": True,
                    "priority": "mandatory",
                }
            ],
            "evaluation_time": FIXED_EVAL_TIME,
        },
    )
    assert res_fit.status_code == status.HTTP_200_OK
    plan_fit = res_fit.json()["plans"][0]
    assert (
        plan_fit["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.VERIFIED_FIT
    )

    # Case B: REQUIREMENT_CONFLICT (mandatory requirement contradicted)
    res_conflict = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
            "requirements": [
                {
                    "requirement_id": "r2",
                    "attribute": "reservation_required",
                    "expected_value": False,
                    "priority": "mandatory",
                }
            ],
            "evaluation_time": FIXED_EVAL_TIME,
        },
    )
    assert res_conflict.status_code == status.HTTP_200_OK
    plan_conflict = res_conflict.json()["plans"][0]
    assert (
        plan_conflict["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.REQUIREMENT_CONFLICT
    )

    # Case C: NEEDS_CONFIRMATION (mandatory requirement missing evidence)
    res_conf = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
            "requirements": [
                {
                    "requirement_id": "r3",
                    "attribute": "step_free_entrance",
                    "expected_value": True,
                    "priority": "mandatory",
                }
            ],
            "evaluation_time": FIXED_EVAL_TIME,
        },
    )
    assert res_conf.status_code == status.HTTP_200_OK
    plan_conf = res_conf.json()["plans"][0]
    assert (
        plan_conf["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )


# ---------------------------------------------------------------------------
# Criterion 12: Requirement-level outcomes and source provenance
# ---------------------------------------------------------------------------
def test_12_requirement_outcomes_and_source_provenance() -> None:
    """Verify requirement outcome details and source provenance are preserved."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
            "requirements": [
                {
                    "requirement_id": "req_res",
                    "attribute": "reservation_required",
                    "expected_value": True,
                }
            ],
            "evaluation_time": FIXED_EVAL_TIME,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    plan = response.json()["plans"][0]
    assessment = plan["possibility_assessment"]["assessments"][0]
    assert assessment["requirement_id"] == "req_res"
    assert assessment["outcome"] == RequirementOutcome.SUPPORTED
    assert "evidence_references" in assessment
    assert len(assessment["evidence_references"]) == 1
    ref = assessment["evidence_references"][0]
    assert ref["attribute"] == "reservation_required"
    assert ref["source"]["source_type"] == SourceType.OFFICIAL_VENUE_WEBSITE
    assert ref["source"]["url"] == "https://www.calicomuseum.org/tour-guidelines/"
    assert "Sarabhai Foundation" in ref["source"]["title"]
    assert ref["source"]["verified_at"] is not None

    # Provenance sources are also preserved at the plan level
    prov_urls = [s["url"] for s in plan["provenance_sources"] if s.get("url")]
    assert "https://www.calicomuseum.org/tour-guidelines/" in prov_urls


# ---------------------------------------------------------------------------
# Criterion 13: Calico operational wheelchair advisory remains distinct
# ---------------------------------------------------------------------------
def test_13_calico_operational_wheelchair_advisory_distinct_from_step_free() -> None:
    """Verify Calico wheelchair operational limitation is preserved as an advisory,

    distinct from architectural step-free entrance evaluation.
    """

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
            "requirements": [
                {
                    "requirement_id": "req_step_free",
                    "attribute": "step_free_entrance",
                    "expected_value": True,
                    "priority": "mandatory",
                }
            ],
            "evaluation_time": FIXED_EVAL_TIME,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    plan = response.json()["plans"][0]

    # 1. Step-free entrance evaluation is NEEDS_CONFIRMATION (geometry unknown)
    step_free_ass = plan["possibility_assessment"]["assessments"][0]
    assert step_free_ass["outcome"] == RequirementOutcome.MISSING_EVIDENCE
    assert (
        plan["possibility_assessment"]["aggregate_outcome"]
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )

    # 2. Wheelchair operational limitation is surfaced distinctly as a venue advisory
    advisories = [
        action
        for action in plan["suggested_next_actions"]
        if "Venue advisory (operational policy)" in action
    ]
    assert len(advisories) == 1
    assert "currently unable to offer wheelchair access" in advisories[0]


# ---------------------------------------------------------------------------
# Criterion 14: No inferred personal characteristics
# ---------------------------------------------------------------------------
def test_14_no_inferred_personal_characteristics() -> None:
    """Verify no personal characteristics or conditions are inferred from query."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["Indian textiles and miniature paintings"],
            "requirements": [],
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    raw_text = str(data).lower()
    # Verify no patronizing or sensitive inferences
    assert "your disability" not in raw_text
    assert "your wheelchair" not in raw_text
    assert "you use a wheelchair" not in raw_text
    assert "because of your" not in raw_text


# ---------------------------------------------------------------------------
# Criterion 15: Missing Qloo configuration
# ---------------------------------------------------------------------------
def test_15_missing_qloo_configuration() -> None:
    """Verify missing QLOO_API_KEY yields HTTP 503 with sanitized error."""
    # Remove default mock client override so real dependency runs
    app.dependency_overrides.pop(get_qloo_client, None)
    # Settings without API key
    empty_settings = Settings(_env_file=(), QLOO_API_KEY=None)
    app.dependency_overrides[get_settings] = lambda: empty_settings

    response = client.post(
        "/api/v1/discover",
        json={
            "city": "Ahmedabad",
            "cultural_interests": ["textiles"],
        },
    )
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert response.json()["detail"] == "Cultural discovery service is not configured."


# ---------------------------------------------------------------------------
# Criterion 16: Sanitized upstream failures (401, 429, timeout, provider error)
# ---------------------------------------------------------------------------
def test_16_upstream_authentication_failure() -> None:
    """Verify upstream HTTP 401 produces sanitized HTTP 502."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": "Invalid API key"})

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    assert response.status_code == status.HTTP_502_BAD_GATEWAY
    assert (
        response.json()["detail"]
        == "Upstream cultural discovery authentication failed."
    )


def test_16_upstream_rate_limit_failure() -> None:
    """Verify upstream HTTP 429 produces sanitized HTTP 429."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={"error": "Rate limit exceeded"})

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert "rate limit exceeded" in response.json()["detail"].lower()


def test_16_upstream_timeout_failure() -> None:
    """Verify upstream timeout produces sanitized HTTP 504."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("Connection timed out")

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    assert response.status_code == status.HTTP_504_GATEWAY_TIMEOUT
    assert "timed out" in response.json()["detail"].lower()


def test_16_upstream_provider_response_error() -> None:
    """Verify upstream 500 error produces sanitized HTTP 502."""

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": "Internal server crash"})

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    assert response.status_code == status.HTTP_502_BAD_GATEWAY
    assert response.json()["detail"] == "Upstream cultural discovery provider error."


# ---------------------------------------------------------------------------
# Criterion 17: No live network calls in automated tests
# ---------------------------------------------------------------------------
def test_17_no_live_network_calls(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify tests execute completely offline without attempting outbound sockets."""
    orig_connect = socket.socket.connect

    def guard_connect(self: socket.socket, address: Any) -> Any:
        # Allow local loopback for asyncio internal inter-thread proactor communication
        if isinstance(address, tuple) and address[0] in (
            "127.0.0.1",
            "localhost",
            "::1",
        ):
            return orig_connect(self, address)
        raise RuntimeError(
            f"Prohibited live outbound network connection attempted to {address}!"
        )

    monkeypatch.setattr(socket.socket, "connect", guard_connect)

    def mock_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                    }
                ],
            },
        )

    mock_qloo = _build_mock_client(mock_transport)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Criterion 18: No credentials or internal exception details in responses
# ---------------------------------------------------------------------------
def test_18_no_credentials_or_internal_details_in_responses() -> None:
    """Verify API responses never expose credentials, tracebacks, or raw dumps."""
    secret_key = "super-confidential-qloo-api-key-999"

    def mock_transport(request: httpx.Request) -> httpx.Response:
        # Simulate provider sending back sensitive error payload
        return httpx.Response(
            500,
            json={
                "traceback": "Traceback (most recent call last): File /app/server.py",
                "internal_key": secret_key,
            },
        )

    mock_qloo = _build_mock_client(mock_transport, api_key=secret_key)

    def override_qloo() -> Generator[QlooClient, None, None]:
        yield mock_qloo

    app.dependency_overrides[get_qloo_client] = override_qloo

    response = client.post(
        "/api/v1/discover",
        json={"city": "Ahmedabad", "cultural_interests": ["textiles"]},
    )
    # Verify status is 502
    assert response.status_code == status.HTTP_502_BAD_GATEWAY
    raw_body = response.text
    # Assert secret key, traceback, and raw JSON dump are never in the response
    assert secret_key not in raw_body
    assert "traceback" not in raw_body.lower()
    assert "/app/server.py" not in raw_body
    assert "internal server crash" not in raw_body.lower()
