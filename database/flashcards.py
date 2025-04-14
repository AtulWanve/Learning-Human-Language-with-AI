from database.db import flashcards_collection

def add_flashcard(word, meaning, example_sentence="", synonyms=None, antonyms=None):
    if synonyms is None:
        synonyms = []
    if antonyms is None:
        antonyms = []

    # Check for duplicates before inserting
    existing = flashcards_collection.find_one({"word": word})
    if existing:
        return None  # Return None if the flashcard already exists
    
    new_flashcard = {
        "word": word,
        "meaning": meaning,
        "example_sentence": example_sentence,
        "synonyms": synonyms,
        "antonyms": antonyms
    }
    result = flashcards_collection.insert_one(new_flashcard)
    return str(result.inserted_id)  # Return the inserted ID as a string

def get_flashcards():
    # Fetch and return all flashcards, excluding the MongoDB ObjectId
    flashcards = list(flashcards_collection.find({}, {"_id": 0}))
    return flashcards

def delete_flashcard(word):
    result = flashcards_collection.delete_one({"word": word})
    if result.deleted_count == 1:
        return True
    return False
