"""Tests for LangGraph agent orchestration.

Validates end-to-end workflow execution, strict trust boundaries, candidate
resolution, Possibility Engine integration, grounded participation planning,
and failure handling with full dependency injection.
"""

from datetime import UTC, datetime
from unittest.mock import MagicMock

from app.agent.graph import AccessAtlasAgent
from app.agent.models import (
    AgentWorkflowInput,
    CandidateResolutionStatus,
)
from app.agent.resolution import CandidateMapping, InMemoryCandidateResolver
from app.evidence.fixtures import (
    create_synthetic_accessible_hall,
    create_synthetic_venue_and_experience_with_scope_separation,
    create_synthetic_venue_with_conflicting_claims,
)
from app.evidence.models import (
    ClaimScope,
    EvidenceAttribute,
)
from app.evidence.repository import InMemoryVenueEvidenceRepository
from app.possibility.engine import PossibilityEngine
from app.possibility.models import (
    ConditionOperator,
    ParticipationRequirement,
    PossibilityOutcome,
    RequirementPriority,
)
from app.qloo.client import QlooClient
from app.qloo.models import (
    QlooAuthenticationError,
    QlooEntity,
    QlooEntityTag,
    QlooSearchResult,
    QlooTimeoutError,
)


def _make_eval_time() -> datetime:
    return datetime(2026, 4, 15, 12, 0, 0, tzinfo=UTC)


def _build_test_agent() -> tuple[
    AccessAtlasAgent, MagicMock, InMemoryCandidateResolver
]:
    """Helper to construct an AccessAtlasAgent with controlled test fixtures."""
    qloo_mock = MagicMock(spec=QlooClient)

    evidence_repo = InMemoryVenueEvidenceRepository(
        [
            create_synthetic_accessible_hall(),
            create_synthetic_venue_with_conflicting_claims(),
            create_synthetic_venue_and_experience_with_scope_separation(),
        ]
    )

    resolver = InMemoryCandidateResolver(
        [
            CandidateMapping(
                qloo_entity_id="qloo_heritage_hall",
                venue_id="syn_ven_heritage_hall",
                notes="Mapped to synthetic heritage hall fixture.",
            ),
            CandidateMapping(
                qloo_entity_id="qloo_old_theater",
                venue_id="syn_ven_old_theater",
                notes="Mapped to synthetic old theater fixture.",
            ),
            CandidateMapping(
                qloo_entity_id="qloo_tower_tour",
                venue_id="syn_ven_castle_museum",
                experience_id="syn_exp_tower_tour",
                notes="Mapped to castle museum tower tour fixture.",
            ),
            CandidateMapping(
                qloo_entity_id="qloo_missing_evidence",
                venue_id="syn_ven_nonexistent",
                notes="Intentionally mapped to missing venue ID.",
            ),
        ]
    )

    engine = PossibilityEngine()

    agent = AccessAtlasAgent(
        qloo_client=qloo_mock,
        resolver=resolver,
        evidence_repo=evidence_repo,
        engine=engine,
    )

    return agent, qloo_mock, resolver


def test_successful_fully_mocked_end_to_end_workflow():
    """Verify complete successful pipeline from cultural search to verified plan."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_heritage_hall",
        name="Heritage Music Hall",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="classical music",
        total_results=1,
        entities=[entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="classical music",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                operator=ConditionOperator.EQUALS,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    assert output.total_candidates_found == 1
    assert output.candidates_evaluated == 1
    assert output.discovery_error is None
    assert len(output.plans) == 1

    plan = output.plans[0]
    assert plan.candidate.entity_id == "qloo_heritage_hall"
    assert plan.resolution_status == CandidateResolutionStatus.RESOLVED
    assert plan.venue_id == "syn_ven_heritage_hall"
    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    )
    assert len(plan.supported_findings) == 1
    assert "Step free entrance: supported" in plan.supported_findings[0]
    assert len(plan.unresolved_gaps) == 0
    assert len(output.cultural_threads) == 1
    assert output.cultural_threads[0].candidate.entity_id == "qloo_heritage_hall"
    assert plan.cultural_thread is not None
    assert plan.cultural_thread.thread_id == output.cultural_threads[0].thread_id
    assert "https://synthetic.heritagehall.test" in (
        plan.provenance_sources[0].url or ""
    )


def test_unmapped_qloo_entity():
    """Unmapped Qloo entity remains unresolved and receives no assessment."""
    agent, qloo_mock, _ = _build_test_agent()

    unmapped_entity = QlooEntity(
        entity_id="qloo_random_gallery",
        name="Random Art Gallery",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="art",
        total_results=1,
        entities=[unmapped_entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="art",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                expected_value=True,
            )
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    assert len(output.plans) == 1
    plan = output.plans[0]
    assert plan.resolution_status == CandidateResolutionStatus.UNMAPPED
    assert plan.possibility_assessment is None  # Must never be evaluated
    assert len(plan.supported_findings) == 0
    assert any("No independently verified" in gap for gap in plan.unresolved_gaps)
    assert any(
        "Confirm whether 'Random Art Gallery'" in q for q in plan.confirmation_questions
    )


def test_missing_mapped_evidence():
    """Mapped entity pointing to missing repository record produces MISSING_EVIDENCE."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_missing_evidence",
        name="Ghost Venue",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="ghost",
        total_results=1,
        entities=[entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="ghost",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                expected_value=True,
            )
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    plan = output.plans[0]
    assert plan.resolution_status == CandidateResolutionStatus.MISSING_EVIDENCE
    assert plan.possibility_assessment is None
    assert any("was not found" in gap for gap in plan.unresolved_gaps)


def test_qloo_empty_result():
    """Empty Qloo search produces honest report with zero candidates."""
    agent, qloo_mock, _ = _build_test_agent()

    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="nonexistent interest",
        total_results=0,
        entities=[],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="nonexistent interest",
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    assert output.total_candidates_found == 0
    assert output.candidates_evaluated == 0
    assert len(output.plans) == 0
    assert "No cultural candidates were found" in output.workflow_summary


def test_qloo_provider_failure_sanitization():
    """Provider failure produces sanitized error output without unhandled crash."""
    agent, qloo_mock, _ = _build_test_agent()

    # Test Authentication Error
    qloo_mock.search_entities.side_effect = QlooAuthenticationError(
        "Invalid key test_secret_123"
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="movies",
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    assert output.total_candidates_found == 0
    assert output.discovery_error is not None
    assert "QlooAuthenticationError" in output.discovery_error
    assert "test_secret_123" not in output.discovery_error  # No secrets leaked
    assert "Cultural discovery failed" in output.workflow_summary

    # Test Timeout Error
    qloo_mock.search_entities.side_effect = QlooTimeoutError("Search timed out")
    output_timeout = agent.run(workflow_input)
    assert output_timeout.discovery_error is not None
    assert "QlooTimeoutError" in output_timeout.discovery_error


def test_verified_fit_assessment_preservation():
    """Verified fit evaluation is accurately preserved in the participation plan."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_heritage_hall",
        name="Heritage Hall",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="heritage",
        total_results=1,
        entities=[entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="heritage",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_entrance",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
            ParticipationRequirement(
                requirement_id="req_elevator",
                attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    )
    assert len(plan.supported_findings) == 2
    assert any("Step free entrance" in f for f in plan.supported_findings)
    assert any("Internal elevator" in f for f in plan.supported_findings)
    assert any("Verified fit" in a for a in plan.suggested_next_actions)


def test_needs_confirmation_assessment_preservation():
    """Unverified or missing mandatory requirement preserves NEEDS_CONFIRMATION."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_heritage_hall",
        name="Heritage Hall",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="heritage",
        total_results=1,
        entities=[entity],
    )

    # Restroom is UNKNOWN in synthetic accessible hall fixture
    workflow_input = AgentWorkflowInput(
        cultural_query="heritage",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_restroom",
                attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )
    assert any("Step free restroom" in g for g in plan.unresolved_gaps)
    assert any("Confirm step free restroom" in q for q in plan.confirmation_questions)
    assert any("Needs confirmation" in a for a in plan.suggested_next_actions)


def test_requirement_conflict_assessment_preservation():
    """Contradicted requirement preserves REQUIREMENT_CONFLICT and warns user."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_tower_tour",
        name="Historic Watchtower Tour",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="tower",
        total_results=1,
        entities=[entity],
    )

    # Tower tour is NOT step-free (120 stairs)
    workflow_input = AgentWorkflowInput(
        cultural_query="tower",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free_tour",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.EXPERIENCE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.REQUIREMENT_CONFLICT
    )
    assert any("contradicted" in g for g in plan.unresolved_gaps)
    assert any("Identified conflict" in a for a in plan.suggested_next_actions)
    assert any(
        "alternative cultural experiences" in a for a in plan.suggested_next_actions
    )


def test_confirmation_questions_grounded_in_actual_gaps():
    """Confirmation questions are derived strictly from actual gaps in evidence."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_old_theater",
        name="Old Brick Theater",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="theater",
        total_results=1,
        entities=[entity],
    )

    # Seating in Old Theater has CONFLICTING claims
    workflow_input = AgentWorkflowInput(
        cultural_query="theater",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_seating",
                attribute=EvidenceAttribute.SEATING_AVAILABLE,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert len(plan.confirmation_questions) >= 1
    assert "Confirm seating available" in plan.confirmation_questions[0]
    assert "Discrepancy among independent sources" in plan.confirmation_questions[0]


def test_optional_preference_handling():
    """Contradicted optional preference does not disqualify VERIFIED_FIT."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_tower_tour",
        name="Tower Tour Experience",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="castle",
        total_results=1,
        entities=[entity],
    )

    # Venue entrance is step-free (mandatory), but tour has stairs (optional preference)
    workflow_input = AgentWorkflowInput(
        cultural_query="castle",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_venue_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.VENUE,
                priority=RequirementPriority.MANDATORY,
                expected_value=True,
            ),
            ParticipationRequirement(
                requirement_id="pref_tour_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.EXPERIENCE,
                priority=RequirementPriority.OPTIONAL,
                expected_value=True,
            ),
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT
    )
    assert any("Step free entrance: supported" in f for f in plan.supported_findings)
    assert any("contradicted" in g for g in plan.unresolved_gaps)
    assert any(
        "optional preference(s)" in a.lower() for a in plan.suggested_next_actions
    )


def test_no_invented_evidence_or_venue_mappings():
    """Verify that no synthetic mapping or evidence is fabricated when unmapped."""
    agent, qloo_mock, resolver = _build_test_agent()

    # Assert resolver starts with only the 4 configured mappings
    assert resolver.resolve_entity("arbitrary_unknown_entity_id") is None

    unknown_entity = QlooEntity(
        entity_id="arbitrary_unknown_entity_id",
        name="Mysterious Unmapped Venue",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="mysterious",
        total_results=1,
        entities=[unknown_entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="mysterious",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_1",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                expected_value=True,
            )
        ],
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    assert plan.resolution_status == CandidateResolutionStatus.UNMAPPED
    assert plan.venue_id is None
    assert plan.possibility_assessment is None


def test_no_inference_of_personal_characteristics_from_qloo():
    """Verify workflow requirements are strictly taken from user input, not inferred."""
    agent, qloo_mock, _ = _build_test_agent()

    # Entity has suggestive tags or popularity
    entity_with_tags = QlooEntity(
        entity_id="qloo_heritage_hall",
        name="Tagged Hall",
        entity_type="urn:entity:place",
        tags=[
            QlooEntityTag(id="urn:tag:wheelchair_friendly", name="Accessible"),
        ],
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="tagged",
        total_results=1,
        entities=[entity_with_tags],
    )

    # User explicitly provides NO mandatory requirements
    workflow_input = AgentWorkflowInput(
        cultural_query="tagged",
        requirements=[],  # Empty!
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)
    plan = output.plans[0]

    # Engine must not infer requirements from tags and must return NEEDS_CONFIRMATION
    assert plan.possibility_assessment is not None
    assert (
        plan.possibility_assessment.aggregate_outcome
        == PossibilityOutcome.NEEDS_CONFIRMATION
    )
    assert (
        "No mandatory requirements were provided" in plan.possibility_assessment.summary
    )


def test_bounded_candidate_processing():
    """Workflow strictly respects max_candidates limit."""
    agent, qloo_mock, _ = _build_test_agent()

    entities = [
        QlooEntity(
            entity_id=f"qloo_ent_{i}",
            name=f"Venue #{i}",
            entity_type="urn:entity:place",
        )
        for i in range(10)
    ]
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="multi",
        total_results=10,
        entities=entities,
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="multi",
        max_candidates=3,  # Limit to 3
        evaluation_time=_make_eval_time(),
    )

    output = agent.run(workflow_input)

    assert output.candidates_evaluated == 3
    assert len(output.plans) == 3


def test_repeatable_deterministic_output():
    """Workflow produces strictly identical outputs across repeated runs."""
    agent, qloo_mock, _ = _build_test_agent()

    entity = QlooEntity(
        entity_id="qloo_heritage_hall",
        name="Heritage Hall",
        entity_type="urn:entity:place",
    )
    qloo_mock.search_entities.return_value = QlooSearchResult(
        query="heritage",
        total_results=1,
        entities=[entity],
    )

    workflow_input = AgentWorkflowInput(
        cultural_query="heritage",
        requirements=[
            ParticipationRequirement(
                requirement_id="req_step_free",
                attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
                scope=ClaimScope.VENUE,
                expected_value=True,
            )
        ],
        evaluation_time=_make_eval_time(),
    )

    run1 = agent.run(workflow_input)
    run2 = agent.run(workflow_input)

    assert run1.workflow_summary == run2.workflow_summary
    assert len(run1.plans) == len(run2.plans)
    assert run1.plans[0].resolution_status == run2.plans[0].resolution_status
    assert (
        run1.plans[0].possibility_assessment.aggregate_outcome
        == run2.plans[0].possibility_assessment.aggregate_outcome
    )
