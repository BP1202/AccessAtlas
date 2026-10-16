"""Optional opt-in live smoke verification script for Qloo Cultural Discovery.

USAGE:
    python -m app.qloo.live_smoke_test

SECURITY & RULES:
- Never prints or logs the raw API key or any masked slice.
- Never prints raw private provider JSON payloads.
- Operates strictly against the configured QLOO_BASE_URL.
- Exits safely with error code 1 if QLOO_API_KEY is missing, if search returns
  0 entities, or if requests fail.
"""

import sys

from app.core.config import Settings, get_settings
from app.qloo.client import QlooClient
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooError,
)


def run_live_smoke(settings: Settings | None = None) -> int:
    resolved_settings = settings or get_settings()

    print("=== AccessAtlas Qloo Live Smoke Test ===")
    print(f"Base URL: {resolved_settings.QLOO_BASE_URL}")

    if not resolved_settings.QLOO_API_KEY:
        print("[SKIP] QLOO_API_KEY is not configured in environment or .env.local.")
        print("To run live verification, configure QLOO_API_KEY in .env.local.")
        return 1

    # Security rule: Never print any portion or slice of QLOO_API_KEY
    print("Credential status: configured")

    try:
        with QlooClient(settings=resolved_settings) as client:
            # Step 1: Entity Lookup
            print("\n[Step 1/2] Testing entity lookup via GET /search...")
            search_result = client.search_entities(
                query="Studio Ghibli",
                take=3,
            )
            print("  -> Outcome: Request succeeded")
            print(f"  -> Normalized entity count: {search_result.total_results}")
            if search_result.entities:
                for idx, ent in enumerate(search_result.entities, start=1):
                    print(
                        f"     {idx}. {ent.name} "
                        f"(ID: {ent.entity_id}, type: {ent.entity_type})"
                    )
            else:
                print(
                    "\n[FAIL] Incomplete verification: Search returned zero entities. "
                    "Cross-domain insights could not be executed."
                )
                return 1

            # Step 2: Cross-Domain Insights
            first_entity_id = search_result.entities[0].entity_id
            print("\n[Step 2/2] Testing cross-domain insights via GET /v2/insights...")
            print("  -> Target type: urn:entity:movie")
            print(f"  -> Anchor signal entity: {first_entity_id}")

            insights_result = client.get_insights(
                filter_type="urn:entity:movie",
                signal_entities=[first_entity_id],
                take=3,
            )
            print("  -> Outcome: Request succeeded")
            print(
                f"  -> Normalized recommendation count: {insights_result.total_results}"
            )
            if insights_result.entities:
                for idx, ent in enumerate(insights_result.entities, start=1):
                    print(
                        f"     {idx}. {ent.name} "
                        f"(type: {ent.entity_type}, subtype: {ent.subtype})"
                    )

        print("\n=== Live Smoke Test Completed Successfully ===")
        return 0

    except QlooAuthenticationError as exc:
        print(f"\n[FAIL] Authentication failed (401 Unauthorized): {exc}")
        print("Check that your API key is valid for https://hackathon.api.qloo.com.")
        return 1
    except QlooConfigurationError as exc:
        print(f"\n[FAIL] Configuration error: {exc}")
        return 1
    except QlooError as exc:
        print(f"\n[FAIL] Qloo provider error: {exc}")
        return 1
    except Exception as exc:
        print(f"\n[FAIL] Unexpected error during live smoke test: {type(exc).__name__}")
        return 1


if __name__ == "__main__":
    sys.exit(run_live_smoke())
