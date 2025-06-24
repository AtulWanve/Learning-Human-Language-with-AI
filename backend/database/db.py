from pymongo import MongoClient

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "vocab_db"

# Create a MongoDB client and connect to the database
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections (Tables in SQL terms)
flashcards_collection = db["flashcards"]  # Collection for storing flashcards
users_collection = db["users"]  # Collection for storing user data
daily_content_collection = db["daily_content"]  # Collection for daily AI-generated content