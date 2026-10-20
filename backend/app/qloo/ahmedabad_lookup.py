"""Opt-in live Qloo entity lookup script for Ahmedabad pilot candidates.

Authorized for manual developer execution to inspect candidate correspondences
without guessing identifiers or creating automatic mappings.

USAGE (from backend/ directory):
    python -m app.qloo.ahmedabad_lookup

SECURITY & INVARIANTS:
- Loads configuration exclusively via app.core.config.get_settings().
- Never reads, prints, or exposes QLOO_API_KEY or any slice thereof.
- Avoids dumping raw provider responses, request headers, or full exception strings.
- Displays only normalized domain fields supported by QlooEntity.
- Avoids inventing geographic fields or unverified entity types.
- Makes NO automatic candidate mappings (all candidates require human review).
- Exits safely with returncode 1 if credentials are missing or errors occur.
"""

import sys

from app.core.config import Settings, get_settings
from app.qloo.client import QlooClient
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooError,
)

# Scoped candidate queries authorized for Stage A inspection
CANDIDATE_QUERIES = [
    "Calico Museum of Textiles",
    "Kasturbhai Lalbhai Museum",
    "Conflictorium, Ahmedabad",
    "Conflictorium",
]


def run_ahmedabad_lookup(settings: Settings | None = None) -> int:
    """Execute manual Qloo search inspection for Ahmedabad candidate entities.

    Returns:
        0 if all queries completed (regardless of whether 0 or more entities returned).
        1 if configuration is missing, authentication fails, or provider errors occur.
    """
    resolved_settings = settings or get_settings()

    print("=== AccessAtlas — Ahmedabad Pilot Qloo Identity Inspection ===")
    print(f"Base URL: {resolved_settings.QLOO_BASE_URL}")

    if not resolved_settings.QLOO_API_KEY:
        print("\n[SKIP] QLOO_API_KEY is not configured in environment or .env.local.")
        print("To run live verification, configure QLOO_API_KEY in .env.local.")
        return 1

    # Security invariant: Never print any portion of QLOO_API_KEY
    print("Credential status: configured")
    print("Candidate mapping policy: NO automatic mappings. Human review required.\n")

    has_error = False

    try:
        with QlooClient(settings=resolved_settings) as client:
            for idx, query in enumerate(CANDIDATE_QUERIES, start=1):
                print(f"[{idx}/{len(CANDIDATE_QUERIES)}] Query: '{query}'")
                try:
                    result = client.search_entities(
                        query=query,
                        types=["urn:entity:place"],
                        take=5,
                    )
                    print("  Status: Request succeeded")
                    print(f"  Normalized entities returned: {result.total_results}")

                    if not result.entities:
                        print("  -> Zero matching entities found in Qloo place domain.")
                    else:
                        for e_idx, ent in enumerate(result.entities, start=1):
                            print(f"  [{e_idx}] Name: {ent.name}")
                            print(f"      Entity ID: {ent.entity_id}")
                            print(f"      Type: {ent.entity_type}")
                            if ent.subtype:
                                print(f"      Subtype: {ent.subtype}")
                            if ent.popularity is not None:
                                print(f"      Popularity: {ent.popularity:.3f}")
                            if ent.disambiguation:
                                print(f"      Disambiguation: {ent.disambiguation}")
                            if ent.tags:
                                tag_names = [t.name for t in ent.tags[:5]]
                                print(f"      Tags (top 5): {', '.join(tag_names)}")

                except QlooAuthenticationError as exc:
                    print(f"  Status: Authentication failed (HTTP 401): {exc}")
                    has_error = True
                    break
                except QlooError as exc:
                    print(f"  Status: Provider error on query: {exc}")
                    has_error = True
                except Exception as exc:
                    print(f"  Status: Unexpected error on query: {type(exc).__name__}")
                    has_error = True

                print()

    except QlooConfigurationError as exc:
        print(f"[FAIL] Configuration error: {exc}")
        return 1
    except Exception as exc:
        print(f"[FAIL] Unexpected integration failure: {type(exc).__name__}")
        return 1

    if has_error:
        print("=== Inspection finished with errors ===")
        return 1

    print("=== Inspection completed ===")
    print("Notice: Review results above. Do not commit mappings without manual review.")
    return 0


if __name__ == "__main__":
    sys.exit(run_ahmedabad_lookup())
