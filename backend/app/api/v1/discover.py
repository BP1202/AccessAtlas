"""Discovery endpoint router for AccessAtlas v1 API."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.agent.graph import AccessAtlasAgent
from app.agent.models import AgentWorkflowInput
from app.api.deps import get_agent
from app.api.v1.schemas import DiscoverRequest, DiscoverResponse

router = APIRouter(prefix="/api/v1", tags=["discovery"])

SUPPORTED_PILOT_CITY = "ahmedabad"


@router.post(
    "/discover",
    response_model=DiscoverResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover cultural experiences with deterministic participation planning",
    description=(
        "Discovers cultural candidates via Qloo, resolves them to independently "
        "sourced venue evidence in the Ahmedabad pilot, deterministically evaluates "
        "explicit participation requirements, and produces structured plans."
    ),
)
def discover_cultural_experiences(
    request: DiscoverRequest,
    agent: Annotated[AccessAtlasAgent, Depends(get_agent)],
) -> DiscoverResponse:
    """Execute cultural discovery and participation planning for Ahmedabad."""
    # 1. Enforce pilot city restriction
    normalized_city = request.city.strip().lower() if request.city else ""
    if normalized_city != SUPPORTED_PILOT_CITY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported pilot city '{request.city}'. "
                "Only 'Ahmedabad' is supported in the current pilot release."
            ),
        )

    # 2. Build AgentWorkflowInput
    cultural_query = ", ".join(request.cultural_interests)
    workflow_input = AgentWorkflowInput(
        cultural_query=cultural_query,
        cultural_interests=request.cultural_interests,
        target_type="urn:entity:place",
        requirements=request.requirements,
        max_candidates=request.max_candidates,
        evaluation_time=request.evaluation_time,
    )

    # 3. Execute agent workflow synchronously (FastAPI runs def in AnyIO threadpool)
    output = agent.run(workflow_input)

    # 4. Handle upstream provider / discovery failures if recorded in output
    if output.discovery_error:
        err = output.discovery_error
        if "QlooAuthenticationError" in err:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Upstream cultural discovery authentication failed.",
            )
        if "QlooRateLimitError" in err:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Upstream cultural discovery rate limit exceeded. "
                    "Please try again later."
                ),
            )
        if "QlooTimeoutError" in err:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Upstream cultural discovery request timed out. Please retry.",
            )
        if "QlooResponseError" in err:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Upstream cultural discovery provider error.",
            )
        if "QlooConfigurationError" in err:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cultural discovery service is not configured.",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Upstream cultural discovery service error.",
        )

    # 5. Return serializable DiscoverResponse
    return DiscoverResponse(
        city="Ahmedabad",
        cultural_interests=request.cultural_interests,
        total_candidates_found=output.total_candidates_found,
        candidates_evaluated=output.candidates_evaluated,
        plans=output.plans,
        cultural_threads=output.cultural_threads,
        discovery_error=None,
        workflow_summary=output.workflow_summary,
    )
