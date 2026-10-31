"""Unit tests for independently sourced venue and experience evidence foundation.

Tests verify:
1. Valid source-backed evidence.
2. Unknown information without a fabricated source.
3. Rejection of malformed source data (e.g. invalid URLs, invalid venue IDs).
4. Timezone-aware verification timestamps enforcement.
5. Multiple evidence records for the same attribute.
6. Preservation of conflicting claims.
7. Claim scope separation between venue and experience.
8. Repository retrieval and missing-record behaviour.
9. Independence from Qloo affinity data.
"""

from datetime import UTC, datetime

import pytest

from app.evidence.fixtures import (
    create_synthetic_accessible_hall,
    create_synthetic_venue_and_experience_with_scope_separation,
    create_synthetic_venue_with_conflicting_claims,
)
from app.evidence.models import (
    AttributeEvidence,
    ClaimScope,
    EvidenceAttribute,
    EvidenceClaim,
    EvidenceRecord,
    EvidenceSource,
    EvidenceStatus,
    ExperienceIdentity,
    SourceType,
)
from app.evidence.repository import InMemoryVenueEvidenceRepository


def test_valid_source_backed_evidence() -> None:
    """Verify valid creation and inspection of source-backed practical evidence."""
    record = create_synthetic_accessible_hall()
    assert record.venue.venue_id == "syn_ven_heritage_hall"
    assert record.venue.name == "Synthetic Heritage Hall"

    entrance_evidence = record.venue_evidence[EvidenceAttribute.STEP_FREE_ENTRANCE]
    assert entrance_evidence.status == EvidenceStatus.SOURCE_BACKED
    assert len(entrance_evidence.claims) == 1

    claim = entrance_evidence.claims[0]
    assert claim.attribute == EvidenceAttribute.STEP_FREE_ENTRANCE
    assert claim.scope == ClaimScope.VENUE
    assert claim.value is True
    assert "Automatic sliding doors" in (claim.details or "")
    assert claim.source.source_type == SourceType.OFFICIAL_VENUE_WEBSITE
    assert claim.source.url == "https://synthetic.heritagehall.test/accessibility"
    assert claim.source.verified_at.tzinfo is not None


def test_unknown_information_without_fabricated_source() -> None:
    """Verify that unknown attributes contain no claims or fabricated sources."""
    record = create_synthetic_accessible_hall()
    restroom_evidence = record.venue_evidence[EvidenceAttribute.STEP_FREE_RESTROOM]

    assert restroom_evidence.status == EvidenceStatus.UNKNOWN
    assert restroom_evidence.claims == []
    assert restroom_evidence.summary is not None

    # An unknown attribute cannot have claims attached
    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        title="Official Site",
        verified_at=datetime.now(UTC),
    )
    bogus_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
        scope=ClaimScope.VENUE,
        value=None,
        source=source,
    )
    with pytest.raises(ValueError, match="UNKNOWN status must not have claims"):
        AttributeEvidence(
            attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
            status=EvidenceStatus.UNKNOWN,
            claims=[bogus_claim],
        )


def test_rejection_of_malformed_source_url() -> None:
    """Verify rejection of invalid or malformed source URLs."""
    # Missing scheme/netloc
    with pytest.raises(ValueError, match="valid HTTP/HTTPS URL"):
        EvidenceSource(
            source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
            url="not_a_valid_url",
            title="Broken URL Source",
            verified_at=datetime.now(UTC),
        )

    # Unsupported scheme (ftp)
    with pytest.raises(ValueError, match="valid HTTP/HTTPS URL"):
        EvidenceSource(
            source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
            url="ftp://files.example.com/doc.pdf",
            title="FTP Source",
            verified_at=datetime.now(UTC),
        )


def test_timezone_aware_timestamp_enforcement() -> None:
    """Verify that naive datetimes without timezone are strictly rejected."""
    naive_dt = datetime(2026, 3, 15, 12, 0, 0)  # tzinfo=None
    with pytest.raises(ValueError, match="must be timezone-aware"):
        EvidenceSource(
            source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
            title="Valid Title",
            verified_at=naive_dt,
        )


def test_multiple_evidence_records_and_conflicting_claims() -> None:
    """Verify preservation of multiple claims and explicit CONFLICTING status."""
    record = create_synthetic_venue_with_conflicting_claims()
    seating_evidence = record.venue_evidence[EvidenceAttribute.SEATING_AVAILABLE]

    assert seating_evidence.status == EvidenceStatus.CONFLICTING
    assert len(seating_evidence.claims) == 2

    # Check that neither claim was overwritten
    claim_official, claim_community = seating_evidence.claims
    assert claim_official.value is True
    assert claim_official.source.source_type == SourceType.OFFICIAL_VENUE_WEBSITE

    assert claim_community.value is False
    assert claim_community.source.source_type == SourceType.COMMUNITY_REPORT

    # Attempting CONFLICTING status with fewer than 2 claims is rejected
    with pytest.raises(
        ValueError, match="CONFLICTING status must have at least 2 claims"
    ):
        AttributeEvidence(
            attribute=EvidenceAttribute.SEATING_AVAILABLE,
            status=EvidenceStatus.CONFLICTING,
            claims=[claim_official],
        )


def test_claim_scope_separation_venue_vs_experience() -> None:
    """Verify that venue-level claims do not bleed into experience-level claims."""
    record = create_synthetic_venue_and_experience_with_scope_separation()

    assert record.experience is not None
    assert record.experience.experience_id == "syn_exp_tower_tour"

    # Venue entrance is step-free
    venue_entrance = record.venue_evidence[EvidenceAttribute.STEP_FREE_ENTRANCE]
    assert venue_entrance.claims[0].value is True
    assert venue_entrance.claims[0].scope == ClaimScope.VENUE

    # But the specific experience entrance is NOT step-free (stairs to tower)
    exp_entrance = record.experience_evidence[EvidenceAttribute.STEP_FREE_ENTRANCE]
    assert exp_entrance.claims[0].value is False
    assert exp_entrance.claims[0].scope == ClaimScope.EXPERIENCE

    # Mismatched scope validation: placing an EXPERIENCE-scoped claim
    # in venue_evidence errors out
    mismatched_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.EXPERIENCE,
        value=True,
        source=venue_entrance.claims[0].source,
    )
    with pytest.raises(ValueError, match="Must be ClaimScope.VENUE"):
        EvidenceRecord(
            venue=record.venue,
            venue_evidence={
                EvidenceAttribute.STEP_FREE_ENTRANCE: AttributeEvidence(
                    attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                    status=EvidenceStatus.SOURCE_BACKED,
                    claims=[mismatched_claim],
                )
            },
        )


def test_experience_venue_id_mismatch_rejected() -> None:
    """Verify that an experience with a conflicting venue_id cannot be attached."""
    record = create_synthetic_accessible_hall()
    mismatched_experience = ExperienceIdentity(
        experience_id="syn_exp_other",
        title="Other Event",
        venue_id="syn_ven_completely_different",
    )
    with pytest.raises(ValueError, match="does not match EvidenceRecord venue_id"):
        EvidenceRecord(
            venue=record.venue,
            experience=mismatched_experience,
        )


def test_repository_retrieval_and_missing_record() -> None:
    """Verify in-memory repository retrieval by venue_id and experience_id."""
    rec_hall = create_synthetic_accessible_hall()
    rec_castle = create_synthetic_venue_and_experience_with_scope_separation()

    repo = InMemoryVenueEvidenceRepository([rec_hall, rec_castle])

    # Retrieval by venue_id
    found_hall = repo.get_by_venue_id("syn_ven_heritage_hall")
    assert found_hall is not None
    assert found_hall.venue.name == "Synthetic Heritage Hall"

    # Retrieval by experience_id
    found_castle = repo.get_by_experience_id("syn_exp_tower_tour")
    assert found_castle is not None
    assert found_castle.venue.venue_id == "syn_ven_castle_museum"

    # Missing record behaviour
    assert repo.get_by_venue_id("nonexistent_venue") is None
    assert repo.get_by_experience_id("nonexistent_experience") is None

    # List all
    all_recs = repo.list_all()
    assert len(all_recs) == 2


def test_independence_from_qloo_affinity_data() -> None:
    """Verify evidence models contain no affinity scores or Qloo dependencies."""
    record = create_synthetic_accessible_hall()
    serialized = record.model_dump()

    # Must contain no cultural affinity, relevance scores, or Qloo fields
    forbidden_substrings = [
        "qloo",
        "affinity",
        "popularity",
        "cultural_fit",
        "recommendation",
        "score",
    ]
    for key in serialized:
        assert key.lower() not in forbidden_substrings

    for _attr, ev in record.venue_evidence.items():
        assert not hasattr(ev, "affinity_score")
        assert not hasattr(ev, "confidence_percentage")
