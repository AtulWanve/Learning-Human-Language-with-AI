from database.db import flashcards_collection
from bson import ObjectId


def add_flashcard(user_id,word, meaning, example_sentence="", synonyms=None, antonyms=None):
    if synonyms is None:
        synonyms = []
    if antonyms is None:
        antonyms = []

    user_id = ObjectId(user_id)

    # Check for duplicates before inserting
    existing = flashcards_collection.find_one({"word": word, "user_id": user_id})
    if existing:
        return None  # Return None if the flashcard already exists
    
    new_flashcard = {
        "user_id": user_id,
        "word": word,
        "meaning": meaning,
        "example_sentence": example_sentence,
        "synonyms": synonyms,
        "antonyms": antonyms
    }
    result = flashcards_collection.insert_one(new_flashcard)
    return str(result.inserted_id)  # Return the inserted ID as a string

def get_flashcards(user_id):
    # Fetch and return all flashcards, excluding the MongoDB ObjectId
    user_id = ObjectId(user_id)
    flashcards = list(flashcards_collection.find({"user_id": user_id}, {"_id": 0, "user_id": 0}))
    return flashcards

def delete_flashcard(user_id, word):
    user_id = ObjectId(user_id)
    result = flashcards_collection.delete_one({"word": word, "user_id": user_id})
    if result.deleted_count == 1:
        return True
    return False
