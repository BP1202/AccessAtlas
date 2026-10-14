from fastapi import FastAPI

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="AccessAtlas Backend",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url=None,
)


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
