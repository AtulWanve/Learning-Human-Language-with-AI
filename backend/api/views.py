from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from database.dictionary import get_word_data 
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
    """API Endpoint: Delete a flashcard by _id"""
    logger.info("Received DELETE request to delete flashcard")
    try:
        data = json.loads(request.body)
        id_to_delete_str = data.get("id", "").strip()  # Expecting 'id' from frontend

        if not id_to_delete_str:
            return JsonResponse({"error": "Flashcard ID is required."}, status=400)

        try:
            id_to_delete = ObjectId(id_to_delete_str)  # Convert string ID to ObjectId
        except:
            return JsonResponse({"error": "Invalid Flashcard ID format."}, status=400)

        result = flashcards_collection.delete_one({"_id": id_to_delete})

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


@require_GET
def search_flashcards(request):
    """API Endpoint: Search flashcards by word or meaning"""
    logger.info("Received GET request to search flashcards")
    try:
        query = request.GET.get('query', '').strip()

        if not query:
            return JsonResponse({"flashcards": []}, status=200)

        # Search flashcards by word or meaning
        flashcards = list(flashcards_collection.find({
            "$or": [
                {"word": {"$regex": query, "$options": "i"}},
                {"meaning": {"$regex": query, "$options": "i"}}
            ]
        }, {"_id": 1, "word": 1, "meaning": 1, "example_sentence": 1, "synonyms": 1, "antonyms": 1}))

        # Convert ObjectId to string
        for flashcard in flashcards:
            flashcard["_id"] = str(flashcard["_id"])

        return JsonResponse({"flashcards": flashcards}, status=200)

    except Exception as e:
        logger.error(f"Error searching flashcards: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
    
from database.db import users_collection  # Assuming users_collection is defined in db.py

@csrf_exempt
@require_POST
def login_user(request):
    """API Endpoint: Log a user into the system"""
    logger.info("Received POST request to login user")
    try:
        data = json.loads(request.body)

        # Extract username/email and password
        identifier = data.get("identifier", "").strip()  # Changed to 'identifier' for flexibility
        password = data.get("password", "").strip()

        # Validate input
        if not identifier or not password:
            return JsonResponse({"error": "Both 'identifier' (username or email) and 'password' are required."}, status=400)

        # Check for user in database by username or email
        user = users_collection.find_one({
            "$or": [
                {"username": identifier},
                {"email": identifier}
            ]
        })

        if not user:
            return JsonResponse({"error": "Invalid username/email or password!"}, status=401)

        # Assuming passwords are stored hashed, you need to compare the hashed password
        if user["password"] != password:  # Replace with password hashing comparison for production!
            return JsonResponse({"error": "Invalid username/email or password!"}, status=401)

        # If successful login, return JWT token (this is just an example)
        return JsonResponse({"token": "your_jwt_token_here"}, status=200)

    except json.JSONDecodeError:
        logger.error("Invalid JSON format in request body.")
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in login_user: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_POST
def signup_user(request):
    """API Endpoint: Register a new user without password hashing"""
    logger.info("Received POST request to signup user")
    try:
        data = json.loads(request.body)

        # Extract fields from the request body
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # Validate the inputs
        if not username or not email or not password:
            return JsonResponse({"error": "Username, email, and password are required."}, status=400)

        # Check if the user already exists by username or email
        existing_user = users_collection.find_one({
            "$or": [
                {"username": username},
                {"email": email}
            ]
        })

        if existing_user:
            return JsonResponse({"error": "Username or email already taken."}, status=409)

        # Create a new user object (without password hashing)
        new_user = {
            "username": username,
            "email": email,
            "password": password  # Store password as plain text
        }

        # Insert the new user into the MongoDB database
        result = users_collection.insert_one(new_user)

        return JsonResponse({"message": "User created successfully!"}, status=201)

    except json.JSONDecodeError:
        logger.error("Invalid JSON format in request body.")
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error in signup_user: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@require_GET
def lookup_word(request):
    """API Endpoint: Retrieve word data such as definition, synonyms, and antonyms"""
    word = request.GET.get('word', '').strip()

    if not word:
        return JsonResponse({'error': 'No word provided.'}, status=400)

    try:
        word_info = get_word_data(word)
        
        if not word_info:
            return JsonResponse({"error": "No information found for this word."}, status=404)

        return JsonResponse(word_info, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    logger.info(f"Received word: {word}")
    try:
        word_info = get_word_data(word)
        logger.info(f"Word info: {word_info}")
    except Exception as e:
        logger.error(f"Error fetching word data: {str(e)}")

