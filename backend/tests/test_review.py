"""Offline tests for the SM-2 spaced repetition algorithm (no Mongo needed)."""
from unittest.mock import patch

import pytest
from bson import ObjectId

from database import review
from database.review import sm2_schedule


# --- Perfect recall (quality=5) progression ---

def test_first_perfect_recall():
    out = sm2_schedule(quality=5, repetitions=0, ease_factor=2.5, interval=0)
    assert out["interval"] == 1
    assert out["repetitions"] == 1
    assert out["ease_factor"] == 2.6  # 2.5 + 0.1


def test_second_perfect_recall():
    out = sm2_schedule(quality=5, repetitions=1, ease_factor=2.6, interval=1)
    assert out["interval"] == 6
    assert out["repetitions"] == 2
    assert out["ease_factor"] == 2.7


def test_third_perfect_recall():
    out = sm2_schedule(quality=5, repetitions=2, ease_factor=2.7, interval=6)
    assert out["interval"] == round(6 * 2.7)  # 16
    assert out["repetitions"] == 3


# --- Minimum passing recall (quality=3) ---

def test_quality_3_first_recall():
    out = sm2_schedule(quality=3, repetitions=0, ease_factor=2.5, interval=0)
    assert out["interval"] == 1
    assert out["repetitions"] == 1
    assert out["ease_factor"] == 2.36  # 2.5 + (0.1 - 2*(0.08 + 2*0.02))


def test_quality_3_still_passes():
    """quality=3 is the minimum passing grade — should NOT reset repetitions."""
    out = sm2_schedule(quality=3, repetitions=5, ease_factor=2.0, interval=30)
    assert out["repetitions"] == 6
    assert out["interval"] == round(30 * 2.0)  # 60


# --- Failed recall (quality < 3) ---

def test_failed_recall_resets():
    out = sm2_schedule(quality=2, repetitions=5, ease_factor=2.5, interval=30)
    assert out["interval"] == 1
    assert out["repetitions"] == 0


def test_blackout_resets_and_clamps_ef():
    out = sm2_schedule(quality=0, repetitions=10, ease_factor=1.3, interval=60)
    assert out["interval"] == 1
    assert out["repetitions"] == 0
    assert out["ease_factor"] == 1.3  # clamped at floor


# --- Ease factor floor ---

def test_ease_factor_never_below_1_3():
    """Repeated low quality should not push ease_factor below 1.3."""
    out = sm2_schedule(quality=0, repetitions=0, ease_factor=1.3, interval=0)
    assert out["ease_factor"] >= 1.3


def test_ease_factor_clamps_after_repeated_failures():
    ef = 2.5
    for _ in range(20):
        result = sm2_schedule(quality=0, repetitions=0, ease_factor=ef, interval=1)
        ef = result["ease_factor"]
    assert ef == 1.3


# --- Input validation ---

def test_quality_below_zero_raises():
    with pytest.raises(ValueError):
        sm2_schedule(quality=-1, repetitions=0, ease_factor=2.5, interval=0)


def test_quality_above_5_raises():
    with pytest.raises(ValueError):
        sm2_schedule(quality=6, repetitions=0, ease_factor=2.5, interval=0)


# --- Query helpers ---

@patch.object(review, "flashcards_collection")
def test_record_review_returns_none_for_invalid_flashcard_id(mock_coll):
    result = review.record_review(str(ObjectId()), "not-a-valid-id", quality=4)
    assert result is None
    mock_coll.find_one.assert_not_called()


@patch.object(review, "flashcards_collection")
def test_record_review_returns_none_for_another_users_card(mock_coll):
    mock_coll.find_one.return_value = None
    result = review.record_review(str(ObjectId()), str(ObjectId()), quality=4)
    assert result is None


@patch.object(review, "flashcards_collection")
def test_get_due_cards_supplies_defaults_for_legacy_docs(mock_coll):
    card_id = ObjectId()
    legacy_doc = {"_id": card_id, "word": "hello", "meaning": "hi"}
    mock_coll.find.return_value.sort.return_value.limit.return_value = iter([legacy_doc])

    out = review.get_due_cards(str(ObjectId()))

    assert len(out) == 1
    card = out[0]
    assert card["_id"] == str(card_id)
    assert card["ease_factor"] == 2.5
    assert card["interval"] == 0
    assert card["repetitions"] == 0
    assert card["next_review"] is None
    assert card["last_reviewed"] is None