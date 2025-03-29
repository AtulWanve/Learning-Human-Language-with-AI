from database.db import flashcards_collection  # Import the collection

def add_flashcard(word, meaning):
    flashcards_collection.insert_one({"word": word, "meaning": meaning})
    print(f"Added: {word} -> {meaning}")

def quiz_flashcards():
    flashcards = list(flashcards_collection.find())

    if not flashcards:
        print("No flashcards available. Add some first!")
        return

    score = 0
    for flashcard in flashcards:
        answer = input(f"What is the meaning of '{flashcard['word']}'? ").strip()
        if answer.lower() == flashcard['meaning'].lower():
            print("✅ Correct!")
            score += 1
        else:
            print(f"❌ Wrong! The correct answer is: {flashcard['meaning']}")

    print(f"\nQuiz Over! Your Score: {score}/{len(flashcards)}")

def list_flashcards():
    flashcards = list(flashcards_collection.find())

    if not flashcards:
        print("No flashcards available.")
        return

    print("\nStored Flashcards:")
    for flashcard in flashcards:
        print(f"- {flashcard['word']}: {flashcard['meaning']}")
