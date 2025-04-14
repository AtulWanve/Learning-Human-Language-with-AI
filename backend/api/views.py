from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
import json
from bson import ObjectId
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add project root (Learning Human Language with AI/) to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)).rsplit("backend", 1)[0])

# Import MongoDB collection
from database.db import flashcards_collection


@csrf_exempt
@require_POST
def add_flashcard(request):
    """API Endpoint: Add a new flashcard to the database"""
    logger.info("Received POST request to add flashcard")
    try:
        data = json.loads(request.body)

        # Extract fields
        word = data.get("word", "").strip()
        meaning = data.get("meaning", "").strip()
        example_sentence = data.get("example_sentence", "").strip()
        synonyms = [s.strip() for s in data.get("synonyms", []) if s.strip()]
        antonyms = [a.strip() for a in data.get("antonyms", []) if a.strip()]

        # Validate input
        if not word or not meaning:
            return JsonResponse({"error": "Both 'word' and 'meaning' are required."}, status=400)

        # Check for duplicates
        existing = flashcards_collection.find_one({"word": word})
        if existing:
            return JsonResponse({"error": "Flashcard already exists."}, status=409)

        # Insert into MongoDB
        new_flashcard = {
            "word": word,
            "meaning": meaning,
            "example_sentence": example_sentence,
            "synonyms": synonyms,
            "antonyms": antonyms
        }
        result = flashcards_collection.insert_one(new_flashcard)

        return JsonResponse({"message": "Flashcard added!", "id": str(result.inserted_id)}, status=201)

    except json.JSONDecodeError:
        logger.error("Invalid JSON format in request body.")
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in add_flashcard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@require_GET
def get_flashcards(request):
    """API Endpoint: Retrieve all flashcards from the database"""
    logger.info("Received GET request to fetch flashcards")
    try:
        flashcards = list(flashcards_collection.find({}, {"_id": 1, "word": 1, "meaning": 1, "example_sentence": 1, "synonyms": 1, "antonyms": 1}))

        # Convert ObjectId to string
        for flashcard in flashcards:
            flashcard["_id"] = str(flashcard["_id"])

        return JsonResponse({"flashcards": flashcards}, status=200)

    except Exception as e:
        logger.error(f"Error fetching flashcards: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_flashcard(request):
    """API Endpoint: Delete a flashcard by word"""
    logger.info("Received DELETE request to delete flashcard")
    try:
        data = json.loads(request.body)
        word_to_delete = data.get("word", "").strip()

        if not word_to_delete:
            return JsonResponse({"error": "Word to delete is required."}, status=400)

        result = flashcards_collection.delete_one({"word": word_to_delete})

        if result.deleted_count == 1:
            return JsonResponse({"message": "Flashcard deleted successfully!"}, status=200)
        else:
            return JsonResponse({"error": "Flashcard not found."}, status=404)

    except json.JSONDecodeError:
        logger.error("Invalid JSON format in request body.")
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in delete_flashcard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
