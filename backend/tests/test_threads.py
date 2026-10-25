"""Unit and contract tests for Cultural Threads synthesis and API integration.

Validates:
- Successful synthesis with tag, subtype, and direct name matching.
- Fallback discovered candidate handling.
- Missing optional fields handling.
- Empty provider results and empty interest queries.
- Duplicate candidate deduplication.
- Reviewed vs unreviewed (unmapped) candidate evidence flags.
- Source classifications (explicit selection, deterministic mapping, actual response).
- Contract verification: zero invented relationship-strength or confidence scores.
- Discovery API backward-compatibility and thread exposure.
"""


import pytest
from fastapi.testclient import TestClient

from app.agent.models import (
    CandidateResolutionStatus,
    ResolvedCandidate,
    ThreadConnectionType,
    ThreadSourceType,
)
from app.agent.threads import build_cultural_threads
from app.api.deps import (
    get_qloo_client,
)
from app.evidence.fixtures import create_synthetic_accessible_hall
from app.main import app
from app.qloo.models import QlooEntity, QlooEntityTag, QlooSearchResult


def _create_mock_entity(
    entity_id: str = "qloo_calico_123",
    name: str = "Calico Museum of Textiles",
    entity_type: str = "urn:entity:place",
    subtype: str | None = "museum",
    popularity: float | None = 0.85,
    disambiguation: str | None = "Shahibaug, Ahmedabad",
    tags: list[QlooEntityTag] | None = None,
) -> QlooEntity:
    return QlooEntity(
        entity_id=entity_id,
        name=name,
        entity_type=entity_type,
        subtype=subtype,
        popularity=popularity,
        disambiguation=disambiguation,
        tags=tags or [],
        properties={},
    )


# 1. Successful thread synthesis with tag matching
def test_thread_synthesis_with_tag_matching() -> None:
    entity = _create_mock_entity(
        tags=[
            QlooEntityTag(
                id="urn:tag:concept:textiles",
                name="Textiles & Weaving",
                tag_type="concept",
            )
        ]
    )
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.RESOLVED,
        venue_id="ven_calico",
        evidence_record=create_synthetic_accessible_hall(),
    )

    threads = build_cultural_threads(
        interests=["Textiles"], resolved_candidates=[resolved]
    )

    assert len(threads) == 1
    thread = threads[0]
    assert thread.starting_interest == "Textiles"
    assert thread.anchor.interest == "Textiles"
    assert (
        thread.anchor.source_type
        == ThreadSourceType.EXPLICIT_VISITOR_SELECTION
    )
    assert thread.anchor.matched_tag == "Textiles & Weaving"

    assert thread.connection.connection_type == ThreadConnectionType.SHARED_TAG
    assert (
        thread.connection.source_type
        == ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING
    )
    assert thread.connection.shared_descriptors == ["Textiles & Weaving"]
    assert "Textiles & Weaving" in thread.connection.rationale

    assert thread.candidate.entity_id == "qloo_calico_123"
    assert thread.candidate.has_reviewed_evidence is True
    assert thread.candidate.is_evaluation_eligible is True
    assert thread.candidate.mapping_status == CandidateResolutionStatus.RESOLVED


# 2. Thread synthesis with subtype matching
def test_thread_synthesis_with_subtype_matching() -> None:
    entity = _create_mock_entity(subtype="contemporary_gallery", tags=[])
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    threads = build_cultural_threads(
        interests=["Gallery"], resolved_candidates=[resolved]
    )

    assert len(threads) == 1
    thread = threads[0]
    assert (
        thread.connection.connection_type == ThreadConnectionType.SHARED_SUBTYPE
    )
    assert (
        thread.connection.source_type
        == ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING
    )
    assert thread.connection.shared_descriptors == ["contemporary_gallery"]
    assert "contemporary_gallery" in thread.connection.rationale


# 3. Thread synthesis with direct name matching
def test_thread_synthesis_with_direct_name_matching() -> None:
    entity = _create_mock_entity(
        name="Sabarmati Gandhi Ashram",
        subtype="historic_site",
        tags=[],
    )
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    threads = build_cultural_threads(
        interests=["Gandhi"], resolved_candidates=[resolved]
    )

    assert len(threads) == 1
    thread = threads[0]
    assert (
        thread.connection.connection_type
        == ThreadConnectionType.EXPLICIT_INTEREST_MATCH
    )
    assert (
        thread.connection.source_type
        == ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING
    )
    assert thread.connection.shared_descriptors == ["Gandhi"]


# 4. Fallback discovered candidate handling
def test_thread_synthesis_fallback_discovered_candidate() -> None:
    entity = _create_mock_entity(
        name="Adalaj Stepwell",
        subtype="monument",
        tags=[
            QlooEntityTag(id="urn:tag:stepwells", name="Stepwells"),
            QlooEntityTag(id="urn:tag:gujarat", name="Gujarat Heritage"),
        ],
    )
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    threads = build_cultural_threads(
        interests=["Ceramics"], resolved_candidates=[resolved]
    )

    assert len(threads) == 1
    thread = threads[0]
    assert (
        thread.connection.connection_type
        == ThreadConnectionType.DISCOVERED_CANDIDATE
    )
    assert (
        thread.connection.source_type == ThreadSourceType.ACTUAL_QLOO_RESPONSE
    )
    assert "Stepwells" in thread.connection.shared_descriptors


# 5. Missing optional fields handling
def test_missing_optional_fields_handling() -> None:
    minimal_entity = QlooEntity(
        entity_id="qloo_minimal_999",
        name="Minimal Cultural Spot",
        entity_type="urn:entity:place",
        subtype=None,
        popularity=None,
        disambiguation=None,
        tags=[],
        properties={},
    )
    resolved = ResolvedCandidate(
        qloo_entity=minimal_entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    threads = build_cultural_threads(
        interests=["General Culture"], resolved_candidates=[resolved]
    )

    assert len(threads) == 1
    cand = threads[0].candidate
    assert cand.entity_id == "qloo_minimal_999"
    assert cand.subtype is None
    assert cand.popularity is None
    assert cand.has_reviewed_evidence is False
    assert cand.is_evaluation_eligible is False


# 6. Empty interests and empty candidates
def test_empty_interests_and_empty_candidates() -> None:
    entity = _create_mock_entity()
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    assert build_cultural_threads(interests=[], resolved_candidates=[resolved]) == []
    assert build_cultural_threads(interests=["Textiles"], resolved_candidates=[]) == []
    assert (
        build_cultural_threads(interests=["  "], resolved_candidates=[resolved])
        == []
    )


# 7. Duplicate candidate entities deduplicated
def test_duplicate_entities_deduplicated() -> None:
    entity = _create_mock_entity(entity_id="dup_001")
    res1 = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )
    res2 = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
    )

    threads = build_cultural_threads(
        interests=["Textiles"], resolved_candidates=[res1, res2]
    )
    assert len(threads) == 1
    assert threads[0].candidate.entity_id == "dup_001"


# 8. Unmapped candidates vs mapped candidates evidence flags
def test_unmapped_vs_mapped_candidate_evidence_flags() -> None:
    # 1. Unmapped candidate
    unmapped_res = ResolvedCandidate(
        qloo_entity=_create_mock_entity(entity_id="ent_unmapped"),
        status=CandidateResolutionStatus.UNMAPPED,
        venue_id=None,
        evidence_record=None,
    )
    # 2. Mapped but missing evidence
    missing_ev_res = ResolvedCandidate(
        qloo_entity=_create_mock_entity(entity_id="ent_missing"),
        status=CandidateResolutionStatus.MISSING_EVIDENCE,
        venue_id="ven_nonexistent",
        evidence_record=None,
    )
    # 3. Resolved with verified evidence
    resolved_res = ResolvedCandidate(
        qloo_entity=_create_mock_entity(entity_id="ent_resolved"),
        status=CandidateResolutionStatus.RESOLVED,
        venue_id="ven_verified",
        evidence_record=create_synthetic_accessible_hall(),
    )

    threads = build_cultural_threads(
        interests=["Art"],
        resolved_candidates=[unmapped_res, missing_ev_res, resolved_res],
    )

    assert len(threads) == 3
    t_unmapped = threads[0]
    assert (
        t_unmapped.candidate.mapping_status == CandidateResolutionStatus.UNMAPPED
    )
    assert t_unmapped.candidate.has_reviewed_evidence is False
    assert t_unmapped.candidate.is_evaluation_eligible is False
    assert t_unmapped.candidate.venue_id is None

    t_missing = threads[1]
    assert (
        t_missing.candidate.mapping_status
        == CandidateResolutionStatus.MISSING_EVIDENCE
    )
    assert t_missing.candidate.has_reviewed_evidence is False
    assert t_missing.candidate.is_evaluation_eligible is False
    assert t_missing.candidate.venue_id == "ven_nonexistent"

    t_resolved = threads[2]
    assert (
        t_resolved.candidate.mapping_status
        == CandidateResolutionStatus.RESOLVED
    )
    assert t_resolved.candidate.has_reviewed_evidence is True
    assert t_resolved.candidate.is_evaluation_eligible is True
    assert t_resolved.candidate.venue_id == "ven_verified"


# 9. Contract test: verifying no unsupported relationship fields are emitted
def test_contract_no_unsupported_fields_or_confidence_percentages() -> None:
    entity = _create_mock_entity(popularity=0.75)
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.RESOLVED,
        venue_id="ven_calico",
        evidence_record=create_synthetic_accessible_hall(),
    )

    threads = build_cultural_threads(
        interests=["Textiles"], resolved_candidates=[resolved]
    )
    serialized = threads[0].model_dump()

    # Invariants from AGENTS.md and QLOO_DISCOVERY_AUDIT.md
    forbidden_keys = {
        "affinity_score",
        "affinity_percentage",
        "confidence",
        "confidence_pct",
        "relationship_strength",
        "similarity_score",
        "match_percentage",
    }
    assert forbidden_keys.isdisjoint(serialized.keys())
    assert forbidden_keys.isdisjoint(serialized["connection"].keys())
    assert forbidden_keys.isdisjoint(serialized["candidate"].keys())

    # Candidate popularity must remain within valid range if present
    pop = serialized["candidate"]["popularity"]
    assert pop is None or (0.0 <= pop <= 1.0)


# 10. Discovery API integration test: verifying cultural_threads exposure
def test_api_discover_exposes_cultural_threads(monkeypatch: pytest.MonkeyPatch) -> None:
    """Validate that POST /api/v1/discover returns structured cultural_threads."""
    # Mock Qloo search to return a known place candidate
    mock_qloo_entity = QlooEntity(
        entity_id="783C0235-681D-4235-BA4D-A57992F7C97A",
        name="Calico Museum of Textiles",
        entity_type="urn:entity:place",
        subtype="museum",
        popularity=0.88,
        disambiguation="The Retreat, Shahibaug, Ahmedabad",
        tags=[
            QlooEntityTag(
                id="urn:tag:textiles",
                name="Indian Textiles",
                tag_type="concept",
            )
        ],
        properties={},
    )

    class MockQlooClient:
        def search_entities(self, query: str, take: int = 10, **kwargs):
            return QlooSearchResult(
                query=query,
                total_results=1,
                entities=[mock_qloo_entity],
            )

        def close(self):
            pass

    app.dependency_overrides[get_qloo_client] = lambda: MockQlooClient()

    try:
        client = TestClient(app)
        payload = {
            "city": "Ahmedabad",
            "cultural_interests": ["Textiles"],
            "requirements": [],
            "max_candidates": 5,
        }
        response = client.post("/api/v1/discover", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Check response structure
        assert "cultural_threads" in data
        assert len(data["cultural_threads"]) == 1

        thread = data["cultural_threads"][0]
        assert thread["starting_interest"] == "Textiles"
        expected_qloo_id = "783C0235-681D-4235-BA4D-A57992F7C97A"
        assert thread["candidate"]["entity_id"] == expected_qloo_id
        assert thread["candidate"]["name"] == "Calico Museum of Textiles"
        assert thread["candidate"]["mapping_status"] == "resolved"
        assert thread["candidate"]["has_reviewed_evidence"] is True
        assert thread["candidate"]["is_evaluation_eligible"] is True
        assert thread["candidate"]["venue_id"] == "ven_in_ahm_calico"

        assert thread["connection"]["connection_type"] == "shared_tag"
        assert (
            thread["connection"]["source_type"]
            == "deterministic_application_mapping"
        )
        assert "Indian Textiles" in thread["connection"]["shared_descriptors"]

        # Also verify plan carries the cultural_thread
        assert len(data["plans"]) == 1
        plan = data["plans"][0]
        assert "cultural_thread" in plan
        assert plan["cultural_thread"] is not None
        assert (
            plan["cultural_thread"]["thread_id"] == thread["thread_id"]
        )

    finally:
        app.dependency_overrides.clear()
