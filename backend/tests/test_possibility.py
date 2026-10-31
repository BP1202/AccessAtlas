"""Tests for the deterministic Possibility Engine.

Validates requirement models, condition evaluations, aggregate precedence rules,
provenance preservation, scope separation, freshness, and independence from Qloo.
"""

from datetime import UTC, datetime, timedelta

import pytest

from app.evidence.fixtures import (
    SYNTHETIC_TIMESTAMP_A,
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
    SourceType,
    VenueIdentity,
)
from app.possibility.engine import PossibilityEngine
from app.possibility.models import (
    ConditionOperator,
    ParticipationRequirement,
    PossibilityAssessment,
    PossibilityOutcome,
    RequirementOutcome,
    RequirementPriority,
)


def _make_eval_time() -> datetime:
    return datetime(2026, 4, 15, 12, 0, 0, tzinfo=UTC)


def test_all_mandatory_requirements_supported():
    """All mandatory requirements are satisfied by verified evidence -> VERIFIED_FIT."""
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
        ParticipationRequirement(
            requirement_id="req_elevator",
            attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    assert len(assessment.assessments) == 2
    assert all(
        a.outcome == RequirementOutcome.SUPPORTED for a in assessment.assessments
    )
    assert "verified" in assessment.summary.lower()


def test_mandatory_requirement_contradicted_by_evidence():
    """A mandatory requirement contradicted by evidence -> REQUIREMENT_CONFLICT."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    # The historic tower tour is NOT step-free (requires 120 spiral stairs)
    requirements = [
        ParticipationRequirement(
            requirement_id="req_tour_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.EXPERIENCE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.REQUIREMENT_CONFLICT
    assert assessment.assessments[0].outcome == RequirementOutcome.CONTRADICTED
    assert len(assessment.assessments[0].evidence_references) == 1
    assert assessment.assessments[0].evidence_references[0].value is False


def test_unknown_mandatory_requirement():
    """A mandatory requirement with UNKNOWN evidence -> NEEDS_CONFIRMATION."""
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    eval_time = _make_eval_time()

    # Step-free restroom is marked UNKNOWN in synthetic accessible hall
    requirements = [
        ParticipationRequirement(
            requirement_id="req_restroom",
            attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE
    assert assessment.assessments[0].confirmation_need is not None


def test_mixed_mandatory_conflict_and_unknown():
    """When one mandatory requirement is contradicted and another is unknown,

    REQUIREMENT_CONFLICT takes absolute precedence over NEEDS_CONFIRMATION.
    """
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    requirements = [
        # Contradicted by experience evidence (120 stairs)
        ParticipationRequirement(
            requirement_id="req_tour_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.EXPERIENCE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
        # Unknown in experience evidence (restroom not recorded)
        ParticipationRequirement(
            requirement_id="req_tour_restroom",
            attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
            scope=ClaimScope.EXPERIENCE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.REQUIREMENT_CONFLICT
    outcomes = {a.requirement_id: a.outcome for a in assessment.assessments}
    assert outcomes["req_tour_step_free"] == RequirementOutcome.CONTRADICTED
    assert outcomes["req_tour_restroom"] == RequirementOutcome.MISSING_EVIDENCE


def test_optional_preference_contradicted_without_disqualification():
    """Contradicted optional preference does NOT disqualify an experience

    when all mandatory requirements are supported -> VERIFIED_FIT.
    """
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    requirements = [
        # Mandatory requirement supported (venue entrance is step-free)
        ParticipationRequirement(
            requirement_id="req_venue_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
        # Optional preference contradicted (tour itself has stairs)
        ParticipationRequirement(
            requirement_id="pref_tour_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.EXPERIENCE,
            priority=RequirementPriority.OPTIONAL,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    outcomes = {a.requirement_id: a.outcome for a in assessment.assessments}
    assert outcomes["req_venue_step_free"] == RequirementOutcome.SUPPORTED
    assert outcomes["pref_tour_step_free"] == RequirementOutcome.CONTRADICTED
    assert "pref_tour_step_free (contradicted)" in assessment.summary


def test_conflicting_source_claims():
    """Conflicting claims for a mandatory requirement -> NEEDS_CONFIRMATION."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_with_conflicting_claims()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_seating",
            attribute=EvidenceAttribute.SEATING_AVAILABLE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.CONFLICTING_EVIDENCE
    assert len(assessment.assessments[0].evidence_references) == 2


def test_expired_evidence_handling():
    """Claims past valid_until are flagged as EXPIRED_EVIDENCE -> NEEDS_CONFIRMATION."""
    engine = PossibilityEngine()
    eval_time = datetime(2026, 6, 1, 12, 0, 0, tzinfo=UTC)

    venue = VenueIdentity(
        venue_id="syn_ven_expired",
        name="Synthetic Expired Venue",
        address="100 Time Rd",
        locality="Testville",
    )
    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://synthetic.example.test/access",
        title="Official Statement",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )
    claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        source=source,
        valid_until=datetime(
            2026, 5, 1, 0, 0, 0, tzinfo=UTC
        ),  # Expired before eval_time
    )
    attr_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[claim],
    )
    record = EvidenceRecord(
        venue=venue,
        venue_evidence={EvidenceAttribute.STEP_FREE_ENTRANCE: attr_ev},
    )

    requirements = [
        ParticipationRequirement(
            requirement_id="req_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.EXPIRED_EVIDENCE
    assert assessment.assessments[0].confirmation_need is not None


def test_future_evaluation_time_behavior():
    """Future evaluation date after validity expiration transitions to EXPIRED."""
    engine = PossibilityEngine()
    expiry = datetime(2026, 5, 1, 0, 0, 0, tzinfo=UTC)

    venue = VenueIdentity(
        venue_id="syn_ven_future",
        name="Synthetic Future Venue",
        address="200 Future Rd",
        locality="Testville",
    )
    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://synthetic.example.test/future",
        title="Official Statement",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )
    claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        source=source,
        valid_until=expiry,
    )
    record = EvidenceRecord(
        venue=venue,
        venue_evidence={
            EvidenceAttribute.STEP_FREE_ENTRANCE: AttributeEvidence(
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                status=EvidenceStatus.SOURCE_BACKED,
                claims=[claim],
            )
        },
    )
    req = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        )
    ]

    # Before expiration: VERIFIED_FIT
    time_before = datetime(2026, 4, 15, 0, 0, 0, tzinfo=UTC)
    result_before = engine.evaluate(record, req, time_before)
    assert result_before.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT

    # After expiration: NEEDS_CONFIRMATION
    time_after = datetime(2026, 5, 2, 0, 0, 0, tzinfo=UTC)
    result_after = engine.evaluate(record, req, time_after)
    assert result_after.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert result_after.assessments[0].outcome == RequirementOutcome.EXPIRED_EVIDENCE


def test_wrong_scope_evidence():
    """Venue-scoped evidence does not satisfy experience requirement."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    # The venue has no sensory_adapted_session (it is only at the experience scope)
    venue_req = [
        ParticipationRequirement(
            requirement_id="req_venue_sensory",
            attribute=EvidenceAttribute.SENSORY_ADAPTED_SESSION,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        )
    ]
    venue_result = engine.evaluate(record, venue_req, eval_time)
    assert venue_result.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert venue_result.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE


def test_unsupported_or_ambiguous_conditions():
    """Ambiguous free-text claim produces UNSUPPORTED_CONDITION."""
    engine = PossibilityEngine()
    venue = VenueIdentity(
        venue_id="syn_ven_ambiguous",
        name="Synthetic Ambiguous Venue",
        address="300 Vague Ln",
        locality="Testville",
    )
    source = EvidenceSource(
        source_type=SourceType.ON_SITE_AUDIT,
        title="Audit Note",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )
    # Free-text value that cannot be deterministically evaluated as bool
    claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value="There is a small ramp with minor lip",
        source=source,
    )
    record = EvidenceRecord(
        venue=venue,
        venue_evidence={
            EvidenceAttribute.STEP_FREE_ENTRANCE: AttributeEvidence(
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                status=EvidenceStatus.SOURCE_BACKED,
                claims=[claim],
            )
        },
    )

    requirements = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,  # expecting strict boolean
        )
    ]

    assessment = engine.evaluate(record, requirements, _make_eval_time())
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.UNSUPPORTED_CONDITION


def test_multiple_requirements_mapped_to_separate_attributes():
    """Engine evaluates multiple requirements mapped across attributes independently."""
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_1",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        ),
        ParticipationRequirement(
            requirement_id="req_2",
            attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        ),
        ParticipationRequirement(
            requirement_id="req_3",
            attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.OPTIONAL,
            expected_value=True,
        ),
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    # Mandatory 1 and 2 are SUPPORTED -> VERIFIED_FIT even with optional MISSING
    assert assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    assert len(assessment.assessments) == 3
    assert assessment.assessments[0].outcome == RequirementOutcome.SUPPORTED
    assert assessment.assessments[1].outcome == RequirementOutcome.SUPPORTED
    assert assessment.assessments[2].outcome == RequirementOutcome.MISSING_EVIDENCE


def test_no_mandatory_requirements():
    """When no mandatory requirements are provided, engine returns NEEDS_CONFIRMATION

    to avoid implying an unevidenced assessment proves general accessibility.
    """
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    eval_time = _make_eval_time()

    # Empty list
    empty_result = engine.evaluate(record, [], eval_time)
    assert empty_result.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert "no mandatory" in empty_result.summary.lower()

    # Only optional requirements
    optional_only = [
        ParticipationRequirement(
            requirement_id="opt_1",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.OPTIONAL,
            expected_value=True,
        )
    ]
    opt_result = engine.evaluate(record, optional_only, eval_time)
    assert opt_result.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert "no mandatory" in opt_result.summary.lower()


def test_deterministic_repeated_evaluation():
    """Repeated evaluation with identical inputs produces identical results."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        ),
        ParticipationRequirement(
            requirement_id="req_tour",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.EXPERIENCE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        ),
    ]

    results = [engine.evaluate(record, requirements, eval_time) for _ in range(5)]

    first = results[0]
    for other in results[1:]:
        assert other.aggregate_outcome == first.aggregate_outcome
        assert other.summary == first.summary
        assert len(other.assessments) == len(first.assessments)
        for a, b in zip(other.assessments, first.assessments, strict=True):
            assert a.outcome == b.outcome
            assert a.explanation == b.explanation


def test_evidence_references_preserved():
    """Assessment retains original EvidenceClaim objects with full source provenance."""
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            expected_value=True,
        )
    ]

    assessment = engine.evaluate(record, requirements, eval_time)
    refs = assessment.assessments[0].evidence_references

    assert len(refs) == 1
    claim = refs[0]
    assert claim.source.url == "https://synthetic.heritagehall.test/accessibility"
    assert claim.source.source_type == SourceType.OFFICIAL_VENUE_WEBSITE
    assert claim.source.verified_at == SYNTHETIC_TIMESTAMP_A
    assert claim.value is True


def test_independence_from_qloo_affinity_data():
    """Possibility engine operates strictly on EvidenceRecord and requirements,

    completely free from Qloo models, cultural affinity vectors, or API dependencies.
    """
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()

    # Assert PossibilityEngine has no Qloo dependencies or attributes
    assert not hasattr(engine, "qloo_client")
    assert not hasattr(engine, "affinity_threshold")

    req = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            expected_value=True,
        )
    ]
    res = engine.evaluate(record, req, _make_eval_time())
    assert isinstance(res, PossibilityAssessment)
    assert res.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT


def test_evidence_model_valid_until_timezone_enforcement():
    """EvidenceClaim rejects naive datetimes for valid_until."""
    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        title="Source",
        verified_at=SYNTHETIC_TIMESTAMP_A,
    )

    # Naive datetime must raise ValueError
    with pytest.raises(ValueError, match="valid_until must be timezone-aware"):
        EvidenceClaim(
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            value=True,
            source=source,
            valid_until=datetime(2026, 12, 31, 23, 59, 59),  # naive!
        )

    # Timezone-aware datetime must succeed
    valid_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        source=source,
        valid_until=datetime(2026, 12, 31, 23, 59, 59, tzinfo=UTC),
    )
    assert valid_claim.valid_until.tzinfo is not None


def test_evaluation_time_timezone_enforcement():
    """Engine rejects naive evaluation_time datetimes with ValueError."""
    engine = PossibilityEngine()
    record = create_synthetic_accessible_hall()
    req = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            expected_value=True,
        )
    ]

    with pytest.raises(ValueError, match="evaluation_time must be timezone-aware"):
        engine.evaluate(record, req, datetime(2026, 4, 15, 12, 0, 0))  # naive!


def test_max_evidence_age_policy():
    """Setting max_evidence_age flags claims older than policy as EXPIRED_EVIDENCE."""
    # Policy: claims older than 7 days are stale
    engine = PossibilityEngine(max_evidence_age=timedelta(days=7))
    record = create_synthetic_accessible_hall()
    # SYNTHETIC_TIMESTAMP_A is 2026-03-15
    # Eval time is 2026-04-15 (31 days later)
    eval_time = _make_eval_time()

    req = [
        ParticipationRequirement(
            requirement_id="req_entrance",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            expected_value=True,
        )
    ]

    assessment = engine.evaluate(record, req, eval_time)
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.EXPIRED_EVIDENCE
