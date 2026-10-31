"""Clearly labelled synthetic venue and experience fixtures for testing.

NOTICE:
These fixtures are purely synthetic test data designed to validate schema integrity,
provenance preservation, claim scopes, and conflict handling.
They DO NOT represent real venue names, real pilot-city data, or actual audit reports.
"""

from datetime import UTC, datetime

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
    VenueIdentity,
)

# Reference timestamp for synthetic test assertions
SYNTHETIC_TIMESTAMP_A = datetime(2026, 3, 15, 10, 30, 0, tzinfo=UTC)
SYNTHETIC_TIMESTAMP_B = datetime(2026, 4, 1, 14, 0, 0, tzinfo=UTC)
SYNTHETIC_TIMESTAMP_C = datetime(2026, 4, 10, 9, 15, 0, tzinfo=UTC)


def create_synthetic_accessible_hall() -> EvidenceRecord:
    """Synthetic venue: 'Synthetic Heritage Hall' (verified entrance and elevator)."""
    venue = VenueIdentity(
        venue_id="syn_ven_heritage_hall",
        name="Synthetic Heritage Hall",
        address="100 Synthetic Way",
        locality="Testville",
        postal_code="99999",
        country_code="US",
    )

    official_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://synthetic.heritagehall.test/accessibility",
        title="Synthetic Heritage Hall Accessibility Statement",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )

    audit_source = EvidenceSource(
        source_type=SourceType.ON_SITE_AUDIT,
        url=None,
        title="Synthetic On-Site Audit Report #42",
        author_or_auditor="Auditor Synthetic-A",
        verified_at=SYNTHETIC_TIMESTAMP_B,
    )

    # 1. Step-free entrance claim
    entrance_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        details="Automatic sliding doors with zero threshold at Main Street entrance.",
        source=official_source,
    )
    entrance_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[entrance_claim],
        summary="Verified step-free entrance via main automatic doors.",
    )

    # 2. Elevator claim backed by on-site audit
    elevator_claim = EvidenceClaim(
        attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
        scope=ClaimScope.VENUE,
        value=True,
        details="Passenger elevator provides access to 2nd and 3rd-floor balconies.",
        source=audit_source,
    )
    elevator_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[elevator_claim],
        summary="Elevator operating between all floors.",
    )

    # 3. Restroom information unknown
    restroom_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary="No verified information regarding step-free restroom dimensions.",
    )

    return EvidenceRecord(
        venue=venue,
        venue_evidence={
            EvidenceAttribute.STEP_FREE_ENTRANCE: entrance_evidence,
            EvidenceAttribute.INTERNAL_ELEVATOR: elevator_evidence,
            EvidenceAttribute.STEP_FREE_RESTROOM: restroom_evidence,
        },
    )


def create_synthetic_venue_with_conflicting_claims() -> EvidenceRecord:
    """Synthetic venue: 'Synthetic Old Theater' having conflicting seating claims."""
    venue = VenueIdentity(
        venue_id="syn_ven_old_theater",
        name="Synthetic Old Theater",
        address="200 Brick Road",
        locality="Testville",
        postal_code="99999",
        country_code="US",
    )

    venue_web_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://synthetic.oldtheater.test/faq",
        title="Synthetic Old Theater FAQ",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )

    community_source = EvidenceSource(
        source_type=SourceType.COMMUNITY_REPORT,
        url="https://community.synthetic-access.test/report/108",
        title="Community User Review",
        author_or_auditor="Community Member B",
        verified_at=SYNTHETIC_TIMESTAMP_C,
    )

    # Source 1 claims seating is available in all galleries
    claim_1 = EvidenceClaim(
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        scope=ClaimScope.VENUE,
        value=True,
        details="Benches and portable chairs available throughout all halls.",
        source=venue_web_source,
    )

    # Source 2 claims seating is removed for general admission events
    claim_2 = EvidenceClaim(
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        scope=ClaimScope.VENUE,
        value=False,
        details="All floor seating was removed; standing room only during event.",
        source=community_source,
    )

    seating_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        status=EvidenceStatus.CONFLICTING,
        claims=[claim_1, claim_2],
        summary="Official site states seating exists; audit reported standing only.",
    )

    return EvidenceRecord(
        venue=venue,
        venue_evidence={
            EvidenceAttribute.SEATING_AVAILABLE: seating_evidence,
        },
    )


def create_synthetic_venue_and_experience_with_scope_separation() -> EvidenceRecord:
    """Synthetic record demonstrating clear claim scope separation.

    Venue has a step-free entrance, but the specific Experience (Historic Tower Tour)
    is NOT step-free.
    """
    venue = VenueIdentity(
        venue_id="syn_ven_castle_museum",
        name="Synthetic Castle Museum",
        address="500 High St",
        locality="Testville",
        postal_code="99999",
        country_code="US",
    )

    experience = ExperienceIdentity(
        experience_id="syn_exp_tower_tour",
        title="Historic Rooftop Tower Tour",
        venue_id="syn_ven_castle_museum",
        description="A specialized guided tour of the medieval watchtower.",
    )

    official_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://synthetic.castlemuseum.test/visit",
        title="Synthetic Castle Museum Official Guide",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )

    # Venue scope: ground floor entrance is step-free
    venue_entrance_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        details="Main courtyard entrance is ramped and step-free.",
        source=official_source,
    )
    venue_entrance_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[venue_entrance_claim],
        summary="Main courtyard entrance is step-free.",
    )

    # Experience scope: tower tour requires climbing 120 spiral stairs
    experience_entrance_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.EXPERIENCE,
        value=False,
        details="Access to the watchtower requires climbing 120 spiral stairs.",
        source=official_source,
    )
    experience_entrance_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[experience_entrance_claim],
        summary="Tower tour is not step-free.",
    )

    # Experience scope: sensory adapted session
    sensory_claim = EvidenceClaim(
        attribute=EvidenceAttribute.SENSORY_ADAPTED_SESSION,
        scope=ClaimScope.EXPERIENCE,
        value=True,
        details="Quiet morning session with lowered sound effects.",
        source=official_source,
    )
    sensory_evidence = AttributeEvidence(
        attribute=EvidenceAttribute.SENSORY_ADAPTED_SESSION,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[sensory_claim],
        summary="Sensory adapted tour session offered Sundays at 9am.",
    )

    return EvidenceRecord(
        venue=venue,
        experience=experience,
        venue_evidence={
            EvidenceAttribute.STEP_FREE_ENTRANCE: venue_entrance_evidence,
        },
        experience_evidence={
            EvidenceAttribute.STEP_FREE_ENTRANCE: experience_entrance_evidence,
            EvidenceAttribute.SENSORY_ADAPTED_SESSION: sensory_evidence,
        },
    )
