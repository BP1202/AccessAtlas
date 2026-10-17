"""Read-only repository abstraction and in-memory implementation for venue evidence."""

from abc import ABC, abstractmethod

from app.evidence.models import EvidenceRecord


class VenueEvidenceRepository(ABC):
    """Abstract interface for read-only access to venue and experience evidence."""

    @abstractmethod
    def get_by_venue_id(self, venue_id: str) -> EvidenceRecord | None:
        """Retrieve evidence record for a venue by its unique venue_id."""
        raise NotImplementedError

    @abstractmethod
    def get_by_experience_id(self, experience_id: str) -> EvidenceRecord | None:
        """Retrieve evidence record for an experience by its unique experience_id."""
        raise NotImplementedError

    @abstractmethod
    def list_all(self) -> list[EvidenceRecord]:
        """List all available evidence records."""
        raise NotImplementedError


class InMemoryVenueEvidenceRepository(VenueEvidenceRepository):
    """In-memory implementation of VenueEvidenceRepository.

    Indexes pre-loaded EvidenceRecord instances by venue_id and experience_id.
    """

    def __init__(self, records: list[EvidenceRecord] | None = None) -> None:
        self._records: list[EvidenceRecord] = list(records or [])
        self._by_venue_id: dict[str, EvidenceRecord] = {}
        self._by_experience_id: dict[str, EvidenceRecord] = {}

        for rec in self._records:
            # Map venue
            self._by_venue_id[rec.venue.venue_id] = rec
            # Map experience if present
            if rec.experience:
                self._by_experience_id[rec.experience.experience_id] = rec

    def get_by_venue_id(self, venue_id: str) -> EvidenceRecord | None:
        """Retrieve evidence record matching venue_id, or None if not found."""
        return self._by_venue_id.get(venue_id.strip())

    def get_by_experience_id(self, experience_id: str) -> EvidenceRecord | None:
        """Retrieve evidence record matching experience_id, or None if not found."""
        return self._by_experience_id.get(experience_id.strip())

    def list_all(self) -> list[EvidenceRecord]:
        """Return a copy of all loaded records."""
        return list(self._records)
