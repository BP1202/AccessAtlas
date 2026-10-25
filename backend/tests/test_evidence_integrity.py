"""Regression test suite enforcing evidence integrity and assessment invariants.

Validates that:
1. Qloo cultural affinity alone cannot satisfy practical requirements.
2. Unmapped and unreviewed candidates cannot receive fabricated assessments.
3. Missing evidence remains missing (never assumed supported or contradicted).
4. Expired, conflicting, insufficient-scope, and unsupported-condition evidence retains
   distinct classifications.
5. Optional requirements do not silently become mandatory.
6. An essential contradiction cannot be overridden by cultural relevance.
7. Evidence at venue scope is not automatically treated as evidence for experiences.
8. Approved Ahmedabad pilot venue distinctions are strictly enforced.
9. Source references and timezone-aware timestamps are preserved in relevant outputs.
"""

from datetime import UTC, datetime, timedelta

import pytest

from app.agent.models import (
    CandidateParticipationPlan,
    CandidateResolutionStatus,
    ResolvedCandidate,
)
from app.agent.planning import build_candidate_participation_plan
from app.agent.resolution import (
    CandidateMapping,
    InMemoryCandidateResolver,
    resolve_candidate,
)
from app.agent.threads import build_cultural_threads
from app.evidence.fixtures import (
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
    VenueIdentity,
)
from app.evidence.pilot_ahmedabad import (
    AHMEDABAD_RETRIEVAL_TIMESTAMP,
    QLOO_ID_CALICO,
    VENUE_ID_CALICO,
    create_ahmedabad_candidate_resolver,
    create_ahmedabad_pilot_repository,
    create_calico_museum_record,
    create_conflictorium_record,
    create_kasturbhai_lalbhai_record,
)
from app.evidence.repository import InMemoryVenueEvidenceRepository
from app.possibility.engine import PossibilityEngine
from app.possibility.models import (
    ConditionOperator,
    ParticipationRequirement,
    PossibilityOutcome,
    RequirementOutcome,
    RequirementPriority,
)
from app.qloo.models import QlooEntity, QlooEntityTag


def _make_eval_time() -> datetime:
    return datetime(2026, 10, 20, 12, 0, 0, tzinfo=UTC)


# ==============================================================================
# 1. Invariant: Qloo cultural affinity alone cannot satisfy practical requirements
# ==============================================================================


@pytest.mark.parametrize(
    "popularity,tags,affinity_match",
    [
        (1.0, [QlooEntityTag(id="t1", name="accessible")], True),
        (0.95, [QlooEntityTag(id="t2", name="wheelchair friendly")], False),
        (0.80, [], True),
    ],
)
def test_unmapped_candidate_with_high_affinity_cannot_satisfy_requirements(
    popularity: float,
    tags: list[QlooEntityTag],
    affinity_match: bool,
) -> None:
    """Even with maximum popularity, affinity tags, or matching interest, unmapped

    candidates receive no possibility assessment and no supported findings.
    """
    entity = QlooEntity(
        entity_id="QLOO_CULTURAL_DARLING",
        name="Beloved Cultural Pavilion",
        entity_type="cultural_venue",
        popularity=popularity,
        tags=tags,
    )
    resolved = ResolvedCandidate(
        qloo_entity=entity,
        status=CandidateResolutionStatus.UNMAPPED,
        resolution_notes="Unmapped entity without verified venue evidence.",
    )
    threads = build_cultural_threads(["world cinema"], [resolved])
    cultural_thread = threads[0] if threads else None
    requirements = [
        ParticipationRequirement(
            requirement_id="req_step_free",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
    ]

    plan: CandidateParticipationPlan = build_candidate_participation_plan(
        resolved,
        requirements,
        cultural_thread=cultural_thread,
    )

    assert plan.resolution_status == CandidateResolutionStatus.UNMAPPED
    assert plan.possibility_assessment is None
    assert plan.supported_findings == []
    assert len(plan.unresolved_gaps) == 1
    assert "No independently verified venue evidence" in plan.unresolved_gaps[0]
    assert plan.provenance_sources == []


def test_resolved_candidate_with_high_affinity_cannot_satisfy_unknown_attribute() -> (
    None
):
    """A resolved candidate with high affinity cannot convert an UNKNOWN attribute

    into a satisfied requirement.
    """
    engine = PossibilityEngine()
    record = create_calico_museum_record()
    eval_time = _make_eval_time()

    requirements = [
        ParticipationRequirement(
            requirement_id="req_elevator",
            attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
    ]

    assessment = engine.evaluate(record, requirements, eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE
    assert assessment.assessments[0].evidence_references == []


# ==============================================================================
# 2. Invariant: Unmapped and unreviewed candidates cannot receive fabricated assessments
# ==============================================================================


@pytest.mark.parametrize(
    "qloo_id,expected_status",
    [
        ("COMPLETELY_RANDOM_QLOO_ID", CandidateResolutionStatus.UNMAPPED),
        ("7A72825D-1C1F-4433-9113-AE6DADA44862", CandidateResolutionStatus.UNMAPPED),
        ("D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D", CandidateResolutionStatus.UNMAPPED),
    ],
)
def test_unmapped_and_excluded_candidates_never_receive_fabricated_assessments(
    qloo_id: str,
    expected_status: CandidateResolutionStatus,
) -> None:
    """Excluded and arbitrary Qloo entities remain unmapped with no fabricated

    evidence or possibility assessments.
    """
    resolver = create_ahmedabad_candidate_resolver()
    repo = create_ahmedabad_pilot_repository()
    entity = QlooEntity(
        entity_id=qloo_id,
        name="Unreviewed or Excluded Venue",
        entity_type="cultural_venue",
    )

    resolved = resolve_candidate(entity=entity, resolver=resolver, evidence_repo=repo)
    assert resolved.status == expected_status
    assert resolved.evidence_record is None
    assert resolved.possibility_assessment is None

    # Participation plan builder verification
    requirements = [
        ParticipationRequirement(
            requirement_id="req_res",
            attribute=EvidenceAttribute.RESERVATION_REQUIRED,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
    ]
    plan = build_candidate_participation_plan(resolved, requirements)
    assert plan.possibility_assessment is None
    assert plan.supported_findings == []
    assert plan.provenance_sources == []


def test_missing_evidence_record_produces_no_fabricated_plan() -> None:
    """A candidate mapped to a venue ID that does not exist in the repository

    produces MISSING_EVIDENCE without a possibility assessment.
    """
    mapping = CandidateMapping(
        qloo_entity_id="QLOO_ORPHAN",
        venue_id="ven_nonexistent_123",
        notes="Orphaned test mapping",
    )
    resolver = InMemoryCandidateResolver([mapping])
    repo = InMemoryVenueEvidenceRepository([])

    entity = QlooEntity(
        entity_id="QLOO_ORPHAN",
        name="Orphan Venue",
        entity_type="cultural_venue",
    )
    resolved = resolve_candidate(entity=entity, resolver=resolver, evidence_repo=repo)

    assert resolved.status == CandidateResolutionStatus.MISSING_EVIDENCE
    assert resolved.evidence_record is None

    plan = build_candidate_participation_plan(resolved, [])
    assert plan.resolution_status == CandidateResolutionStatus.MISSING_EVIDENCE
    assert plan.possibility_assessment is None
    assert plan.supported_findings == []
    assert "was not found in the local evidence repository" in plan.unresolved_gaps[0]


# ==============================================================================
# 3. Invariant: Missing evidence remains missing
# ==============================================================================


@pytest.mark.parametrize(
    "attr,expected_val",
    [
        (EvidenceAttribute.STEP_FREE_ENTRANCE, True),
        (EvidenceAttribute.STEP_FREE_ENTRANCE, False),
        (EvidenceAttribute.INTERNAL_ELEVATOR, True),
        (EvidenceAttribute.INTERNAL_ELEVATOR, False),
        (EvidenceAttribute.STEP_FREE_RESTROOM, True),
        (EvidenceAttribute.STEP_FREE_RESTROOM, False),
        (EvidenceAttribute.SERVICE_ANIMAL_POLICY, True),
        (EvidenceAttribute.SERVICE_ANIMAL_POLICY, False),
        (EvidenceAttribute.SEATING_AVAILABLE, True),
        (EvidenceAttribute.SEATING_AVAILABLE, False),
        (EvidenceAttribute.CONTACT_FOR_ACCESS_INFO, True),
        (EvidenceAttribute.CONTACT_FOR_ACCESS_INFO, False),
    ],
)
def test_missing_evidence_remains_missing_regardless_of_expected_value(
    attr: EvidenceAttribute,
    expected_val: bool,
) -> None:
    """Silence is never converted into a negative or positive claim.

    Evaluating an attribute with UNKNOWN status against expected_value=True or False
    must ALWAYS yield MISSING_EVIDENCE, never SUPPORTED or CONTRADICTED.
    """
    engine = PossibilityEngine()
    record = create_calico_museum_record()
    eval_time = _make_eval_time()

    req = ParticipationRequirement(
        requirement_id=f"req_{attr.value}_{expected_val}",
        attribute=attr,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=expected_val,
    )

    assessment = engine.evaluate(record, [req], eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE
    assert assessment.assessments[0].evidence_references == []


def test_attribute_omitted_entirely_from_record_is_missing_evidence() -> None:
    """An attribute not declared in venue_evidence evaluates as MISSING_EVIDENCE."""
    engine = PossibilityEngine()
    venue = VenueIdentity(
        venue_id="ven_sparse",
        name="Sparse Venue",
        address="1 Main St",
        locality="Ahmedabad",
        country_code="IN",
    )
    record = EvidenceRecord(venue=venue, venue_evidence={})
    eval_time = _make_eval_time()

    req = ParticipationRequirement(
        requirement_id="req_sparse",
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


# ==============================================================================
# 4. Invariant: Distinct classification of non-supported outcomes
# ==============================================================================


def test_expired_evidence_retains_distinct_classification() -> None:
    """Evidence past valid_until or max_evidence_age produces EXPIRED_EVIDENCE."""
    engine = PossibilityEngine(max_evidence_age=timedelta(days=365))
    eval_time = _make_eval_time()

    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://example.com/source",
        title="Source",
        verified_at=datetime(2024, 1, 1, tzinfo=UTC),
    )
    claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        value=True,
        source=source,
        valid_until=datetime(2025, 1, 1, tzinfo=UTC),
    )
    attr_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[claim],
    )
    record = EvidenceRecord(
        venue=VenueIdentity(
            venue_id="ven_expired",
            name="Expired Venue",
            address="1 St",
            locality="City",
        ),
        venue_evidence={EvidenceAttribute.STEP_FREE_ENTRANCE: attr_ev},
    )

    req = ParticipationRequirement(
        requirement_id="req_expired",
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.EXPIRED_EVIDENCE
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


def test_conflicting_evidence_retains_distinct_classification() -> None:
    """Discrepant sources produce CONFLICTING_EVIDENCE without guessing a winner."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_with_conflicting_claims()
    eval_time = _make_eval_time()

    req = ParticipationRequirement(
        requirement_id="req_conflict",
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.CONFLICTING_EVIDENCE
    assert len(assessment.assessments[0].evidence_references) >= 2
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


def test_insufficient_scope_retains_distinct_classification() -> None:
    """Requests mismatching evidence scope boundaries produce INSUFFICIENT_SCOPE."""
    engine = PossibilityEngine()
    eval_time = _make_eval_time()

    # Case A: Experience-scoped requirement on a record with no associated experience
    calico_no_exp = create_calico_museum_record()
    req_exp_no_identity = ParticipationRequirement(
        requirement_id="req_exp_no_id",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.EXPERIENCE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )
    ass_a = engine.evaluate(calico_no_exp, [req_exp_no_identity], eval_time)
    assert ass_a.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE
    assert "has no associated experience identity" in ass_a.assessments[0].explanation

    # Case B: Venue-scoped requirement for an attribute that only exists at
    # experience scope
    record_with_scope = create_synthetic_venue_and_experience_with_scope_separation()
    req_venue_exp_only = ParticipationRequirement(
        requirement_id="req_venue_sensory",
        attribute=EvidenceAttribute.SENSORY_ADAPTED_SESSION,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )
    ass_b = engine.evaluate(record_with_scope, [req_venue_exp_only], eval_time)
    assert ass_b.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE
    assert "is recorded at experience scope" in ass_b.assessments[0].explanation

    assert ass_a.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert ass_b.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


def test_unsupported_condition_retains_distinct_classification() -> None:
    """Evaluating a non-comparable claim value produces UNSUPPORTED_CONDITION."""
    engine = PossibilityEngine()
    eval_time = _make_eval_time()

    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://example.com/source",
        title="Source",
        verified_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    claim = EvidenceClaim(
        attribute=EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        scope=ClaimScope.VENUE,
        value="Contact staff upon arrival for access ramp deployment",
        source=source,
    )
    attr_ev = AttributeEvidence(
        attribute=EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[claim],
    )
    record = EvidenceRecord(
        venue=VenueIdentity(
            venue_id="ven_unsupported",
            name="Unsupported Venue",
            address="1 St",
            locality="City",
        ),
        venue_evidence={EvidenceAttribute.CONTACT_FOR_ACCESS_INFO: attr_ev},
    )

    req = ParticipationRequirement(
        requirement_id="req_text_vs_bool",
        attribute=EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,  # comparing boolean to free-text description
    )

    assessment = engine.evaluate(record, [req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.UNSUPPORTED_CONDITION
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


# ==============================================================================
# 5. Invariant: Optional requirements do not silently become mandatory
# ==============================================================================


@pytest.mark.parametrize(
    "optional_attr,expected_opt_value,optional_outcome",
    [
        (EvidenceAttribute.WHEELCHAIR_ACCESS, True, RequirementOutcome.CONTRADICTED),
        (
            EvidenceAttribute.STEP_FREE_ENTRANCE,
            True,
            RequirementOutcome.MISSING_EVIDENCE,
        ),
    ],
)
def test_unsupported_optional_requirements_do_not_block_verified_fit(
    optional_attr: EvidenceAttribute,
    expected_opt_value: bool,
    optional_outcome: RequirementOutcome,
) -> None:
    """When mandatory requirements are supported, unsupported optional requirements

    record a review recommendation but preserve VERIFIED_FIT.
    """
    engine = PossibilityEngine()
    record = create_calico_museum_record()
    eval_time = _make_eval_time()

    mandatory_req = ParticipationRequirement(
        requirement_id="req_mandatory_reservation",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,  # Calico requires reservation -> SUPPORTED
    )
    optional_req = ParticipationRequirement(
        requirement_id="req_optional_pref",
        attribute=optional_attr,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.OPTIONAL,
        operator=ConditionOperator.EQUALS,
        expected_value=expected_opt_value,
    )

    assessment = engine.evaluate(record, [mandatory_req, optional_req], eval_time)

    assert assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    ass_map = {a.requirement_id: a for a in assessment.assessments}
    assert ass_map["req_mandatory_reservation"].outcome == RequirementOutcome.SUPPORTED
    assert ass_map["req_optional_pref"].outcome == optional_outcome
    assert "optional preference(s) need review" in assessment.summary


def test_only_optional_requirements_cannot_produce_verified_fit() -> None:
    """Evaluating zero mandatory requirements and only optional requirements

    must produce NEEDS_CONFIRMATION, never VERIFIED_FIT.
    """
    engine = PossibilityEngine()
    record = create_calico_museum_record()
    eval_time = _make_eval_time()

    optional_req = ParticipationRequirement(
        requirement_id="req_only_optional",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.OPTIONAL,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [optional_req], eval_time)
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert "No mandatory requirements were provided" in assessment.summary


# ==============================================================================
# 6. Invariant: Essential contradiction cannot be overridden by cultural relevance
# ==============================================================================


def test_essential_contradiction_cannot_be_overridden_by_cultural_relevance() -> None:
    """A mandatory requirement contradiction takes absolute precedence over cultural

    relevance, supported optional requirements, and popularity.
    """
    engine = PossibilityEngine()
    record = create_calico_museum_record()
    eval_time = _make_eval_time()

    # Calico officially states unable to offer wheelchair access
    mandatory_contradicted = ParticipationRequirement(
        requirement_id="req_wheelchair",
        attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )
    optional_supported = ParticipationRequirement(
        requirement_id="req_reservation",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.OPTIONAL,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(
        record,
        [mandatory_contradicted, optional_supported],
        eval_time,
    )

    assert assessment.aggregate_outcome == PossibilityOutcome.REQUIREMENT_CONFLICT
    ass_map = {a.requirement_id: a for a in assessment.assessments}
    assert ass_map["req_wheelchair"].outcome == RequirementOutcome.CONTRADICTED
    assert ass_map["req_reservation"].outcome == RequirementOutcome.SUPPORTED
    assert "Requirement conflict identified" in assessment.summary


# ==============================================================================
# 7. Invariant: Venue scope evidence not automatically applied to experiences
# ==============================================================================


def test_venue_scope_evidence_not_automatically_applied_to_experience() -> None:
    """Venue-level access attributes do not satisfy experience-scoped requirements."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://example.com/venue",
        title="Venue Site",
        verified_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    venue_claim = EvidenceClaim(
        attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
        scope=ClaimScope.VENUE,
        value=True,
        source=source,
    )
    record = EvidenceRecord(
        venue=VenueIdentity(
            venue_id="ven_scope", name="Venue", address="A", locality="L"
        ),
        experience=ExperienceIdentity(
            experience_id="exp_scope", venue_id="ven_scope", title="Tour"
        ),
        venue_evidence={
            EvidenceAttribute.STEP_FREE_RESTROOM: AttributeEvidence(
                attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
                status=EvidenceStatus.SOURCE_BACKED,
                claims=[venue_claim],
            )
        },
        experience_evidence={},
    )
    exp_req = ParticipationRequirement(
        requirement_id="req_exp_restroom",
        attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
        scope=ClaimScope.EXPERIENCE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [exp_req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE
    assert (
        "Venue access does not guarantee experience access"
        in assessment.assessments[0].explanation
    )
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


def test_experience_scope_evidence_not_automatically_applied_to_venue() -> None:
    """Experience-level access attributes do not satisfy venue-scoped requirements."""
    engine = PossibilityEngine()
    record = create_synthetic_venue_and_experience_with_scope_separation()
    eval_time = _make_eval_time()

    # The experience has SENSORY_ADAPTED_SESSION at EXPERIENCE scope, but venue
    # does not have it at VENUE scope.
    venue_req = ParticipationRequirement(
        requirement_id="req_venue_sensory",
        attribute=EvidenceAttribute.SENSORY_ADAPTED_SESSION,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(record, [venue_req], eval_time)
    assert assessment.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE
    assert "is recorded at experience scope" in assessment.assessments[0].explanation
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


# ==============================================================================
# 8. Required pilot regression cases for Ahmedabad pilot distinctions
# ==============================================================================


class TestAhmedabadPilotEvidenceIntegrity:
    """Regression suite for Calico Museum, Kasturbhai Lalbhai, and Conflictorium."""

    eval_time = _make_eval_time()

    def test_calico_wheelchair_policy_not_invented_as_entrance_or_elevator(
        self,
    ) -> None:
        """Calico's operational wheelchair limitation must not invent entrance threshold

        or elevator facts.
        """
        engine = PossibilityEngine()
        calico = create_calico_museum_record()

        # Wheelchair access is contradicted
        wc_req = ParticipationRequirement(
            requirement_id="req_wc",
            attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
        ass_wc = engine.evaluate_requirement(calico, wc_req, self.eval_time)
        assert ass_wc.outcome == RequirementOutcome.CONTRADICTED

        # Step-free entrance must remain MISSING_EVIDENCE (UNKNOWN)
        entrance_req = ParticipationRequirement(
            requirement_id="req_ent",
            attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
        ass_ent = engine.evaluate_requirement(calico, entrance_req, self.eval_time)
        assert ass_ent.outcome == RequirementOutcome.MISSING_EVIDENCE

        # Internal elevator must remain MISSING_EVIDENCE (UNKNOWN)
        lift_req = ParticipationRequirement(
            requirement_id="req_lift",
            attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
        ass_lift = engine.evaluate_requirement(calico, lift_req, self.eval_time)
        assert ass_lift.outcome == RequirementOutcome.MISSING_EVIDENCE

    def test_calico_90_day_window_is_opening_horizon_not_minimum_advance_booking(
        self,
    ) -> None:
        """Calico reservation claim details must preserve that the 90-day window

        is the opening horizon, not a 90-day minimum advance notice.
        """
        calico = create_calico_museum_record()
        res_ev = calico.venue_evidence[EvidenceAttribute.RESERVATION_REQUIRED]

        assert res_ev.status == EvidenceStatus.SOURCE_BACKED
        claim = res_ev.claims[0]
        assert claim.value is True
        assert "opens 90 days in advance" in claim.details
        assert "not a minimum 90-day advance booking requirement" in claim.details
        assert "strictly 20 persons per tour" in claim.details

    def test_kasturbhai_guided_appointment_does_not_establish_unknown_physical_access(
        self,
    ) -> None:
        """Kasturbhai compulsory tour reservation must not establish unknown

        physical-access attributes.
        """
        engine = PossibilityEngine()
        klm = create_kasturbhai_lalbhai_record()

        # Reservation required is supported
        res_req = ParticipationRequirement(
            requirement_id="req_klm_res",
            attribute=EvidenceAttribute.RESERVATION_REQUIRED,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
        ass_res = engine.evaluate_requirement(klm, res_req, self.eval_time)
        assert ass_res.outcome == RequirementOutcome.SUPPORTED

        # Walk-in requirement is contradicted
        walkin_req = ParticipationRequirement(
            requirement_id="req_klm_walkin",
            attribute=EvidenceAttribute.RESERVATION_REQUIRED,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=False,
        )
        ass_walkin = engine.evaluate_requirement(klm, walkin_req, self.eval_time)
        assert ass_walkin.outcome == RequirementOutcome.CONTRADICTED

        # Physical access attributes remain strictly unknown
        for attr in [
            EvidenceAttribute.STEP_FREE_ENTRANCE,
            EvidenceAttribute.INTERNAL_ELEVATOR,
            EvidenceAttribute.SEATING_AVAILABLE,
            EvidenceAttribute.STEP_FREE_RESTROOM,
            EvidenceAttribute.SERVICE_ANIMAL_POLICY,
            EvidenceAttribute.COMPANION_ENTRY_POLICY,
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        ]:
            req = ParticipationRequirement(
                requirement_id=f"req_klm_{attr.value}",
                attribute=attr,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                operator=ConditionOperator.EQUALS,
                expected_value=True,
            )
            ass = engine.evaluate_requirement(klm, req, self.eval_time)
            assert ass.outcome == RequirementOutcome.MISSING_EVIDENCE

    def test_conflictorium_ordinary_visit_and_special_event_rsvp_remain_distinct(
        self,
    ) -> None:
        """Conflictorium ordinary visits are free walk-in (reservation_required=False),

        while workshops or special events may require RSVP.
        """
        engine = PossibilityEngine()
        cnf = create_conflictorium_record()

        # Walk-in for ordinary visit is supported
        walkin_req = ParticipationRequirement(
            requirement_id="req_cnf_walkin",
            attribute=EvidenceAttribute.RESERVATION_REQUIRED,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=False,
        )
        ass_walkin = engine.evaluate_requirement(cnf, walkin_req, self.eval_time)
        assert ass_walkin.outcome == RequirementOutcome.SUPPORTED

        # Mandatory reservation for ordinary visit is contradicted
        res_req = ParticipationRequirement(
            requirement_id="req_cnf_res",
            attribute=EvidenceAttribute.RESERVATION_REQUIRED,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )
        ass_res = engine.evaluate_requirement(cnf, res_req, self.eval_time)
        assert ass_res.outcome == RequirementOutcome.CONTRADICTED

        # Claim details preserve special-event distinction
        claim = cnf.venue_evidence[EvidenceAttribute.RESERVATION_REQUIRED].claims[0]
        assert "free and open to the public without reservations" in claim.details
        assert "Special workshops, panel dialogues, or performances" in claim.details

    @pytest.mark.parametrize(
        "venue_factory",
        [
            create_calico_museum_record,
            create_kasturbhai_lalbhai_record,
            create_conflictorium_record,
        ],
    )
    @pytest.mark.parametrize(
        "undocumented_attr",
        [
            EvidenceAttribute.STEP_FREE_ENTRANCE,
            EvidenceAttribute.INTERNAL_ELEVATOR,
            EvidenceAttribute.STEP_FREE_RESTROOM,
            EvidenceAttribute.SERVICE_ANIMAL_POLICY,
            EvidenceAttribute.SEATING_AVAILABLE,
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        ],
    )
    def test_all_three_venues_preserve_undocumented_attributes_as_missing(
        self,
        venue_factory: object,
        undocumented_attr: EvidenceAttribute,
    ) -> None:
        """Across all three pilot venues, undocumented accessibility attributes must

        remain strictly UNKNOWN and evaluate as MISSING_EVIDENCE.
        """
        engine = PossibilityEngine()
        record: EvidenceRecord = venue_factory()  # type: ignore[operator]

        req = ParticipationRequirement(
            requirement_id=f"req_{undocumented_attr.value}",
            attribute=undocumented_attr,
            scope=ClaimScope.VENUE,
            priority=RequirementPriority.MANDATORY,
            operator=ConditionOperator.EQUALS,
            expected_value=True,
        )

        assessment = engine.evaluate(record, [req], self.eval_time)
        assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
        ass = assessment.assessments[0]
        assert ass.outcome == RequirementOutcome.MISSING_EVIDENCE
        assert ass.evidence_references == []


# ==============================================================================
# 9. Invariant: Preservation of source provenance and timestamps
# ==============================================================================


def test_source_references_and_timestamps_are_preserved_in_assessment() -> None:
    """Assessment preserves exact source provenance and timezone-aware timestamps."""
    engine = PossibilityEngine()
    calico = create_calico_museum_record()
    eval_time = _make_eval_time()

    req = ParticipationRequirement(
        requirement_id="req_res",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )

    assessment = engine.evaluate(calico, [req], eval_time)
    assert assessment.evaluation_time == eval_time
    assert len(assessment.assessments[0].evidence_references) == 1

    claim = assessment.assessments[0].evidence_references[0]
    assert claim.source.url == "https://www.calicomuseum.org/tour-guidelines/"
    assert claim.source.source_type == SourceType.OFFICIAL_VENUE_WEBSITE
    assert claim.source.verified_at.tzinfo is not None
    assert claim.source.verified_at == AHMEDABAD_RETRIEVAL_TIMESTAMP


def test_plan_builder_preserves_unique_provenance_sources_and_wheelchair_advisory() -> (
    None
):
    """Plan builder collects unique sources and surfaces wheelchair advisories."""
    calico = create_calico_museum_record()
    engine = PossibilityEngine()
    eval_time = _make_eval_time()

    req = ParticipationRequirement(
        requirement_id="req_res",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        priority=RequirementPriority.MANDATORY,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
    )
    assessment = engine.evaluate(calico, [req], eval_time)

    resolved = ResolvedCandidate(
        qloo_entity=QlooEntity(
            entity_id=QLOO_ID_CALICO,
            name="Calico Museum of Textiles",
            entity_type="cultural_venue",
        ),
        status=CandidateResolutionStatus.RESOLVED,
        venue_id=VENUE_ID_CALICO,
        evidence_record=calico,
        possibility_assessment=assessment,
    )

    plan = build_candidate_participation_plan(resolved, [req])

    assert len(plan.provenance_sources) >= 1
    # Check that source URL and timestamp are intact
    src = plan.provenance_sources[0]
    assert src.url == "https://www.calicomuseum.org/tour-guidelines/"
    assert src.verified_at == AHMEDABAD_RETRIEVAL_TIMESTAMP
    assert src.verified_at.tzinfo is not None

    # Check wheelchair advisory is present in suggested next actions
    advisories = [a for a in plan.suggested_next_actions if "Venue advisory" in a]
    assert len(advisories) == 1
    assert "unable to offer wheelchair access" in advisories[0]
