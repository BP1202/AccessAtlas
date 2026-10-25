"""Deterministic Cultural Threads synthesis for AccessAtlas.

Maps visitor-expressed cultural interests to discovered candidates and establishes
provenance-aware connection rationales grounded strictly in Qloo responses and
application evidence mappings without fabricating relationships or confidence scores.
"""

import re

from app.agent.models import (
    CandidateResolutionStatus,
    CulturalThread,
    CulturalThreadAnchor,
    CulturalThreadCandidate,
    CulturalThreadConnection,
    ResolvedCandidate,
    ThreadConnectionType,
    ThreadSourceType,
)


def _slugify(text: str) -> str:
    """Normalize a string to a safe, deterministic identifier slug."""
    lowered = text.lower().strip()
    cleaned = re.sub(r"[^a-z0-9]+", "_", lowered)
    return cleaned.strip("_") or "unknown"


def build_cultural_threads(
    interests: list[str],
    resolved_candidates: list[ResolvedCandidate],
) -> list[CulturalThread]:
    """Build provenance-aware CulturalThread records connecting interests to candidates.

    Guarantees:
    1. Zero invented relationship scores, affinity percentages, or confidence values.
    2. Connection source types clearly distinguish explicit visitor choices,
       deterministic application mappings, and actual Qloo responses.
    3. Unmapped candidates are honestly reported with has_reviewed_evidence=False
       and is_evaluation_eligible=False.
    4. Candidates with identical entity_id are deduplicated.
    5. Empty interests or candidate lists produce an empty thread list safely.
    """
    clean_interests = [i.strip() for i in interests if i and i.strip()]
    if not clean_interests or not resolved_candidates:
        return []

    threads: list[CulturalThread] = []
    seen_entity_ids: set[str] = set()

    for res in resolved_candidates:
        entity = res.qloo_entity
        if entity.entity_id in seen_entity_ids:
            continue
        seen_entity_ids.add(entity.entity_id)

        has_evidence = (
            res.status == CandidateResolutionStatus.RESOLVED
            and res.evidence_record is not None
        )
        is_eligible = has_evidence

        thread_candidate = CulturalThreadCandidate(
            entity_id=entity.entity_id,
            name=entity.name,
            entity_type=entity.entity_type,
            subtype=entity.subtype,
            popularity=entity.popularity,
            mapping_status=res.status,
            has_reviewed_evidence=has_evidence,
            is_evaluation_eligible=is_eligible,
            venue_id=res.venue_id,
        )

        # Match against expressed interests in priority order:
        # 1. Tag match
        # 2. Subtype match
        # 3. Direct name or disambiguation match
        # 4. Fallback discovered candidate (associated with primary interest)
        matched_interest = clean_interests[0]
        match_kind = "discovered"
        matched_descriptor = ""

        # Check for tag matches
        tag_found = False
        for interest in clean_interests:
            int_lower = interest.lower()
            for tag in entity.tags:
                tag_lower = tag.name.lower()
                if int_lower in tag_lower or tag_lower in int_lower:
                    matched_interest = interest
                    match_kind = "tag"
                    matched_descriptor = tag.name
                    tag_found = True
                    break
            if tag_found:
                break

        # Check for subtype match if no tag match
        if not tag_found and entity.subtype:
            sub_lower = entity.subtype.lower()
            for interest in clean_interests:
                int_lower = interest.lower()
                if int_lower in sub_lower or sub_lower in int_lower:
                    matched_interest = interest
                    match_kind = "subtype"
                    matched_descriptor = entity.subtype
                    break

        # Check for direct entity name / disambiguation match if still unfound
        if match_kind == "discovered":
            for interest in clean_interests:
                int_lower = interest.lower()
                if int_lower in entity.name.lower() or (
                    entity.disambiguation
                    and int_lower in entity.disambiguation.lower()
                ):
                    matched_interest = interest
                    match_kind = "direct"
                    matched_descriptor = interest
                    break

        # Construct Anchor and Connection based on match kind
        if match_kind == "tag":
            anchor = CulturalThreadAnchor(
                interest=matched_interest,
                source_type=ThreadSourceType.EXPLICIT_VISITOR_SELECTION,
                matched_tag=matched_descriptor,
            )
            connection = CulturalThreadConnection(
                connection_type=ThreadConnectionType.SHARED_TAG,
                source_type=ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING,
                shared_descriptors=[matched_descriptor],
                rationale=(
                    f"Matched expressed interest '{matched_interest}' via Qloo "
                    f"cultural tag '{matched_descriptor}'."
                ),
            )
        elif match_kind == "subtype":
            anchor = CulturalThreadAnchor(
                interest=matched_interest,
                source_type=ThreadSourceType.EXPLICIT_VISITOR_SELECTION,
            )
            connection = CulturalThreadConnection(
                connection_type=ThreadConnectionType.SHARED_SUBTYPE,
                source_type=ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING,
                shared_descriptors=[matched_descriptor],
                rationale=(
                    f"Matched expressed interest '{matched_interest}' via candidate "
                    f"subtype '{matched_descriptor}'."
                ),
            )
        elif match_kind == "direct":
            anchor = CulturalThreadAnchor(
                interest=matched_interest,
                source_type=ThreadSourceType.EXPLICIT_VISITOR_SELECTION,
            )
            connection = CulturalThreadConnection(
                connection_type=ThreadConnectionType.EXPLICIT_INTEREST_MATCH,
                source_type=ThreadSourceType.DETERMINISTIC_APPLICATION_MAPPING,
                shared_descriptors=[matched_descriptor],
                rationale=f"Direct match for expressed interest '{matched_interest}'.",
            )
        else:
            anchor = CulturalThreadAnchor(
                interest=matched_interest,
                source_type=ThreadSourceType.EXPLICIT_VISITOR_SELECTION,
            )
            descriptors = [t.name for t in entity.tags[:3]] if entity.tags else []
            connection = CulturalThreadConnection(
                connection_type=ThreadConnectionType.DISCOVERED_CANDIDATE,
                source_type=ThreadSourceType.ACTUAL_QLOO_RESPONSE,
                shared_descriptors=descriptors,
                rationale=(
                    f"Discovered by Qloo for cultural query '{matched_interest}'."
                ),
            )

        thread_slug = (
            f"thread_{_slugify(entity.name)}_{_slugify(matched_interest)}"
        )

        threads.append(
            CulturalThread(
                thread_id=thread_slug,
                starting_interest=matched_interest,
                anchor=anchor,
                candidate=thread_candidate,
                connection=connection,
                provenance="qloo_search_discovery",
            )
        )

    return threads
