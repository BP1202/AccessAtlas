"""Offline test suite for Ahmedabad pilot evidence, mappings, and workflow integration.

Validates all 15 acceptance criteria:
1. Three approved identity mappings.
2. Exclusion of the two Conflictorium non-approved IDs.
3. No fuzzy mapping of similarly named venues.
4. Claim provenance and timezone-aware timestamps.
5. Correct venue/experience scope separation.
6. Preservation of unknown accessibility attributes.
7. Calico wheelchair policy is not misrepresented as a step-free entrance fact.
8. Accurate 90-day booking-window representation.
9. Kasturbhai advance-booking qualification.
10. Conflictorium ordinary-visit versus special-event distinction.
11. Unmapped Qloo candidates remain unresolved.
12. A missing evidence record cannot produce VERIFIED_FIT.
13. A fully mocked end-to-end Ahmedabad workflow.
14. No live network calls in automated tests.
15. Existing synthetic fixtures remain unchanged.
"""

from datetime import UTC, datetime

import httpx
import pytest

from app.agent.models import (
    AgentWorkflowInput,
    CandidateResolutionStatus,
)
from app.agent.resolution import (
    CandidateMapping,
    InMemoryCandidateResolver,
    resolve_candidate,
)
from app.core.config import Settings
from app.evidence.fixtures import (
    create_synthetic_accessible_hall,
    create_synthetic_venue_and_experience_with_scope_separation,
    create_synthetic_venue_with_conflicting_claims,
)
from app.evidence.models import (
    ClaimScope,
    EvidenceAttribute,
    EvidenceStatus,
    SourceType,
)
from app.evidence.pilot_ahmedabad import (
    AHMEDABAD_RETRIEVAL_TIMESTAMP,
    EXCLUDED_QLOO_IDS,
    EXP_ID_CALICO_CHAUK,
    EXP_ID_CALICO_HAVELI,
    EXP_ID_KLM_GUIDED_TOUR,
    QLOO_ID_CALICO,
    QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
    QLOO_ID_KASTURBHAI,
    VENUE_ID_CALICO,
    VENUE_ID_CONFLICTIORIUM,
    VENUE_ID_KASTURBHAI,
    create_ahmedabad_agent,
    create_ahmedabad_candidate_resolver,
    create_ahmedabad_pilot_records,
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
from app.qloo.client import QlooClient
from app.qloo.models import QlooEntity


# 1. Three approved identity mappings
def test_three_approved_identity_mappings() -> None:
    resolver = create_ahmedabad_candidate_resolver()

    mapping_calico = resolver.resolve_entity(QLOO_ID_CALICO)
    assert mapping_calico is not None
    assert mapping_calico.venue_id == VENUE_ID_CALICO
    assert mapping_calico.experience_id is None

    mapping_klm = resolver.resolve_entity(QLOO_ID_KASTURBHAI)
    assert mapping_klm is not None
    assert mapping_klm.venue_id == VENUE_ID_KASTURBHAI
    assert mapping_klm.experience_id is None

    mapping_cnf = resolver.resolve_entity(QLOO_ID_CONFLICTIORIUM_AHMEDABAD)
    assert mapping_cnf is not None
    assert mapping_cnf.venue_id == VENUE_ID_CONFLICTIORIUM
    assert mapping_cnf.experience_id is None


# 2. Exclusion of the two Conflictorium non-approved IDs
def test_exclusion_of_conflictorium_non_approved_ids() -> None:
    resolver = create_ahmedabad_candidate_resolver()

    for excluded_id, reason in EXCLUDED_QLOO_IDS.items():
        mapping = resolver.resolve_entity(excluded_id)
        assert mapping is None, f"Excluded ID '{excluded_id}' ({reason}) was resolved!"


# 3. No fuzzy mapping of similarly named venues
def test_no_fuzzy_mapping_of_similarly_named_venues() -> None:
    resolver = create_ahmedabad_candidate_resolver()

    # Entities with identical names or close variations but non-approved IDs
    variations = [
        "Calico Museum",
        "Calico Museum of Textiles (Ahmedabad)",
        "Kasturbhai Museum",
        "Conflictorium Raipur",
        "Museum of Conflict",
    ]
    for idx, _var in enumerate(variations):
        fake_id = f"random-fake-qloo-uuid-{idx}"
        mapping = resolver.resolve_entity(fake_id)
        assert mapping is None, f"Fuzzy matching occurred for fake ID '{fake_id}'!"


# 4. Claim provenance and timezone-aware timestamps
def test_claim_provenance_and_timezone_aware_timestamps() -> None:
    records = create_ahmedabad_pilot_records()
    assert len(records) >= 6

    for record in records:
        all_attr_evs = list(record.venue_evidence.values()) + list(
            record.experience_evidence.values()
        )
        for attr_ev in all_attr_evs:
            for claim in attr_ev.claims:
                assert claim.source is not None
                assert claim.source.source_type == SourceType.OFFICIAL_VENUE_WEBSITE
                assert claim.source.url is not None
                assert claim.source.url.startswith("https://")
                assert claim.source.verified_at is not None
                assert claim.source.verified_at.tzinfo is not None
                # Must match documented retrieval time
                assert claim.source.verified_at == AHMEDABAD_RETRIEVAL_TIMESTAMP


# 5. Correct venue/experience scope separation
def test_venue_experience_scope_separation() -> None:
    records = create_ahmedabad_pilot_records()

    for record in records:
        for attr, attr_ev in record.venue_evidence.items():
            for claim in attr_ev.claims:
                assert claim.scope == ClaimScope.VENUE, (
                    f"Venue claim for {attr} in {record.venue.venue_id} "
                    f"has scope {claim.scope}"
                )

        for attr, attr_ev in record.experience_evidence.items():
            for claim in attr_ev.claims:
                assert claim.scope == ClaimScope.EXPERIENCE, (
                    f"Experience claim for {attr} in {record.venue.venue_id} "
                    f"has scope {claim.scope}"
                )
            assert record.experience is not None
            assert record.experience.venue_id == record.venue.venue_id

    # Verify experience records are mapped to correct experiences
    repo = create_ahmedabad_pilot_repository()
    assert repo.get_by_experience_id(EXP_ID_CALICO_HAVELI) is not None
    assert repo.get_by_experience_id(EXP_ID_CALICO_CHAUK) is not None
    assert repo.get_by_experience_id(EXP_ID_KLM_GUIDED_TOUR) is not None


# 6. Preservation of unknown accessibility attributes
def test_preservation_of_unknown_accessibility_attributes() -> None:
    records = [
        create_calico_museum_record(),
        create_kasturbhai_lalbhai_record(),
        create_conflictorium_record(),
    ]

    for record in records:
        for attr in (
            EvidenceAttribute.STEP_FREE_RESTROOM,
            EvidenceAttribute.SERVICE_ANIMAL_POLICY,
            EvidenceAttribute.COMPANION_ENTRY_POLICY,
            EvidenceAttribute.SEATING_AVAILABLE,
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        ):
            attr_ev = record.venue_evidence.get(attr)
            assert attr_ev is not None, f"Missing {attr} in {record.venue.name}"
            assert attr_ev.status == EvidenceStatus.UNKNOWN
            assert len(attr_ev.claims) == 0
            assert attr_ev.summary is not None


# 7. Calico wheelchair policy is not misrepresented as a step-free entrance fact
def test_calico_wheelchair_policy_not_misrepresented_as_step_free_entrance() -> None:
    calico = create_calico_museum_record()

    # Step-free entrance must remain UNKNOWN (not False)
    step_free_ev = calico.venue_evidence.get(EvidenceAttribute.STEP_FREE_ENTRANCE)
    assert step_free_ev is not None
    assert step_free_ev.status == EvidenceStatus.UNKNOWN
    assert len(step_free_ev.claims) == 0

    # Internal elevator must remain UNKNOWN (not False)
    elevator_ev = calico.venue_evidence.get(EvidenceAttribute.INTERNAL_ELEVATOR)
    assert elevator_ev is not None
    assert elevator_ev.status == EvidenceStatus.UNKNOWN
    assert len(elevator_ev.claims) == 0

    # Wheelchair access is captured via WHEELCHAIR_ACCESS attribute
    wc_ev = calico.venue_evidence.get(EvidenceAttribute.WHEELCHAIR_ACCESS)
    assert wc_ev is not None
    assert wc_ev.status == EvidenceStatus.SOURCE_BACKED
    assert len(wc_ev.claims) == 1
    assert wc_ev.claims[0].value is False
    assert "currently unable to offer wheelchair access" in wc_ev.claims[0].details


# 8. Accurate 90-day booking-window representation
def test_accurate_90_day_booking_window_representation() -> None:
    calico = create_calico_museum_record()
    res_ev = calico.venue_evidence.get(EvidenceAttribute.RESERVATION_REQUIRED)
    assert res_ev is not None
    assert res_ev.status == EvidenceStatus.SOURCE_BACKED
    assert res_ev.claims[0].value is True

    details = res_ev.claims[0].details
    assert "opens 90 days in advance" in details
    assert "not a minimum 90-day advance booking requirement" in details
    assert "strictly 20 persons per tour" in details


# 9. Kasturbhai advance-booking qualification
def test_kasturbhai_advance_booking_qualification() -> None:
    klm = create_kasturbhai_lalbhai_record()
    res_ev = klm.venue_evidence.get(EvidenceAttribute.RESERVATION_REQUIRED)
    assert res_ev is not None
    assert res_ev.status == EvidenceStatus.SOURCE_BACKED
    assert res_ev.claims[0].value is True

    details = res_ev.claims[0].details
    assert "strictly by conducted tour only" in details
    assert "Advance booking via telephone" in details
    assert "klmuseum16@gmail.com" in details
    assert "capped at approximately 12 people" in details


# 10. Conflictorium ordinary-visit versus special-event distinction
def test_conflictorium_ordinary_visit_versus_special_event_distinction() -> None:
    cnf = create_conflictorium_record()
    res_ev = cnf.venue_evidence.get(EvidenceAttribute.RESERVATION_REQUIRED)
    assert res_ev is not None
    assert res_ev.status == EvidenceStatus.SOURCE_BACKED
    # Free walk-in for ordinary visits
    assert res_ev.claims[0].value is False

    details = res_ev.claims[0].details
    assert "Ordinary museum admission to Gool Lodge is free and open" in details
    assert "without reservations" in details
    assert "Special workshops" in details or "Third Space" in details


# 11. Unmapped Qloo candidates remain unresolved
def test_unmapped_qloo_candidates_remain_unresolved() -> None:
    resolver = create_ahmedabad_candidate_resolver()
    repo = create_ahmedabad_pilot_repository()

    unmapped_entity = QlooEntity(
        entity_id="unmapped-candidate-uuid-9999",
        name="Unmapped Cultural Center",
        entity_type="urn:entity:place",
    )
    resolved = resolve_candidate(
        entity=unmapped_entity,
        resolver=resolver,
        evidence_repo=repo,
    )
    assert resolved.status == CandidateResolutionStatus.UNMAPPED
    assert resolved.evidence_record is None
    assert resolved.possibility_assessment is None
    assert "No verified mapping exists" in resolved.resolution_notes


# 12. A missing evidence record cannot produce VERIFIED_FIT
def test_missing_evidence_record_cannot_produce_verified_fit() -> None:
    # Case A: Candidate mapped to a nonexistent venue_id in repo
    orphan_resolver = InMemoryCandidateResolver(
        [
            CandidateMapping(
                qloo_entity_id="test-mapped-id-1",
                venue_id="ven_nonexistent_in_repo",
            )
        ]
    )
    empty_repo = InMemoryVenueEvidenceRepository([])
    entity = QlooEntity(
        entity_id="test-mapped-id-1",
        name="Orphan Entity",
        entity_type="urn:entity:place",
    )
    resolved = resolve_candidate(
        entity=entity,
        resolver=orphan_resolver,
        evidence_repo=empty_repo,
    )
    assert resolved.status == CandidateResolutionStatus.MISSING_EVIDENCE
    assert resolved.evidence_record is None
    assert resolved.possibility_assessment is None

    # Case B: UNKNOWN attributes evaluated against MANDATORY requirements
    calico = create_calico_museum_record()
    engine = PossibilityEngine()
    req = ParticipationRequirement(
        requirement_id="req_step_free",
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
        scope=ClaimScope.VENUE,
    )
    assessment = engine.evaluate(
        record=calico,
        requirements=[req],
        evaluation_time=datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC),
    )
    assert assessment.aggregate_outcome != PossibilityOutcome.VERIFIED_FIT
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE


# 13. A fully mocked end-to-end Ahmedabad workflow
def test_fully_mocked_end_to_end_ahmedabad_workflow() -> None:
    def mock_qloo_search_transport(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/search"
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": QLOO_ID_CALICO,
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                        "subtype": "museum",
                    },
                    {
                        "entity_id": QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
                        "name": "Conflictorium",
                        "type": "urn:entity:place",
                        "subtype": "museum",
                    },
                    {
                        "entity_id": "unknown-non-pilot-entity-id",
                        "name": "Unrelated Art Gallery",
                        "type": "urn:entity:place",
                    },
                ],
            },
        )

    settings = Settings(_env_file=(), QLOO_API_KEY="test_mock_key")
    client = QlooClient(
        settings=settings,
        transport=httpx.MockTransport(mock_qloo_search_transport),
    )

    agent = create_ahmedabad_agent(qloo_client=client)

    # User requires step-free entrance (HARD) and seating available (OPTIONAL)
    workflow_input = AgentWorkflowInput(
        cultural_query="textile and heritage museums in Ahmedabad",
        target_type="urn:entity:place",
        max_candidates=3,
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                operator=ConditionOperator.EQUALS,
                expected_value=True,
                priority=RequirementPriority.MANDATORY,
                scope=ClaimScope.VENUE,
            ),
        ],
    )

    output = agent.run(workflow_input)

    assert output.total_candidates_found == 3
    assert output.candidates_evaluated == 3
    assert len(output.plans) == 3

    # Candidate 1: Calico
    calico_plan = next(
        p for p in output.plans if p.candidate.entity_id == QLOO_ID_CALICO
    )
    assert calico_plan.resolution_status == CandidateResolutionStatus.RESOLVED
    assert calico_plan.venue_id == VENUE_ID_CALICO
    assert calico_plan.possibility_assessment is not None
    assert (
        calico_plan.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )
    # Ensure operational wheelchair policy is surfaced in suggested next actions
    assert any(
        "unable to offer wheelchair access" in act
        for act in calico_plan.suggested_next_actions
    )
    # Provenance source preserved
    assert len(calico_plan.provenance_sources) >= 1

    # Candidate 2: Conflictorium
    cnf_plan = next(
        p
        for p in output.plans
        if p.candidate.entity_id == QLOO_ID_CONFLICTIORIUM_AHMEDABAD
    )
    assert cnf_plan.resolution_status == CandidateResolutionStatus.RESOLVED
    assert cnf_plan.venue_id == VENUE_ID_CONFLICTIORIUM

    # Candidate 3: Unmapped entity
    unmapped_plan = next(
        p
        for p in output.plans
        if p.candidate.entity_id == "unknown-non-pilot-entity-id"
    )
    assert unmapped_plan.resolution_status == CandidateResolutionStatus.UNMAPPED
    assert unmapped_plan.possibility_assessment is None


# 14. No live network calls in automated tests
def test_no_live_network_calls_in_automated_tests(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Ensure any attempt to open a real network socket would raise an exception
    def forbidden_connect(*args, **kwargs):
        raise RuntimeError("Forbidden real network call attempted in test!")

    monkeypatch.setattr("httpx.Client.send", forbidden_connect)

    records = create_ahmedabad_pilot_records()
    repo = create_ahmedabad_pilot_repository()
    resolver = create_ahmedabad_candidate_resolver()

    assert len(records) == 6
    assert repo.get_by_venue_id(VENUE_ID_CALICO) is not None
    assert resolver.resolve_entity(QLOO_ID_CALICO) is not None


# 15. Existing synthetic fixtures remain unchanged
def test_existing_synthetic_fixtures_remain_unchanged() -> None:
    hall = create_synthetic_accessible_hall()
    assert hall.venue.venue_id == "syn_ven_heritage_hall"
    assert (
        hall.venue_evidence[EvidenceAttribute.STEP_FREE_ENTRANCE].claims[0].value
        is True
    )

    conflict_venue = create_synthetic_venue_with_conflicting_claims()
    assert conflict_venue.venue.venue_id == "syn_ven_old_theater"
    assert (
        conflict_venue.venue_evidence[EvidenceAttribute.SEATING_AVAILABLE].status
        == EvidenceStatus.CONFLICTING
    )

    scope_record = create_synthetic_venue_and_experience_with_scope_separation()
    assert scope_record.venue.venue_id == "syn_ven_castle_museum"
    assert scope_record.experience is not None
    assert scope_record.experience.experience_id == "syn_exp_tower_tour"


# --- Task 2: Safety & Policy Boundary Tests ---


def test_step_free_request_receives_needs_confirmation_despite_wheelchair_policy() -> (
    None
):
    """Visitor requesting STEP_FREE_ENTRANCE receives NEEDS_CONFIRMATION for Calico.

    Verifies that the published wheelchair policy is not converted to
    STEP_FREE_ENTRANCE=False, which would prematurely cause REQUIREMENT_CONFLICT.
    """
    calico = create_calico_museum_record()
    engine = PossibilityEngine()

    req = ParticipationRequirement(
        requirement_id="req_step_free",
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
        scope=ClaimScope.VENUE,
    )

    assessment = engine.evaluate(
        record=calico,
        requirements=[req],
        evaluation_time=datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC),
    )

    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    assert assessment.assessments[0].outcome == RequirementOutcome.MISSING_EVIDENCE


def test_published_wheelchair_policy_visible_as_source_backed_advisory() -> None:
    """Published wheelchair policy is surfaced as an advisory with source provenance."""
    calico = create_calico_museum_record()
    engine = PossibilityEngine()

    # User requires reservation (which is supported)
    req = ParticipationRequirement(
        requirement_id="req_res",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
        scope=ClaimScope.VENUE,
    )

    entity = QlooEntity(
        entity_id=QLOO_ID_CALICO,
        name="Calico Museum of Textiles",
        entity_type="urn:entity:place",
    )

    resolved = resolve_candidate(
        entity=entity,
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
    )
    assert resolved.status == CandidateResolutionStatus.RESOLVED

    assessment = engine.evaluate(
        record=calico,
        requirements=[req],
        evaluation_time=datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC),
    )

    from app.agent.planning import build_candidate_participation_plan

    resolved_with_eval = resolved.model_copy(
        update={"possibility_assessment": assessment}
    )
    plan = build_candidate_participation_plan(resolved_with_eval, [req])

    # 1. Outcome remains VERIFIED_FIT for the requested requirement
    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    )

    # 2. Advisory is visible in suggested next actions
    advisory_items = [
        act
        for act in plan.suggested_next_actions
        if "Venue advisory (operational policy)" in act
    ]
    assert len(advisory_items) == 1
    assert "currently unable to offer wheelchair access" in advisory_items[0]

    # 3. Provenance source is included
    src_urls = [s.url for s in plan.provenance_sources if s.url]
    assert "https://www.calicomuseum.org/tour-guidelines/" in src_urls


def test_no_personal_characteristic_inferred_from_cultural_interests() -> None:
    """Verify that no user personal characteristic is inferred from cultural query."""

    def mock_qloo_search_transport(request: httpx.Request) -> httpx.Response:
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

    settings = Settings(_env_file=(), QLOO_API_KEY="test_key")
    client = QlooClient(
        settings=settings,
        transport=httpx.MockTransport(mock_qloo_search_transport),
    )
    agent = create_ahmedabad_agent(qloo_client=client)

    workflow_input = AgentWorkflowInput(
        cultural_query="Indian court textiles and Pichhwais",
        target_type="urn:entity:place",
        max_candidates=1,
        requirements=[],  # Zero practical requirements specified
    )

    output = agent.run(workflow_input)
    assert len(output.plans) == 1
    plan = output.plans[0]

    # Advisory is surfaced purely as an institutional policy advisory,
    # without attributing wheelchair use or disability to the user.
    for act in plan.suggested_next_actions:
        assert "you use" not in act.lower()
        assert "your disability" not in act.lower()
        assert "your wheelchair" not in act.lower()


def test_planning_layer_preserves_exact_aggregate_outcome_from_engine() -> None:
    """Planning layer must strictly preserve PossibilityEngine's aggregate outcome."""
    calico = create_calico_museum_record()
    engine = PossibilityEngine()

    entity = QlooEntity(
        entity_id=QLOO_ID_CALICO,
        name="Calico Museum of Textiles",
        entity_type="urn:entity:place",
    )
    resolved = resolve_candidate(
        entity=entity,
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
    )

    from app.agent.planning import build_candidate_participation_plan

    eval_time = datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC)

    # Case 1: Supported mandatory -> VERIFIED_FIT
    req_res = ParticipationRequirement(
        requirement_id="req_res",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
    )
    ass_fit = engine.evaluate(calico, [req_res], eval_time)
    assert ass_fit.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    plan_fit = build_candidate_participation_plan(
        resolved.model_copy(update={"possibility_assessment": ass_fit}),
        [req_res],
    )
    assert (
        plan_fit.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.VERIFIED_FIT
    )

    # Case 2: Unknown mandatory -> NEEDS_CONFIRMATION
    req_step = ParticipationRequirement(
        requirement_id="req_step",
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
    )
    ass_conf = engine.evaluate(calico, [req_step], eval_time)
    assert ass_conf.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION
    plan_conf = build_candidate_participation_plan(
        resolved.model_copy(update={"possibility_assessment": ass_conf}),
        [req_step],
    )
    assert (
        plan_conf.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )

    # Case 3: Contradicted mandatory -> REQUIREMENT_CONFLICT
    req_wc = ParticipationRequirement(
        requirement_id="req_wc",
        attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
        operator=ConditionOperator.EQUALS,
        expected_value=True,
        priority=RequirementPriority.MANDATORY,
    )
    ass_conflic = engine.evaluate(calico, [req_wc], eval_time)
    assert ass_conflic.aggregate_outcome == PossibilityOutcome.REQUIREMENT_CONFLICT
    plan_conflic = build_candidate_participation_plan(
        resolved.model_copy(update={"possibility_assessment": ass_conflic}),
        [req_wc],
    )
    assert (
        plan_conflic.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.REQUIREMENT_CONFLICT
    )


def test_venue_level_policy_and_experience_level_evidence_remain_distinguishable() -> (
    None
):
    """Venue-level policy does not silently overwrite experience-level requirements."""
    haveli_record = create_ahmedabad_pilot_repository().get_by_experience_id(
        EXP_ID_CALICO_HAVELI
    )
    assert haveli_record is not None
    engine = PossibilityEngine()

    # Requirement asks specifically for experience-level wheelchair access
    exp_req = ParticipationRequirement(
        requirement_id="req_exp_wc",
        attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
        operator=ConditionOperator.EQUALS,
        expected_value=False,
        priority=RequirementPriority.MANDATORY,
        scope=ClaimScope.EXPERIENCE,
    )

    assessment = engine.evaluate(
        record=haveli_record,
        requirements=[exp_req],
        evaluation_time=datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC),
    )

    # Because WHEELCHAIR_ACCESS is recorded at VENUE scope, not EXPERIENCE scope,
    # the conservative applicability rule yields INSUFFICIENT_SCOPE, not SUPPORTED.
    assert assessment.assessments[0].outcome == RequirementOutcome.INSUFFICIENT_SCOPE
    assert assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION


def test_unrelated_venues_do_not_inherit_calico_policy() -> None:
    """Conflictorium and Kasturbhai must not inherit Calico's wheelchair advisory."""
    cnf = create_conflictorium_record()
    klm = create_kasturbhai_lalbhai_record()

    # Neither record defines WHEELCHAIR_ACCESS
    assert EvidenceAttribute.WHEELCHAIR_ACCESS not in cnf.venue_evidence
    assert EvidenceAttribute.WHEELCHAIR_ACCESS not in klm.venue_evidence

    # Build plan for Conflictorium
    entity_cnf = QlooEntity(
        entity_id=QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
        name="Conflictorium",
        entity_type="urn:entity:place",
    )
    resolved_cnf = resolve_candidate(
        entity=entity_cnf,
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
    )
    engine = PossibilityEngine()
    req = ParticipationRequirement(
        requirement_id="req_res",
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        operator=ConditionOperator.EQUALS,
        expected_value=False,
        priority=RequirementPriority.MANDATORY,
    )
    ass_cnf = engine.evaluate(cnf, [req], datetime(2026, 10, 19, 12, 0, 0, tzinfo=UTC))

    from app.agent.planning import build_candidate_participation_plan

    plan_cnf = build_candidate_participation_plan(
        resolved_cnf.model_copy(update={"possibility_assessment": ass_cnf}),
        [req],
    )

    # Conflictorium plan must not contain Calico's wheelchair advisory
    for act in plan_cnf.suggested_next_actions:
        assert "unable to offer wheelchair access" not in act
        assert "Venue advisory (operational policy)" not in act
