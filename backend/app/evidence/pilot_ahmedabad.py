"""Independently sourced evidence records and Qloo mappings for the Ahmedabad pilot.

PILOT CITY:
    Ahmedabad, Gujarat, India.

VENUE CANDIDATES:
    1. Calico Museum of Textiles ("The Retreat", Shahibaug)
    2. Kasturbhai Lalbhai Museum (Lalbaug, Shahibaug)
    3. Conflictorium — Museum of Conflict (Gool Lodge, Mirzapur, Ahmedabad location)

GOVERNANCE & INVARIANTS:
- All claims reflect verified web publications retrieved on 2026-10-18T16:25:00+05:30.
- Source types are classified as OFFICIAL_VENUE_WEBSITE (not on-site audits).
- Undocumented accessibility attributes remain strictly UNKNOWN; silence is never
  converted into a negative claim.
- Calico's published wheelchair-access policy is preserved explicitly and not
  misrepresented as a step-free entrance threshold fact.
- Candidate mappings are strictly 1-to-1, reviewed against developer Qloo lookup
  results. No fuzzy matching, popularity thresholds, or automatic resolution.
"""

from datetime import datetime, timedelta, timezone

from app.agent.resolution import CandidateMapping, InMemoryCandidateResolver
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
from app.evidence.repository import InMemoryVenueEvidenceRepository

# Documented retrieval timestamp in Indian Standard Time (IST, UTC+05:30)
AHMEDABAD_RETRIEVAL_TIMESTAMP = datetime(
    2026, 10, 18, 16, 25, 0, tzinfo=timezone(timedelta(hours=5, minutes=30))
)

# Approved Qloo Entity IDs reviewed against developer search results
QLOO_ID_CALICO = "783C0235-681D-4235-BA4D-A57992F7C97A"
QLOO_ID_KASTURBHAI = "36537424-5653-418C-A39E-33C17214D423"
QLOO_ID_CONFLICTIORIUM_AHMEDABAD = "8090F76A-F5EE-4931-8942-12B1FF3C4996"

# Explicitly excluded Qloo Entity IDs (must NOT be mapped)
EXCLUDED_QLOO_IDS = {
    "7A72825D-1C1F-4433-9113-AE6DADA44862": (
        "Conflictorium Raipur branch (out of Ahmedabad pilot scope)"
    ),
    "D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D": (
        "Geographically inconsistent Conflictorium duplicate entity"
    ),
}

# Venue Identifiers
VENUE_ID_CALICO = "ven_in_ahm_calico"
VENUE_ID_KASTURBHAI = "ven_in_ahm_kasturbhai"
VENUE_ID_CONFLICTIORIUM = "ven_in_ahm_conflictorium"

# Experience Identifiers
EXP_ID_CALICO_HAVELI = "exp_in_ahm_calico_haveli"
EXP_ID_CALICO_CHAUK = "exp_in_ahm_calico_chauk"
EXP_ID_KLM_GUIDED_TOUR = "exp_in_ahm_klm_guided_tour"


def create_calico_museum_record() -> EvidenceRecord:
    """Evidence record for Calico Museum of Textiles (Shahibaug, Ahmedabad)."""
    venue = VenueIdentity(
        venue_id=VENUE_ID_CALICO,
        name="Calico Museum of Textiles",
        address="The Retreat, Opp. Underbridge, Shahibaug",
        locality="Ahmedabad",
        postal_code="380004",
        country_code="IN",
    )

    tour_guidelines_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://www.calicomuseum.org/tour-guidelines/",
        title="Sarabhai Foundation — Calico Museum Tour Guidelines",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    # 1. Wheelchair Access: Explicitly unsupported by official operational policy
    wheelchair_claim = EvidenceClaim(
        attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
        scope=ClaimScope.VENUE,
        value=False,
        details=(
            "Official statement: 'The Foundation is currently unable to offer "
            "wheelchair access to visitors.' Historic multi-level domestic havelis "
            "with varying floor surfaces, narrow passages, and low lintels."
        ),
        source=tour_guidelines_source,
    )
    wheelchair_ev = AttributeEvidence(
        attribute=EvidenceAttribute.WHEELCHAIR_ACCESS,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[wheelchair_claim],
        summary=(
            "Official policy states that the foundation is currently unable to offer "
            "wheelchair access to visitors."
        ),
    )

    # 2. Advance Reservation: Mandatory online pre-registration
    reservation_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        value=True,
        details=(
            "Mandatory advance online registration opens 90 days in advance of the "
            "tour date. Bookings are accepted from the 90-day opening horizon until "
            "capacity (strictly 20 persons per tour) is exhausted; this is not a "
            "minimum 90-day advance booking requirement. Admission is free of cost. "
            "Entry gates close promptly 15 minutes before tour commencement."
        ),
        source=tour_guidelines_source,
    )
    reservation_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[reservation_claim],
        summary=(
            "Prior online registration required; booking window opens 90 days in "
            "advance; admission free, capped at 20 visitors per tour."
        ),
    )

    # 3. Step-free entrance: UNKNOWN on official channels
    # (not converted from wheelchair policy)
    step_free_entrance_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "Physical entrance threshold geometry is unrecorded on official channels. "
            "Wheelchair access is unsupported across venue tours."
        ),
    )

    # 4. Internal elevator: UNKNOWN (silence on mechanical lifts in haveli structures)
    internal_elevator_ev = AttributeEvidence(
        attribute=EvidenceAttribute.INTERNAL_ELEVATOR,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary="Elevator provision is not explicitly stated on official channels.",
    )

    # 5. Restrooms: UNKNOWN
    restroom_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_RESTROOM,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "Restroom dimensions and accessibility features are unrecorded on official "
            "channels."
        ),
    )

    # 6. Service animals: UNKNOWN
    service_animal_ev = AttributeEvidence(
        attribute=EvidenceAttribute.SERVICE_ANIMAL_POLICY,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "Service animal policy is unrecorded on official channels; requires direct "
            "venue confirmation."
        ),
    )

    # 7. Companion policy: UNKNOWN for disability carers
    companion_ev = AttributeEvidence(
        attribute=EvidenceAttribute.COMPANION_ENTRY_POLICY,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "Disability companion or carer entry policy is unrecorded on official "
            "channels. (Child admission qualification: children under 10 prohibited; "
            "ages 10-15 must be accompanied by an adult)."
        ),
    )

    # 8. Seating: UNKNOWN
    seating_ev = AttributeEvidence(
        attribute=EvidenceAttribute.SEATING_AVAILABLE,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary="Seating availability along guided tour route is unrecorded.",
    )

    # 9. Contact for access info: UNKNOWN (general contacts only)
    contact_ev = AttributeEvidence(
        attribute=EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "General administrative contacts published (calicomuseum@gmail.com, "
            "+91 79 22868172); dedicated accessibility coordinator is unrecorded."
        ),
    )

    return EvidenceRecord(
        venue=venue,
        venue_evidence={
            EvidenceAttribute.WHEELCHAIR_ACCESS: wheelchair_ev,
            EvidenceAttribute.RESERVATION_REQUIRED: reservation_ev,
            EvidenceAttribute.STEP_FREE_ENTRANCE: step_free_entrance_ev,
            EvidenceAttribute.INTERNAL_ELEVATOR: internal_elevator_ev,
            EvidenceAttribute.STEP_FREE_RESTROOM: restroom_ev,
            EvidenceAttribute.SERVICE_ANIMAL_POLICY: service_animal_ev,
            EvidenceAttribute.COMPANION_ENTRY_POLICY: companion_ev,
            EvidenceAttribute.SEATING_AVAILABLE: seating_ev,
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO: contact_ev,
        },
    )


def create_calico_haveli_tour_record() -> EvidenceRecord:
    """Experience-scoped evidence record for the Calico Haveli Morning Tour."""
    venue_record = create_calico_museum_record()
    experience = ExperienceIdentity(
        experience_id=EXP_ID_CALICO_HAVELI,
        venue_id=VENUE_ID_CALICO,
        title="The Haveli Galleries Morning Tour",
        description=(
            "Conducted morning tour (10:30 AM - 12:30 PM) focusing on religious "
            "textiles, Pichhwais, Jain art, and miniature paintings in the haveli."
        ),
    )

    tour_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://www.calicomuseum.org/tour-guidelines/",
        title="Sarabhai Foundation — Tour Guidelines",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    exp_res_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.EXPERIENCE,
        value=True,
        details=(
            "Morning tour slot (10:30 AM - 12:30 PM); online registration opens "
            "90 days in advance; strictly capped at 20 persons."
        ),
        source=tour_source,
    )
    exp_res_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[exp_res_claim],
        summary="Mandatory registration for Haveli tour, capped at 20 visitors.",
    )

    exp_entrance_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary=(
            "Haveli interior involves historic wooden steps and split levels; exact "
            "entrance threshold details are unrecorded."
        ),
    )

    return EvidenceRecord(
        venue=venue_record.venue,
        experience=experience,
        venue_evidence=venue_record.venue_evidence,
        experience_evidence={
            EvidenceAttribute.RESERVATION_REQUIRED: exp_res_ev,
            EvidenceAttribute.STEP_FREE_ENTRANCE: exp_entrance_ev,
        },
    )


def create_calico_chauk_tour_record() -> EvidenceRecord:
    """Experience-scoped evidence record for the Calico Chauk Afternoon Tour."""
    venue_record = create_calico_museum_record()
    experience = ExperienceIdentity(
        experience_id=EXP_ID_CALICO_CHAUK,
        venue_id=VENUE_ID_CALICO,
        title="The Chauk Galleries Afternoon Tour",
        description=(
            "Conducted afternoon tour (2:30 PM - 4:30 PM) focusing on court costumes, "
            "Mughal and regional textiles, carpets, and armor."
        ),
    )

    tour_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://www.calicomuseum.org/tour-guidelines/",
        title="Sarabhai Foundation — Tour Guidelines",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    exp_res_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.EXPERIENCE,
        value=True,
        details=(
            "Afternoon tour slot (2:30 PM - 4:30 PM); online registration opens "
            "90 days in advance; strictly capped at 20 persons."
        ),
        source=tour_source,
    )
    exp_res_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[exp_res_claim],
        summary="Mandatory advance registration for Chauk tour, capped at 20 visitors.",
    )

    exp_entrance_ev = AttributeEvidence(
        attribute=EvidenceAttribute.STEP_FREE_ENTRANCE,
        status=EvidenceStatus.UNKNOWN,
        claims=[],
        summary="Chauk galleries involve split-level pavilions; steps unrecorded.",
    )

    return EvidenceRecord(
        venue=venue_record.venue,
        experience=experience,
        venue_evidence=venue_record.venue_evidence,
        experience_evidence={
            EvidenceAttribute.RESERVATION_REQUIRED: exp_res_ev,
            EvidenceAttribute.STEP_FREE_ENTRANCE: exp_entrance_ev,
        },
    )


def create_kasturbhai_lalbhai_record() -> EvidenceRecord:
    """Evidence record for Kasturbhai Lalbhai Museum (Shahibaug, Ahmedabad)."""
    venue = VenueIdentity(
        venue_id=VENUE_ID_KASTURBHAI,
        name="Kasturbhai Lalbhai Museum",
        address="Lalbaug, Shahibaug",
        locality="Ahmedabad",
        postal_code="380004",
        country_code="IN",
    )

    klm_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://kasturbhailalbhaimuseum.com/",
        title="Kasturbhai Lalbhai Museum — Guidelines & FAQ",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    # 1. Advance Reservation: Guided tour only
    reservation_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        value=True,
        details=(
            "Visits are strictly by conducted tour only; unguided walk-ins not "
            "permitted for ordinary visits. Advance booking via telephone "
            "(+91 79 2286-5456 / +91 79 2286-6376) or email (klmuseum16@gmail.com) "
            "is required. Four daily tour slots (10:00 AM, 12:00 PM, 2:30 PM, 4:00 PM) "
            "conducted in small batches (capped at approximately 12 people). "
            "Open Tuesday to Sunday; closed Mondays and public holidays."
        ),
        source=klm_source,
    )
    reservation_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[reservation_claim],
        summary=(
            "Compulsory guided tours booked in advance by phone or email; 4 slots "
            "daily, small batches capped at ~12 visitors."
        ),
    )

    # Undocumented accessibility attributes preserved strictly as UNKNOWN
    unknown_attrs = [
        (
            EvidenceAttribute.STEP_FREE_ENTRANCE,
            "Ramp provision to the 1905 ancestral home or Claude Batley wing is "
            "unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.INTERNAL_ELEVATOR,
            "Internal elevator access to upper residential floors is unrecorded.",
        ),
        (
            EvidenceAttribute.SEATING_AVAILABLE,
            "Rest seating availability along the 30-minute tour route is unrecorded.",
        ),
        (
            EvidenceAttribute.STEP_FREE_RESTROOM,
            "Campus restroom accessibility details are unrecorded.",
        ),
        (
            EvidenceAttribute.SERVICE_ANIMAL_POLICY,
            "Assistance animal policy is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.COMPANION_ENTRY_POLICY,
            "Carer or companion entry policy is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
            "General booking contacts published (klmuseum16@gmail.com, "
            "+91 79 2286-5456); dedicated accessibility coordination is unrecorded.",
        ),
    ]

    venue_evidence: dict[EvidenceAttribute, AttributeEvidence] = {
        EvidenceAttribute.RESERVATION_REQUIRED: reservation_ev,
    }
    for attr, summary in unknown_attrs:
        venue_evidence[attr] = AttributeEvidence(
            attribute=attr,
            status=EvidenceStatus.UNKNOWN,
            claims=[],
            summary=summary,
        )

    return EvidenceRecord(
        venue=venue,
        venue_evidence=venue_evidence,
    )


def create_kasturbhai_guided_tour_record() -> EvidenceRecord:
    """Experience-scoped evidence record for Kasturbhai Lalbhai Museum Guided Tour."""
    venue_record = create_kasturbhai_lalbhai_record()
    experience = ExperienceIdentity(
        experience_id=EXP_ID_KLM_GUIDED_TOUR,
        venue_id=VENUE_ID_KASTURBHAI,
        title="Guided Heritage House & Gallery Tour",
        description=(
            "Conducted ~30-minute guided tour through the 1905 colonial house and "
            "modern display galleries. 4 daily slots (10am, 12pm, 2:30pm, 4pm)."
        ),
    )

    klm_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://kasturbhailalbhaimuseum.com/",
        title="Kasturbhai Lalbhai Museum — Guidelines & FAQ",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    exp_res_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.EXPERIENCE,
        value=True,
        details=(
            "Advance telephone or email booking required; 4 daily tour slots; batch "
            "capped at ~12 visitors."
        ),
        source=klm_source,
    )
    exp_res_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[exp_res_claim],
        summary="Advance tour reservation required via telephone or email.",
    )

    return EvidenceRecord(
        venue=venue_record.venue,
        experience=experience,
        venue_evidence=venue_record.venue_evidence,
        experience_evidence={
            EvidenceAttribute.RESERVATION_REQUIRED: exp_res_ev,
        },
    )


def create_conflictorium_record() -> EvidenceRecord:
    """Evidence record for Conflictorium — Museum of Conflict (Ahmedabad)."""
    venue = VenueIdentity(
        venue_id=VENUE_ID_CONFLICTIORIUM,
        name="Conflictorium",
        address="Gool Lodge, Opp. R.C. High School of Commerce, Delhi Chakla, Mirzapur",
        locality="Ahmedabad",
        postal_code="380001",
        country_code="IN",
    )

    cnf_source = EvidenceSource(
        source_type=SourceType.OFFICIAL_VENUE_WEBSITE,
        url="https://www.conflictorium.org/",
        title="Conflictorium — Museum of Conflict (Ahmedabad Location)",
        verified_at=AHMEDABAD_RETRIEVAL_TIMESTAMP,
    )

    # 1. Advance Reservation: False for ordinary walk-in museum visits
    reservation_claim = EvidenceClaim(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        scope=ClaimScope.VENUE,
        value=False,
        details=(
            "Ordinary museum admission to Gool Lodge is free and open to the public "
            "without reservations (Tuesday-Sunday, 11:00 AM - 7:00 PM). Special "
            "workshops, panel dialogues, or performances in 'The Third Space' may "
            "require separate RSVP or sign-up depending on event capacity."
        ),
        source=cnf_source,
    )
    reservation_ev = AttributeEvidence(
        attribute=EvidenceAttribute.RESERVATION_REQUIRED,
        status=EvidenceStatus.SOURCE_BACKED,
        claims=[reservation_claim],
        summary=(
            "Free walk-in admission for ordinary visits; workshops or special events "
            "may require separate registration."
        ),
    )

    # Undocumented accessibility attributes preserved strictly as UNKNOWN
    unknown_attrs = [
        (
            EvidenceAttribute.STEP_FREE_ENTRANCE,
            "Raised plinth threshold visible in exterior imagery; physical ramp "
            "existence or portable ramp deployment is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.INTERNAL_ELEVATOR,
            "Multi-story residential bungalow with historic wooden staircase; elevator "
            "presence is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.SEATING_AVAILABLE,
            "Rest seating along exhibition circulation paths is unrecorded.",
        ),
        (
            EvidenceAttribute.STEP_FREE_RESTROOM,
            "Restroom dimensions and accessibility features are unrecorded.",
        ),
        (
            EvidenceAttribute.SERVICE_ANIMAL_POLICY,
            "Assistance animal policy is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.COMPANION_ENTRY_POLICY,
            "Carer or companion entry policy is unrecorded on official channels.",
        ),
        (
            EvidenceAttribute.CONTACT_FOR_ACCESS_INFO,
            "General institutional contacts published (dialogue@conflictorium.org, "
            "+91 79 25620747); dedicated accessibility coordinator is unrecorded.",
        ),
    ]

    venue_evidence: dict[EvidenceAttribute, AttributeEvidence] = {
        EvidenceAttribute.RESERVATION_REQUIRED: reservation_ev,
    }
    for attr, summary in unknown_attrs:
        venue_evidence[attr] = AttributeEvidence(
            attribute=attr,
            status=EvidenceStatus.UNKNOWN,
            claims=[],
            summary=summary,
        )

    return EvidenceRecord(
        venue=venue,
        venue_evidence=venue_evidence,
    )


def create_ahmedabad_pilot_records() -> list[EvidenceRecord]:
    """Return all venue and experience evidence records for the Ahmedabad pilot."""
    return [
        create_calico_museum_record(),
        create_calico_haveli_tour_record(),
        create_calico_chauk_tour_record(),
        create_kasturbhai_lalbhai_record(),
        create_kasturbhai_guided_tour_record(),
        create_conflictorium_record(),
    ]


def create_ahmedabad_pilot_repository() -> InMemoryVenueEvidenceRepository:
    """Return in-memory repository with reviewed Ahmedabad pilot evidence."""
    return InMemoryVenueEvidenceRepository(create_ahmedabad_pilot_records())


def create_ahmedabad_pilot_mappings() -> list[CandidateMapping]:
    """Return reviewed mappings from Qloo IDs to Ahmedabad pilot venues."""
    return [
        CandidateMapping(
            qloo_entity_id=QLOO_ID_CALICO,
            venue_id=VENUE_ID_CALICO,
            experience_id=None,
            notes=(
                "Calico Museum of Textiles (Shahibaug, Ahmedabad). Verified against "
                "developer live Qloo Search results."
            ),
        ),
        CandidateMapping(
            qloo_entity_id=QLOO_ID_KASTURBHAI,
            venue_id=VENUE_ID_KASTURBHAI,
            experience_id=None,
            notes=(
                "Kasturbhai Lalbhai Museum (Shahibaug, Ahmedabad). Verified against "
                "developer live Qloo Search results."
            ),
        ),
        CandidateMapping(
            qloo_entity_id=QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
            venue_id=VENUE_ID_CONFLICTIORIUM,
            experience_id=None,
            notes=(
                "Conflictorium (Mirzapur, Ahmedabad location). Verified against "
                "developer live Qloo Search results. Strictly distinguished from "
                "Raipur branch (7A72825D-1C1F-4433-9113-AE6DADA44862) and duplicate "
                "entity (D191DAE2-2CE7-4301-8CD3-EE7B38D68A4D)."
            ),
        ),
    ]


def create_ahmedabad_candidate_resolver() -> InMemoryCandidateResolver:
    """Return a CandidateResolver containing reviewed Ahmedabad pilot mappings."""
    return InMemoryCandidateResolver(create_ahmedabad_pilot_mappings())


def create_ahmedabad_agent(
    qloo_client: object,
    engine: object | None = None,
) -> object:
    """Instantiate the AccessAtlasAgent workflow configured for Ahmedabad pilot."""
    from app.agent.graph import AccessAtlasAgent
    from app.possibility.engine import PossibilityEngine
    from app.qloo.client import QlooClient

    if not isinstance(qloo_client, QlooClient):
        raise TypeError(f"Expected QlooClient, got {type(qloo_client).__name__}")
    if engine is not None and not isinstance(engine, PossibilityEngine):
        raise TypeError(f"Expected PossibilityEngine, got {type(engine).__name__}")

    return AccessAtlasAgent(
        qloo_client=qloo_client,
        resolver=create_ahmedabad_candidate_resolver(),
        evidence_repo=create_ahmedabad_pilot_repository(),
        engine=engine or PossibilityEngine(),
    )
