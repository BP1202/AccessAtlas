"""Deterministic Possibility Engine for AccessAtlas.

Evaluates explicit participation requirements against independently sourced venue
and experience evidence without cultural bias, scoring, or LLM interpretation.
"""

from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any

from app.evidence.models import (
    ClaimScope,
    EvidenceClaim,
    EvidenceRecord,
    EvidenceStatus,
)
from app.possibility.models import (
    ConditionOperator,
    ParticipationRequirement,
    PossibilityAssessment,
    PossibilityOutcome,
    RequirementAssessment,
    RequirementOutcome,
    RequirementPriority,
)


class ConditionMatch(StrEnum):
    """Internal condition evaluation result for a single evidence claim."""

    SATISFIED = "satisfied"
    CONTRADICTED = "contradicted"
    UNSUPPORTED = "unsupported"


class PossibilityEngine:
    """Deterministic evaluation engine.

    Evaluates visitor requirements against an EvidenceRecord using strict provenance,
    scope boundaries, and machine-evaluable condition logic.
    """

    def __init__(self, max_evidence_age: timedelta | None = None) -> None:
        """Initialize the PossibilityEngine.

        Args:
            max_evidence_age: Optional timedelta setting policy cutoff for stale data.
                If None, no arbitrary freshness limit is imposed beyond valid_until.
        """
        self.max_evidence_age = max_evidence_age

    def evaluate(
        self,
        record: EvidenceRecord,
        requirements: list[ParticipationRequirement],
        evaluation_time: datetime | None = None,
    ) -> PossibilityAssessment:
        """Evaluate a collection of requirements against an EvidenceRecord.

        Args:
            record: The EvidenceRecord containing venue and experience evidence.
            requirements: List of explicit user participation requirements.
            evaluation_time: Explicit timezone-aware datetime for reproducible
                decisions. Defaults to current UTC time if omitted.

        Returns:
            PossibilityAssessment with per-requirement and aggregate outcomes.
        """
        if evaluation_time is None:
            evaluation_time = datetime.now(UTC)
        elif (
            evaluation_time.tzinfo is None
            or evaluation_time.tzinfo.utcoffset(evaluation_time) is None
        ):
            raise ValueError(
                "evaluation_time must be timezone-aware (tzinfo cannot be None)."
            )

        assessments: list[RequirementAssessment] = [
            self.evaluate_requirement(record, req, evaluation_time)
            for req in requirements
        ]

        aggregate_outcome, summary = self._aggregate_outcomes(assessments)

        return PossibilityAssessment(
            venue_id=record.venue.venue_id,
            experience_id=record.experience.experience_id
            if record.experience
            else None,
            aggregate_outcome=aggregate_outcome,
            evaluation_time=evaluation_time,
            assessments=assessments,
            summary=summary,
        )

    def evaluate_requirement(
        self,
        record: EvidenceRecord,
        requirement: ParticipationRequirement,
        evaluation_time: datetime,
    ) -> RequirementAssessment:
        """Evaluate an individual requirement against the evidence record."""
        if (
            evaluation_time.tzinfo is None
            or evaluation_time.tzinfo.utcoffset(evaluation_time) is None
        ):
            raise ValueError(
                "evaluation_time must be timezone-aware (tzinfo cannot be None)."
            )

        # 1. Resolve evidence attribute map based on requirement scope
        if requirement.scope == ClaimScope.VENUE:
            attr_ev = record.venue_evidence.get(requirement.attribute)
            if attr_ev is None:
                # Check if evidence exists at the experience level instead
                if requirement.attribute in record.experience_evidence:
                    return RequirementAssessment(
                        requirement_id=requirement.requirement_id,
                        attribute=requirement.attribute,
                        priority=requirement.priority,
                        scope=requirement.scope,
                        outcome=RequirementOutcome.INSUFFICIENT_SCOPE,
                        explanation=(
                            f"Evidence for '{requirement.attribute}' is recorded at "
                            "experience scope, not at the requested venue scope."
                        ),
                        evidence_references=[],
                        confirmation_need=(
                            f"Venue-level evidence for '{requirement.attribute}' "
                            "is needed."
                        ),
                    )
                return RequirementAssessment(
                    requirement_id=requirement.requirement_id,
                    attribute=requirement.attribute,
                    priority=requirement.priority,
                    scope=requirement.scope,
                    outcome=RequirementOutcome.MISSING_EVIDENCE,
                    explanation=(
                        f"No evidence recorded for attribute '{requirement.attribute}' "
                        "at venue scope."
                    ),
                    evidence_references=[],
                    confirmation_need=(
                        f"Verification needed for '{requirement.attribute}'."
                    ),
                )

        elif requirement.scope == ClaimScope.EXPERIENCE:
            if record.experience is None:
                return RequirementAssessment(
                    requirement_id=requirement.requirement_id,
                    attribute=requirement.attribute,
                    priority=requirement.priority,
                    scope=requirement.scope,
                    outcome=RequirementOutcome.INSUFFICIENT_SCOPE,
                    explanation=(
                        "Requirement requires experience scope, but the evidence "
                        "record has no associated experience identity."
                    ),
                    evidence_references=[],
                    confirmation_need=(
                        "An experience must be associated with the record."
                    ),
                )

            attr_ev = record.experience_evidence.get(requirement.attribute)
            if attr_ev is None:
                # Conservative applicability rule: venue evidence does not auto-apply
                if requirement.attribute in record.venue_evidence:
                    return RequirementAssessment(
                        requirement_id=requirement.requirement_id,
                        attribute=requirement.attribute,
                        priority=requirement.priority,
                        scope=requirement.scope,
                        outcome=RequirementOutcome.INSUFFICIENT_SCOPE,
                        explanation=(
                            f"Evidence for '{requirement.attribute}' exists at "
                            "venue scope, but not specifically for experience "
                            f"'{record.experience.experience_id}'. Venue access "
                            "does not guarantee experience access."
                        ),
                        evidence_references=[],
                        confirmation_need=(
                            "Confirmation needed whether venue "
                            f"'{requirement.attribute}' applies to experience "
                            f"'{record.experience.title}'."
                        ),
                    )
                return RequirementAssessment(
                    requirement_id=requirement.requirement_id,
                    attribute=requirement.attribute,
                    priority=requirement.priority,
                    scope=requirement.scope,
                    outcome=RequirementOutcome.MISSING_EVIDENCE,
                    explanation=(
                        f"No evidence recorded for attribute '{requirement.attribute}' "
                        f"at experience scope for '{record.experience.experience_id}'."
                    ),
                    evidence_references=[],
                    confirmation_need=(
                        f"Verification needed for '{requirement.attribute}'."
                    ),
                )
        else:
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.UNSUPPORTED_CONDITION,
                explanation=f"Unsupported scope '{requirement.scope}'.",
                evidence_references=[],
                confirmation_need="Valid requirement scope must be specified.",
            )

        # 2. Evaluate based on EvidenceStatus
        if attr_ev.status == EvidenceStatus.UNKNOWN:
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.MISSING_EVIDENCE,
                explanation=(
                    f"Evidence for attribute '{requirement.attribute}' is explicitly "
                    "UNKNOWN."
                ),
                evidence_references=[],
                confirmation_need=(
                    f"Independent evidence needed for '{requirement.attribute}'."
                ),
            )

        if attr_ev.status == EvidenceStatus.CONFLICTING:
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.CONFLICTING_EVIDENCE,
                explanation=(
                    "Independent sources report conflicting evidence for "
                    f"'{requirement.attribute}'."
                ),
                evidence_references=list(attr_ev.claims),
                confirmation_need=(
                    "Discrepancy among independent sources for "
                    f"'{requirement.attribute}' must be reconciled."
                ),
            )

        # 3. Handle SOURCE_BACKED claims
        active_claims: list[EvidenceClaim] = []
        expired_claims: list[EvidenceClaim] = []

        for claim in attr_ev.claims:
            is_expired = False
            if claim.valid_until is not None and evaluation_time > claim.valid_until:
                is_expired = True
            if (
                self.max_evidence_age is not None
                and (evaluation_time - claim.source.verified_at) > self.max_evidence_age
            ):
                is_expired = True

            if is_expired:
                expired_claims.append(claim)
            else:
                active_claims.append(claim)

        if not active_claims:
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.EXPIRED_EVIDENCE,
                explanation=(
                    f"All evidence claims for '{requirement.attribute}' have expired "
                    f"as of evaluation time ({evaluation_time.isoformat()})."
                ),
                evidence_references=list(attr_ev.claims),
                confirmation_need=(
                    f"Fresh verification needed for '{requirement.attribute}'."
                ),
            )

        # 4. Machine evaluation of active claims against requirement condition
        satisfied_claims: list[EvidenceClaim] = []
        contradicted_claims: list[EvidenceClaim] = []
        unsupported_claims: list[EvidenceClaim] = []

        for claim in active_claims:
            match = self._evaluate_condition(
                claim.value,
                requirement.operator,
                requirement.expected_value,
            )
            if match == ConditionMatch.SATISFIED:
                satisfied_claims.append(claim)
            elif match == ConditionMatch.CONTRADICTED:
                contradicted_claims.append(claim)
            else:
                unsupported_claims.append(claim)

        if unsupported_claims:
            first_unsupported = unsupported_claims[0]
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.UNSUPPORTED_CONDITION,
                explanation=(
                    f"Condition '{requirement.operator}' with expected value "
                    f"'{requirement.expected_value}' cannot be deterministically "
                    f"evaluated against claim value ({first_unsupported.value!r}). "
                    "Ambiguous or free-text claims cannot be silently interpreted."
                ),
                evidence_references=list(active_claims),
                confirmation_need=(
                    "Structured interpretation or direct confirmation needed for "
                    f"'{requirement.attribute}'."
                ),
            )

        if satisfied_claims and contradicted_claims:
            # Disagreement among active source claims
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.CONFLICTING_EVIDENCE,
                explanation=(
                    "Active claims disagree: at least one claim satisfies "
                    "condition and another contradicts it for attribute "
                    f"'{requirement.attribute}'."
                ),
                evidence_references=list(active_claims),
                confirmation_need=(
                    "Contradictory observations for "
                    f"'{requirement.attribute}' must be resolved."
                ),
            )

        if contradicted_claims:
            return RequirementAssessment(
                requirement_id=requirement.requirement_id,
                attribute=requirement.attribute,
                priority=requirement.priority,
                scope=requirement.scope,
                outcome=RequirementOutcome.CONTRADICTED,
                explanation=(
                    "Available evidence establishes a contradiction with "
                    f"requirement for '{requirement.attribute}'."
                ),
                evidence_references=list(contradicted_claims),
                confirmation_need=None,
            )

        return RequirementAssessment(
            requirement_id=requirement.requirement_id,
            attribute=requirement.attribute,
            priority=requirement.priority,
            scope=requirement.scope,
            outcome=RequirementOutcome.SUPPORTED,
            explanation=(
                "Verified applicable evidence supports requirement for "
                f"'{requirement.attribute}'."
            ),
            evidence_references=list(satisfied_claims),
            confirmation_need=None,
        )

    def _evaluate_condition(
        self,
        claim_value: Any,
        operator: ConditionOperator,
        expected_value: Any,
    ) -> ConditionMatch:
        """Evaluate an individual claim value against expected condition."""
        if operator == ConditionOperator.IS_PRESENT:
            return (
                ConditionMatch.SATISFIED
                if claim_value is not None
                else ConditionMatch.CONTRADICTED
            )

        if operator == ConditionOperator.EQUALS:
            if isinstance(expected_value, bool):
                if isinstance(claim_value, bool):
                    return (
                        ConditionMatch.SATISFIED
                        if claim_value == expected_value
                        else ConditionMatch.CONTRADICTED
                    )
                # Free-text or non-boolean cannot be silently converted to bool
                return ConditionMatch.UNSUPPORTED

            if isinstance(claim_value, (int, float)) and isinstance(
                expected_value, (int, float)
            ):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value == expected_value
                    else ConditionMatch.CONTRADICTED
                )

            if isinstance(claim_value, str) and isinstance(expected_value, str):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value.strip().lower() == expected_value.strip().lower()
                    else ConditionMatch.CONTRADICTED
                )

            return ConditionMatch.UNSUPPORTED

        if operator == ConditionOperator.NOT_EQUALS:
            if isinstance(expected_value, bool):
                if isinstance(claim_value, bool):
                    return (
                        ConditionMatch.SATISFIED
                        if claim_value != expected_value
                        else ConditionMatch.CONTRADICTED
                    )
                return ConditionMatch.UNSUPPORTED

            if isinstance(claim_value, (int, float)) and isinstance(
                expected_value, (int, float)
            ):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value != expected_value
                    else ConditionMatch.CONTRADICTED
                )

            if isinstance(claim_value, str) and isinstance(expected_value, str):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value.strip().lower() != expected_value.strip().lower()
                    else ConditionMatch.CONTRADICTED
                )

            return ConditionMatch.UNSUPPORTED

        if operator == ConditionOperator.GREATER_THAN_OR_EQUAL:
            if isinstance(claim_value, (int, float)) and isinstance(
                expected_value, (int, float)
            ):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value >= expected_value
                    else ConditionMatch.CONTRADICTED
                )
            return ConditionMatch.UNSUPPORTED

        if operator == ConditionOperator.LESS_THAN_OR_EQUAL:
            if isinstance(claim_value, (int, float)) and isinstance(
                expected_value, (int, float)
            ):
                return (
                    ConditionMatch.SATISFIED
                    if claim_value <= expected_value
                    else ConditionMatch.CONTRADICTED
                )
            return ConditionMatch.UNSUPPORTED

        return ConditionMatch.UNSUPPORTED

    def _aggregate_outcomes(
        self,
        assessments: list[RequirementAssessment],
    ) -> tuple[PossibilityOutcome, str]:
        """Apply deterministic aggregate decision precedence rules."""
        mandatory = [
            a for a in assessments if a.priority == RequirementPriority.MANDATORY
        ]
        optional = [
            a for a in assessments if a.priority == RequirementPriority.OPTIONAL
        ]

        # Rule 5: No mandatory requirements provided
        if not mandatory:
            return (
                PossibilityOutcome.NEEDS_CONFIRMATION,
                (
                    "No mandatory requirements were provided. An assessment without "
                    "mandatory requirements cannot establish verified suitability "
                    "or general accessibility."
                ),
            )

        # Rule 1: Mandatory requirement conflict takes absolute precedence
        conflicted = [
            a for a in mandatory if a.outcome == RequirementOutcome.CONTRADICTED
        ]
        if conflicted:
            conflicted_ids = ", ".join(a.requirement_id for a in conflicted)
            return (
                PossibilityOutcome.REQUIREMENT_CONFLICT,
                (
                    f"Requirement conflict identified for mandatory requirement(s): "
                    f"{conflicted_ids}. Applicable evidence establishes an "
                    "incompatibility."
                ),
            )

        # Rule 2: Unverified mandatory requirements require confirmation
        unconfirmed = [
            a for a in mandatory if a.outcome != RequirementOutcome.SUPPORTED
        ]
        if unconfirmed:
            unconfirmed_details = ", ".join(
                f"{a.requirement_id} ({a.outcome.value})" for a in unconfirmed
            )
            return (
                PossibilityOutcome.NEEDS_CONFIRMATION,
                (
                    "Mandatory requirement(s) require confirmation: "
                    f"{unconfirmed_details}."
                ),
            )

        # Rule 3 & 4: All mandatory requirements supported
        unsupported_optional = [
            a for a in optional if a.outcome != RequirementOutcome.SUPPORTED
        ]
        if unsupported_optional:
            opt_notes = ", ".join(
                f"{a.requirement_id} ({a.outcome.value})" for a in unsupported_optional
            )
            return (
                PossibilityOutcome.VERIFIED_FIT,
                (
                    "All mandatory requirements are verified fits. Note optional "
                    f"preference(s) need review: {opt_notes}."
                ),
            )

        return (
            PossibilityOutcome.VERIFIED_FIT,
            (
                "All stated mandatory requirements are verified and supported by "
                "independent evidence."
            ),
        )
