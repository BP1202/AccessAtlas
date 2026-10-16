from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine predictable directory locations
# Path resolution: backend/app/core/config.py -> core -> app -> backend -> repo root
_CORE_DIR = Path(__file__).resolve().parent
_APP_DIR = _CORE_DIR.parent
_BACKEND_DIR = _APP_DIR.parent
_REPO_ROOT = _BACKEND_DIR.parent

# Documented predictable locations for local development configuration:
# 1. Repository root .env.local (standard per repository security guidelines)
# 2. backend/.env.local (fallback for standalone backend execution)
_ENV_FILE_CANDIDATES = (
    _REPO_ROOT / ".env.local",
    _BACKEND_DIR / ".env.local",
)


class Settings(BaseSettings):
    """Application settings validated via Pydantic Settings.

    Starts with safe development defaults and resolves optional local
    settings from documented, predictable .env.local locations without
    requiring an .env.local file to exist.
    """

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE_CANDIDATES,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    QLOO_API_KEY: str | None = None
    QLOO_BASE_URL: str = "https://hackathon.api.qloo.com"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
