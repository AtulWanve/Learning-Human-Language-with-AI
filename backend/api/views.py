from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from database.dictionary import lookup_word
from ai_agent import ai_lookup_word
from database.db import flashcards_collection, users_collection
from database.session_manager import create_session, get_user_by_token, delete_session
from database.daily_content import daily_content
import json
from bson import ObjectId
import logging

def get_token_from_request(request):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Token "):
        return auth_header.split(" ")[1]
    return None

def get_logged_in_user(request):
    token = get_token_from_request(request)
    return get_user_by_token(token)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def add_flashcard(request):
    """API Endpoint: Add a new flashcard to the database"""
    logger.info("Received POST request to add flashcard")
    user_id = get_logged_in_user(request)

    if not user_id:
        return JsonResponse({"error": "User not authenticated."}, status=401)

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
        existing = flashcards_collection.find_one({"word": word, "user_id": ObjectId(user_id)})
        if existing:
            return JsonResponse({"error": "Flashcard already exists."}, status=409)

        new_flashcard = {
            "word": word,
            "meaning": meaning,
            "example_sentence": example_sentence,
            "synonyms": synonyms,
            "antonyms": antonyms,
            "user_id": ObjectId(user_id)
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
    user_id = get_logged_in_user(request)
    if not user_id:
        return JsonResponse({"error": "User not authenticated."}, status=401)
    try:
        flashcards = list(flashcards_collection.find({"user_id": ObjectId(user_id)}, {"_id": 1, "word": 1, "meaning": 1, "example_sentence": 1, "synonyms": 1, "antonyms": 1}))

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
    user_id = get_logged_in_user(request)
    if not user_id:
        return JsonResponse({"error": "User not authenticated."}, status=401)

    try:
        data = json.loads(request.body)
        id_to_delete_str = data.get("id", "").strip()  # Expecting 'id' from frontend

        if not id_to_delete_str:
            return JsonResponse({"error": "Flashcard ID is required."}, status=400)

        try:
            id_to_delete = ObjectId(id_to_delete_str)  # Convert string ID to ObjectId
        except:
            return JsonResponse({"error": "Invalid Flashcard ID format."}, status=400)

        result = flashcards_collection.delete_one({"_id": id_to_delete, "user_id": ObjectId(user_id)})

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
    user_id = get_logged_in_user(request)
    if not user_id:
        return JsonResponse({"error": "User not authenticated."}, status=401)

    try:
        query = request.GET.get('query', '').strip()

        if not query:
            return JsonResponse({"flashcards": []}, status=200)

        # Search flashcards by word or meaning
        flashcards = list(flashcards_collection.find({
            "user_id": ObjectId(user_id),
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

@csrf_exempt
@require_POST
def login_user(request):
    logger.info("Received POST request to login user")
    try:
        data = json.loads(request.body)
        identifier = data.get("identifier", "").strip()
        password = data.get("password", "").strip()

        if not identifier or not password:
            return JsonResponse({"error": "Both 'identifier' and 'password' are required."}, status=400)

        user = users_collection.find_one({
            "$or": [{"username": identifier}, {"email": identifier}]
        })

        if not user or user["password"] != password:
            return JsonResponse({"error": "Invalid username/email or password!"}, status=401)

        token = create_session(str(user["_id"]))

        return JsonResponse({
            "message": "Login successful!",
            "token": token,
            "user_id": str(user["_id"]),
            "username": user["username"]
        }, status=200)

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
def word_search(request):
    """API Endpoint: Retrieve word data such as definition, synonyms, and antonyms"""
    word = request.GET.get('word', '').strip()
    logger.info(f"Received word lookup request for: {word}")

    if not word:
        return JsonResponse({'error': 'No word provided.'}, status=400)

    try:
        word_info = lookup_word(word)
        logger.info(f"Word info found: {word_info}")

        if not word_info:
            return JsonResponse({"error": "No information found for this word."}, status=404)

        return JsonResponse(word_info, status=200)

    except Exception as e:
        logger.error(f"Error fetching word data: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@require_GET
def ai_word_search(request):
    """API Endpoint: Retrieve word data generated by AI"""
    word = request.GET.get('word', '').strip()
    logger.info(f"Received AI word lookup request for: {word}")

    if not word:
        return JsonResponse({'error': 'No word provided.'}, status=400)

    try:
        word_info = ai_lookup_word(word)
        logger.info(f"AI Word info generated: {word_info}")

        return JsonResponse(word_info, status=200)

    except Exception as e:
        logger.error(f"Error generating AI word data: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@require_GET
def get_daily_content(request):
    logger.info("Received request for daily content")
    try:
        content = daily_content()
        return JsonResponse(content, status=200)
    except Exception as e:
        logger.error(f"Error fetching daily content: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)