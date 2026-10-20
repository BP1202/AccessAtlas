from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.api.v1.discover import router as discover_router
from app.core.config import get_settings
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooError,
    QlooRateLimitError,
    QlooResponseError,
    QlooTimeoutError,
)

settings = get_settings()

app = FastAPI(
    title="AccessAtlas Backend",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)


@app.exception_handler(QlooConfigurationError)
def qloo_configuration_exception_handler(
    request: Request, exc: QlooConfigurationError
) -> JSONResponse:
    """Handle missing or invalid Qloo configuration."""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": "Cultural discovery service is not configured."},
    )


@app.exception_handler(QlooAuthenticationError)
def qloo_authentication_exception_handler(
    request: Request, exc: QlooAuthenticationError
) -> JSONResponse:
    """Handle upstream Qloo authentication failure."""
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"detail": "Upstream cultural discovery authentication failed."},
    )


@app.exception_handler(QlooRateLimitError)
def qloo_rate_limit_exception_handler(
    request: Request, exc: QlooRateLimitError
) -> JSONResponse:
    """Handle upstream Qloo rate limiting."""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": (
                "Upstream cultural discovery rate limit exceeded. "
                "Please try again later."
            )
        },
    )


@app.exception_handler(QlooTimeoutError)
def qloo_timeout_exception_handler(
    request: Request, exc: QlooTimeoutError
) -> JSONResponse:
    """Handle upstream Qloo request timeout."""
    return JSONResponse(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        content={
            "detail": "Upstream cultural discovery request timed out. Please retry."
        },
    )


@app.exception_handler(QlooResponseError)
def qloo_response_exception_handler(
    request: Request, exc: QlooResponseError
) -> JSONResponse:
    """Handle upstream Qloo response errors."""
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"detail": "Upstream cultural discovery provider error."},
    )


@app.exception_handler(QlooError)
def qloo_generic_exception_handler(request: Request, exc: QlooError) -> JSONResponse:
    """Handle generic Qloo integration failures."""
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"detail": "Upstream cultural discovery service error."},
    )


# Register API routers
app.include_router(discover_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint verifying process availability.

    Checks application process availability only. Does not verify external
    services, cultural discovery providers, or persistence engines.
    """
    return {
        "status": "ok",
        "service": "accessatlas-backend",
    }
