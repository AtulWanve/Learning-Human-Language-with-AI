from pymongo import MongoClient

def get_database():
    client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
    return client["vocab_db"]  # Database name

# Create a reference to the flashcards collection
db = get_database()
flashcards_collection = db["flashcards"]
