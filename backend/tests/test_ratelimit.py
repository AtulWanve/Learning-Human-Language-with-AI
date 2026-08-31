"""Offline tests for the rate-limit utility (no real Mongo needed)."""
from unittest.mock import patch, MagicMock

from api import ratelimit


def _make_mock_collection():
    """Return a mock collection whose count_documents returns a controllable value."""
    mock = MagicMock()
    mock.count_documents.return_value = 0
    mock.create_index = MagicMock()
    mock.insert_one = MagicMock()
    return mock


@patch.object(ratelimit, "rate_limits_collection")
def test_allowed_when_under_limit(mock_coll):
    mock_coll.count_documents.return_value = 0
    ratelimit._INDEX_ENSURED = True  # skip real index creation
    result = ratelimit.is_rate_limited("test:user:1", limit=3, window_seconds=60)
    assert result is False
    mock_coll.insert_one.assert_called_once()  # tracking doc inserted


@patch.object(ratelimit, "rate_limits_collection")
def test_blocked_when_at_limit(mock_coll):
    mock_coll.count_documents.return_value = 3
    ratelimit._INDEX_ENSURED = True
    result = ratelimit.is_rate_limited("test:user:1", limit=3, window_seconds=60)
    assert result is True
    mock_coll.insert_one.assert_not_called()  # no tracking doc for rejected request


@patch.object(ratelimit, "rate_limits_collection")
def test_blocked_when_over_limit(mock_coll):
    mock_coll.count_documents.return_value = 10
    ratelimit._INDEX_ENSURED = True
    result = ratelimit.is_rate_limited("test:user:1", limit=3, window_seconds=60)
    assert result is True
    mock_coll.insert_one.assert_not_called()


@patch.object(ratelimit, "rate_limits_collection")
def test_different_keys_are_independent(mock_coll):
    ratelimit._INDEX_ENSURED = True
    # First key: at limit
    mock_coll.count_documents.return_value = 5
    assert ratelimit.is_rate_limited("user:A", limit=5, window_seconds=60) is True
    # Second key: under limit (different count_documents call)
    mock_coll.count_documents.return_value = 2
    assert ratelimit.is_rate_limited("user:B", limit=5, window_seconds=60) is False


def test_get_client_ip_from_remote_addr():
    mock_request = MagicMock()
    mock_request.META = {"REMOTE_ADDR": "192.168.1.1"}
    assert ratelimit.get_client_ip(mock_request) == "192.168.1.1"


def test_get_client_ip_ignores_spoofed_xff():
    mock_request = MagicMock()
    mock_request.META = {
        "HTTP_X_FORWARDED_FOR": "10.0.0.1, 192.168.1.1",
        "REMOTE_ADDR": "127.0.0.1",
    }
    assert ratelimit.get_client_ip(mock_request) == "127.0.0.1"
