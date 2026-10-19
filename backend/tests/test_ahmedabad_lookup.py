"""Offline unit tests for app.qloo.ahmedabad_lookup script."""

import httpx
import pytest

from app.core.config import Settings
from app.qloo.ahmedabad_lookup import run_ahmedabad_lookup
from app.qloo.client import QlooClient


def test_ahmedabad_lookup_skip_when_api_key_missing(
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify script skips with status 1 when QLOO_API_KEY is not set."""
    settings = Settings(_env_file=(), QLOO_API_KEY=None)
    exit_code = run_ahmedabad_lookup(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 1
    assert "[SKIP] QLOO_API_KEY is not configured" in captured


def test_ahmedabad_lookup_zero_entities_succeeds_without_error(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify zero entities returned is treated as an informative result, not crash."""
    settings = Settings(_env_file=(), QLOO_API_KEY="test_secret_key_123")

    def mock_empty_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"success": True, "results": []})

    monkeypatch.setattr(
        "app.qloo.ahmedabad_lookup.QlooClient",
        lambda settings: QlooClient(
            settings=settings,
            transport=httpx.MockTransport(mock_empty_transport),
        ),
    )

    exit_code = run_ahmedabad_lookup(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 0
    assert "Credential status: configured" in captured
    assert "test_secret_key_123" not in captured
    assert "Zero matching entities found in Qloo place domain." in captured
    assert "=== Inspection completed ===" in captured


def test_ahmedabad_lookup_success_displays_normalized_fields(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    """Verify normalized domain entity fields are printed without secrets.

    Avoids raw provider payloads or leaking credential slices.
    """
    secret_key = "super_classified_qloo_key_xyz"
    settings = Settings(_env_file=(), QLOO_API_KEY=secret_key)

    def mock_success_transport(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "success": True,
                "results": [
                    {
                        "entity_id": "ent_calico_mock_id",
                        "name": "Calico Museum of Textiles",
                        "type": "urn:entity:place",
                        "subtype": "museum",
                        "popularity": 0.82,
                        "disambiguation": "Textile museum in Ahmedabad, Gujarat",
                        "tags": [{"id": "tag_textile", "name": "Textile"}],
                    }
                ],
            },
        )

    monkeypatch.setattr(
        "app.qloo.ahmedabad_lookup.QlooClient",
        lambda settings: QlooClient(
            settings=settings,
            transport=httpx.MockTransport(mock_success_transport),
        ),
    )

    exit_code = run_ahmedabad_lookup(settings=settings)
    captured = capsys.readouterr().out

    assert exit_code == 0
    assert "Credential status: configured" in captured
    # Ensure no secret slices leaked
    assert "super_classified" not in captured
    assert "xyz" not in captured
    # Ensure normalized fields are printed
    assert "ent_calico_mock_id" in captured
    assert "Calico Museum of Textiles" in captured
    assert "urn:entity:place" in captured
    assert "Textile museum in Ahmedabad, Gujarat" in captured
    assert "Textile" in captured
    assert "NO automatic mappings" in captured
