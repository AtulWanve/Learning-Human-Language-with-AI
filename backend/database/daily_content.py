# database/daily_content.py

from datetime import datetime
from database.db import daily_content_collection
from ai_agent import word_of_the_day, phrase_of_the_day, this_day_in_language

def daily_content():
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Check if today's content is already in the DB
    existing = daily_content_collection.find_one({"date": today_str})
    if existing:
        print("Using cached daily content from database.")
        return {
            "date": today_str,
            "word_of_the_day": existing.get("word_of_the_day", "N/A"),
            "phrase_of_the_day": existing.get("phrase_of_the_day", "N/A"),
            "this_day_in_language": existing.get("this_day_in_language", "N/A")
        }

    # If not found, generate new content
    print("Generating new daily content via AI...")
    word = word_of_the_day()
    phrase = phrase_of_the_day()
    language_fact = this_day_in_language()

    # Save new entry to database
    content = {
        "date": today_str,
        "word_of_the_day": word,
        "phrase_of_the_day": phrase,
        "this_day_in_language": language_fact,
        "timestamp": datetime.utcnow()
    }
    # Remove outdated entries
    daily_content_collection.delete_many({"date": {"$ne": today_str}})
    daily_content_collection.insert_one(content)
    print("Daily content saved to database.")

    return {
        "date": today_str,
        "word_of_the_day": word,
        "phrase_of_the_day": phrase,
        "this_day_in_language": language_fact
    }