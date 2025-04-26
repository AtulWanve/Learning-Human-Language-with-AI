from database.db import users_collection  # Ensure this works in your db.py

# Create a test user
test_user = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "test1234"  # Plain text for now
}

# Insert only if it doesn't already exist
existing = users_collection.find_one({"username": test_user["username"]})

if existing:
    print("Test user already exists.")
else:
    users_collection.insert_one(test_user)
    print("Test user inserted.")
