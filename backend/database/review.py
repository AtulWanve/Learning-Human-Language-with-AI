"""SM-2 spaced repetition engine for flashcard review scheduling.

The SM-2 algorithm (Wozniak 1987) computes the next review date based on the user's
self-assessed quality rating (0-5). The schedule function is pure (no I/O) so it can
be tested offline; the query helpers read/write the flashcards collection.

SM-2 fields are additive: existing flashcard documents that lack them are treated as
never-reviewed (due immediately, default ease factor 2.5).
"""
import datetime
import logging

from bson import ObjectId
from database.db import flashcards_collection

logger = logging.getLogger(__name__)

# SM-2 defaults (applied at read-time for docs that predate the scheduling upgrade)
_DEFAULTS = {
    "ease_factor": 2.5,
    "interval": 0,
    "repetitions": 0,
}

try:
    flashcards_collection.create_index([("user_id", 1), ("next_review", 1)])
except Exception:
    logger.debug("Could not ensure due-cards index at import time.")


def sm2_schedule(quality: int, repetitions: int, ease_factor: float,
                 interval: int) -> dict:
    """Pure SM-2 computation. Returns {ease_factor, interval, repetitions}.

    Args:
        quality: 0-5 self-assessment (0 = blackout, 5 = perfect).
        repetitions: number of consecutive successful recalls so far.
        ease_factor: current ease factor (>= 1.3).
        interval: current interval in days.

    Returns:
        dict with updated ease_factor, interval, repetitions.
    """
    if quality < 0 or quality > 5:
        raise ValueError(f"quality must be 0-5, got {quality}")

    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)
        new_repetitions = repetitions + 1
    else:
        new_interval = 1
        new_repetitions = 0

    new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if new_ef < 1.3:
        new_ef = 1.3

    return {
        "ease_factor": round(new_ef, 2),
        "interval": new_interval,
        "repetitions": new_repetitions,
    }


def get_due_cards(user_id: str, limit: int = 20) -> list:
    """Fetch flashcards that are due for review (next_review <= now), most overdue first.

    Cards without SM-2 fields are treated as due immediately (never reviewed).
    Returns a list of dicts with _id as string, ready for JSON serialization.
    """
    now = datetime.datetime.utcnow()
    query = {
        "user_id": ObjectId(user_id),
        "$or": [
            {"next_review": {"$lte": now}},
            {"next_review": {"$exists": False}},  # legacy cards without scheduling
        ],
    }
    cursor = flashcards_collection.find(
        query,
        {"word": 1, "meaning": 1, "example_sentence": 1, "synonyms": 1,
         "antonyms": 1, "ease_factor": 1, "interval": 1, "repetitions": 1,
         "next_review": 1, "last_reviewed": 1},
    ).sort("next_review", 1).limit(limit)

    cards = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # Apply defaults for legacy cards
        doc.setdefault("ease_factor", _DEFAULTS["ease_factor"])
        doc.setdefault("interval", _DEFAULTS["interval"])
        doc.setdefault("repetitions", _DEFAULTS["repetitions"])
        doc.setdefault("next_review", None)
        doc.setdefault("last_reviewed", None)
        cards.append(doc)
    return cards


def record_review(user_id: str, flashcard_id: str, quality: int) -> dict | None:
    """Record a review result: compute the new SM-2 schedule and update the flashcard.

    Args:
        user_id: the authenticated user's id string.
        flashcard_id: the flashcard's _id string.
        quality: 0-5 self-assessment.

    Returns:
        The updated schedule fields, or None if the flashcard was not found / not owned
        by this user.
    """
    try:
        oid = ObjectId(flashcard_id)
    except Exception:
        return None

    doc = flashcards_collection.find_one(
        {"_id": oid, "user_id": ObjectId(user_id)},
        {"ease_factor": 1, "interval": 1, "repetitions": 1},
    )
    if not doc:
        return None

    current_ef = doc.get("ease_factor", _DEFAULTS["ease_factor"])
    current_interval = doc.get("interval", _DEFAULTS["interval"])
    current_reps = doc.get("repetitions", _DEFAULTS["repetitions"])

    updated = sm2_schedule(quality, current_reps, current_ef, current_interval)

    now = datetime.datetime.utcnow()
    next_review = now + datetime.timedelta(days=updated["interval"])

    result = flashcards_collection.find_one_and_update(
        {"_id": oid, "user_id": ObjectId(user_id)},
        {"$set": {
            "ease_factor": updated["ease_factor"],
            "interval": updated["interval"],
            "repetitions": updated["repetitions"],
            "next_review": next_review,
            "last_reviewed": now,
        }},
    )
    if result is None:
        return None

    logger.info(f"Review recorded: card={flashcard_id} q={quality} "
                f"ef={updated['ease_factor']} interval={updated['interval']}d "
                f"next={next_review.isoformat()}")

    return {
        "ease_factor": updated["ease_factor"],
        "interval": updated["interval"],
        "repetitions": updated["repetitions"],
        "next_review": next_review.isoformat(),
    }