"""Qloo Cultural Discovery Integration package.

Provides typed models and an HTTP client for querying Qloo's entity search
and cross-domain insights endpoints.
"""

from app.qloo.client import SUPPORTED_INSIGHTS_TYPES, QlooClient
from app.qloo.models import (
    QlooAuthenticationError,
    QlooConfigurationError,
    QlooEntity,
    QlooEntityTag,
    QlooError,
    QlooInsightsResult,
    QlooRateLimitError,
    QlooResponseError,
    QlooSearchResult,
    QlooTimeoutError,
)

__all__ = [
    "QlooClient",
    "SUPPORTED_INSIGHTS_TYPES",
    "QlooError",
    "QlooConfigurationError",
    "QlooAuthenticationError",
    "QlooRateLimitError",
    "QlooTimeoutError",
    "QlooResponseError",
    "QlooEntity",
    "QlooEntityTag",
    "QlooSearchResult",
    "QlooInsightsResult",
]
