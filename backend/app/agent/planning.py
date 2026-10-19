"""Deterministic participation planning construction for AccessAtlas.

Synthesizes cultural discovery results, candidate resolution status, and deterministic
Possibility Engine assessments into grounded, actionable participation plans.
"""

from app.agent.models import (
    CandidateParticipationPlan,
    CandidateResolutionStatus,
    ResolvedCandidate,
)
from app.evidence.models import EvidenceAttribute, EvidenceSource, EvidenceStatus
from app.possibility.models import (
    ParticipationRequirement,
    PossibilityOutcome,
    RequirementOutcome,
    RequirementPriority,
)


def build_candidate_participation_plan(
    resolved_candidate: ResolvedCandidate,
    requirements: list[ParticipationRequirement],
) -> CandidateParticipationPlan:
    """Build a deterministic participation plan for a single candidate.

    Enforces that:
    1. Unmapped candidates never receive a possibility assessment or verified fit.
    2. Confirmation questions are grounded directly in explicit requirement gaps.
    3. Next actions distinguish verified fits from items requiring confirmation.
    4. Never claims external contact or bookings were made.
    """
    entity = resolved_candidate.qloo_entity
    status = resolved_candidate.status
    assessment = resolved_candidate.possibility_assessment

    supported_findings: list[str] = []
    unresolved_gaps: list[str] = []
    confirmation_questions: list[str] = []
    suggested_next_actions: list[str] = []
    provenance_sources: list[EvidenceSource] = []

    if status == CandidateResolutionStatus.UNMAPPED:
        unresolved_gaps.append(
            "No independently verified venue evidence is mapped for this "
            "cultural entity."
        )
        confirmation_questions.append(
            f"Confirm whether '{entity.name}' operates at a physical venue and "
            "verify applicable access attributes directly."
        )
        suggested_next_actions.append(
            f"Cultural interest matches '{entity.name}', but practical access "
            "information is unverified. Consult official venue sources directly "
            "before planning attendance."
        )
        return CandidateParticipationPlan(
            candidate=entity,
            resolution_status=status,
            venue_id=None,
            experience_id=None,
            possibility_assessment=None,
            supported_findings=[],
            unresolved_gaps=unresolved_gaps,
            confirmation_questions=confirmation_questions,
            suggested_next_actions=suggested_next_actions,
            provenance_sources=[],
        )

    if status == CandidateResolutionStatus.MISSING_EVIDENCE:
        unresolved_gaps.append(
            f"Mapped venue identifier '{resolved_candidate.venue_id}' was not "
            "found in the local evidence repository."
        )
        confirmation_questions.append(
            f"Confirm practical entrance and participation conditions directly with "
            f"'{entity.name}' staff."
        )
        suggested_next_actions.append(
            "Evidence repository record is missing. Direct confirmation with venue "
            "staff is required prior to travel."
        )
        return CandidateParticipationPlan(
            candidate=entity,
            resolution_status=status,
            venue_id=resolved_candidate.venue_id,
            experience_id=resolved_candidate.experience_id,
            possibility_assessment=None,
            supported_findings=[],
            unresolved_gaps=unresolved_gaps,
            confirmation_questions=confirmation_questions,
            suggested_next_actions=suggested_next_actions,
            provenance_sources=[],
        )

    # Candidate is RESOLVED and evaluated
    if assessment is not None:
        seen_source_urls: set[str] = set()

        for req_ass in assessment.assessments:
            attr_label = req_ass.attribute.value.replace("_", " ")

            if req_ass.outcome == RequirementOutcome.SUPPORTED:
                supported_findings.append(
                    f"{attr_label.capitalize()}: supported by verified evidence "
                    f"({req_ass.scope.value} scope)."
                )
            else:
                unresolved_gaps.append(
                    f"{attr_label.capitalize()}: {req_ass.outcome.value} — "
                    f"{req_ass.explanation}"
                )

            # Ground confirmation questions in actual evidence needs
            if req_ass.confirmation_need:
                confirmation_questions.append(
                    f"Confirm {attr_label}: {req_ass.confirmation_need}"
                )

            # Collect source provenance
            for claim in req_ass.evidence_references:
                src_key = claim.source.url or claim.source.title
                if src_key not in seen_source_urls:
                    seen_source_urls.add(src_key)
                    provenance_sources.append(claim.source)

        # Formulate grounded next actions based on aggregate outcome
        if assessment.aggregate_outcome == PossibilityOutcome.VERIFIED_FIT:
            suggested_next_actions.append(
                f"Verified fit: all mandatory requirements are supported for "
                f"'{entity.name}'."
            )
            suggested_next_actions.append(
                "Review official venue schedule and booking requirements prior "
                "to visit."
            )
            has_unsupported_optional = any(
                a.priority == RequirementPriority.OPTIONAL
                and a.outcome != RequirementOutcome.SUPPORTED
                for a in assessment.assessments
            )
            if has_unsupported_optional:
                suggested_next_actions.append(
                    "Note: Review optional preference(s) that could not be verified."
                )

        elif assessment.aggregate_outcome == PossibilityOutcome.REQUIREMENT_CONFLICT:
            suggested_next_actions.append(
                f"Identified conflict: mandatory requirements are contradicted for "
                f"'{entity.name}'."
            )
            suggested_next_actions.append(
                "Consider alternative cultural experiences that satisfy your "
                "stated requirements."
            )

        elif assessment.aggregate_outcome == PossibilityOutcome.NEEDS_CONFIRMATION:
            suggested_next_actions.append(
                f"Needs confirmation: mandatory details for '{entity.name}' "
                "require verification."
            )
            suggested_next_actions.append(
                "Contact venue accessibility coordinator to resolve the confirmation "
                "questions above."
            )

        # Ensure operational wheelchair access limitations are surfaced in plans
        if resolved_candidate.evidence_record:
            venue_ev = resolved_candidate.evidence_record.venue_evidence
            wc_attr_ev = venue_ev.get(EvidenceAttribute.WHEELCHAIR_ACCESS)
            if wc_attr_ev and wc_attr_ev.status == EvidenceStatus.SOURCE_BACKED:
                for clm in wc_attr_ev.claims:
                    if clm.value is False:
                        policy_detail = clm.details or wc_attr_ev.summary
                        wc_notice = f"Venue operational policy: {policy_detail}"
                        if wc_notice not in suggested_next_actions:
                            suggested_next_actions.append(wc_notice)
                        src_key = clm.source.url or clm.source.title
                        if src_key not in seen_source_urls:
                            seen_source_urls.add(src_key)
                            provenance_sources.append(clm.source)

    return CandidateParticipationPlan(
        candidate=entity,
        resolution_status=status,
        venue_id=resolved_candidate.venue_id,
        experience_id=resolved_candidate.experience_id,
        possibility_assessment=assessment,
        supported_findings=supported_findings,
        unresolved_gaps=unresolved_gaps,
        confirmation_questions=confirmation_questions,
        suggested_next_actions=suggested_next_actions,
        provenance_sources=provenance_sources,
    )
