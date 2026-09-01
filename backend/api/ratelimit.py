"""Lightweight rate-limiting backed by a PyMongo TTL collection.

Each rate-limit check inserts a timestamped document; a TTL index auto-expires old ones.
The check counts recent documents for the caller's key and rejects if over the limit.

The TTL index is created lazily on first use (idempotent). No Redis, no django-ratelimit,
no extra dependencies — just PyMongo, which is already in the stack.
"""
import datetime
import logging

from database.db import rate_limits_collection

logger = logging.getLogger(__name__)

_INDEX_ENSURED = False


def _ensure_ttl_index():
    """Create the TTL index if it doesn't already exist (idempotent, once per process)."""
    global _INDEX_ENSURED
    if _INDEX_ENSURED:
        return
    rate_limits_collection.create_index(
        "created_at",
        expireAfterSeconds=120,  # Mongo garbage-collects docs older than 2 minutes
        background=True,
    )
    _INDEX_ENSURED = True


def is_rate_limited(key: str, limit: int, window_seconds: int) -> bool:
    """Check whether `key` has exceeded `limit` requests in the last `window_seconds`.

    Args:
        key: identifier string — e.g. "user:<user_id>" or "ip:<ip_addr>".
        limit: max allowed requests in the window.
        window_seconds: rolling window size in seconds.

    Returns:
        True if the caller IS rate-limited (should be rejected), False if allowed.

    Side effect: if NOT limited, inserts a tracking document. If limited, does NOT insert
    (so the user isn't punished for the rejected request itself).
    """
    _ensure_ttl_index()
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(seconds=window_seconds)
    count = rate_limits_collection.count_documents({
        "key": key,
        "created_at": {"$gte": cutoff},
    })
    if count >= limit:
        logger.info(f"Rate limited: {key} ({count}/{limit} in {window_seconds}s)")
        return True
    rate_limits_collection.insert_one({
        "key": key,
        "created_at": datetime.datetime.utcnow(),
    })
    return False


def get_client_ip(request) -> str:
    """Extract the client IP from a Django request.

    X-Forwarded-For is deliberately ignored because clients can spoof it;
    REMOTE_ADDR comes from the actual TCP peer.
    """
    return request.META.get("REMOTE_ADDR", "unknown")
