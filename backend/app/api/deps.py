"""Dependency injection providers for AccessAtlas FastAPI endpoints.

Provides managed instances of the Qloo client, candidate resolver, evidence
repository, Possibility Engine, and LangGraph agent. Ensures proper HTTPX
session cleanup per request without global mutable state.
"""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends

from app.agent.graph import AccessAtlasAgent
from app.agent.resolution import InMemoryCandidateResolver
from app.core.config import Settings, get_settings
from app.evidence.pilot_ahmedabad import (
    create_ahmedabad_candidate_resolver,
    create_ahmedabad_pilot_repository,
)
from app.evidence.repository import InMemoryVenueEvidenceRepository
from app.possibility.engine import PossibilityEngine
from app.qloo.client import QlooClient


def get_qloo_client(
    settings: Annotated[Settings, Depends(get_settings)],
) -> Generator[QlooClient, None, None]:
    """Provide a managed QlooClient instance for the request lifecycle.

    Uses a generator dependency so FastAPI ensures client.close() is called
    after request processing completes, preventing unmanaged connection leaks.
    """
    client = QlooClient(settings=settings)
    try:
        yield client
    finally:
        client.close()


def get_candidate_resolver() -> InMemoryCandidateResolver:
    """Provide the reviewed Ahmedabad pilot candidate resolver."""
    return create_ahmedabad_candidate_resolver()


def get_evidence_repository() -> InMemoryVenueEvidenceRepository:
    """Provide the reviewed Ahmedabad pilot evidence repository."""
    return create_ahmedabad_pilot_repository()


def get_possibility_engine() -> PossibilityEngine:
    """Provide the deterministic PossibilityEngine."""
    return PossibilityEngine()


def get_agent(
    qloo_client: Annotated[QlooClient, Depends(get_qloo_client)],
    resolver: Annotated[InMemoryCandidateResolver, Depends(get_candidate_resolver)],
    evidence_repo: Annotated[
        InMemoryVenueEvidenceRepository, Depends(get_evidence_repository)
    ],
    engine: Annotated[PossibilityEngine, Depends(get_possibility_engine)],
) -> AccessAtlasAgent:
    """Provide an AccessAtlasAgent configured with Ahmedabad pilot dependencies."""
    return AccessAtlasAgent(
        qloo_client=qloo_client,
        resolver=resolver,
        evidence_repo=evidence_repo,
        engine=engine,
    )
