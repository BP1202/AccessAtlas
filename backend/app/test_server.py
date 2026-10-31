"""FastAPI test server with controlled Qloo stub for verification.

Runs an offline FastAPI instance that does not require a live QLOO_API_KEY.
Injects deterministic reviewed pilot candidates for Ahmedabad.
"""

from typing import Any

import httpx
import uvicorn

from app.api.deps import get_qloo_client
from app.core.config import Settings
from app.evidence.pilot_ahmedabad import (
    QLOO_ID_CALICO,
    QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
)
from app.main import app
from app.qloo.client import QlooClient


def create_qloo_stub_transport() -> httpx.MockTransport:
    """MockTransport returning deterministic responses for test candidates."""

    def handler(request: httpx.Request) -> httpx.Response:
        url_str = str(request.url)

        # Entity search endpoint: /search
        if "/search" in url_str:
            results: list[dict[str, Any]] = [
                {
                    "id": QLOO_ID_CALICO,
                    "name": "Calico Museum of Textiles",
                    "type": "urn:entity:place",
                    "subtype": "Textile Museum",
                    "disambiguation": (
                        "Premier textile museum in Ahmedabad with historic fabric "
                        "collections."
                    ),
                    "popularity": 0.92,
                    "tags": [
                        {"id": "textiles", "name": "Textiles"},
                        {"id": "heritage", "name": "Heritage"},
                    ],
                },
                {
                    "id": QLOO_ID_CONFLICTIORIUM_AHMEDABAD,
                    "name": "Conflictorium",
                    "type": "urn:entity:place",
                    "subtype": "Museum of Conflict",
                    "disambiguation": (
                        "Participatory museum on conflict resolution in Mirzapur."
                    ),
                    "popularity": 0.82,
                    "tags": [
                        {"id": "dialogue", "name": "Dialogue"},
                        {"id": "social_history", "name": "Social History"},
                    ],
                },
                {
                    "id": "unmapped_cafe_99",
                    "name": "Old City Heritage Tea Haven",
                    "type": "urn:entity:place",
                    "subtype": "Tea Room",
                    "disambiguation": "Traditional tea stall in old haveli quarter.",
                    "popularity": 0.65,
                    "tags": [{"id": "culinary", "name": "Culinary"}],
                },
            ]

            return httpx.Response(200, json={"success": True, "results": results})

        # Default fallback
        return httpx.Response(200, json={"success": True, "results": []})

    return httpx.MockTransport(handler)


def configure_test_app() -> None:
    """Override Qloo dependency with controlled offline stub."""
    settings = Settings(
        _env_file=(),
        QLOO_API_KEY="test-stub-key-contract-verification",
    )
    stub_client = QlooClient(
        settings=settings,
        transport=create_qloo_stub_transport(),
    )

    def override_qloo():
        yield stub_client

    app.dependency_overrides[get_qloo_client] = override_qloo


if __name__ == "__main__":
    import sys

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    configure_test_app()
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
