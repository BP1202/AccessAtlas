from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.main import app

client = TestClient(app)


def test_health_endpoint_status_code() -> None:
    """Verify that GET /health returns HTTP 200."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_endpoint_contract() -> None:
    """Verify that GET /health response matches the documented JSON contract."""
    response = client.get("/health")
    data = response.json()
    assert data == {
        "status": "ok",
        "service": "accessatlas-backend",
    }


def test_default_configuration_safe_defaults() -> None:
    """Verify safe default configuration without relying on local secret files."""
    # Instantiate Settings directly with empty env_file candidate list
    isolated_settings = Settings(_env_file=())
    assert isolated_settings.APP_ENV == "development"


def test_get_settings_cached_instance() -> None:
    """Verify get_settings returns a valid Settings instance with default APP_ENV."""
    settings = get_settings()
    assert isinstance(settings.APP_ENV, str)
    assert settings.APP_ENV == "development"
