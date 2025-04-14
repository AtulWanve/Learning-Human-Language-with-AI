from database.flashcards import get_flashcards

def start_quiz():
    flashcards = get_flashcards()  # Fetch all flashcards from the database
    
    if not flashcards:
        print("No flashcards available. Add some first!")
        return

    score = 0
    for flashcard in flashcards:
        print(f"Question: What is the meaning of '{flashcard['word']}'?")
        answer = input("Your answer: ").strip().lower()
        
        # Accept multiple valid answers (e.g., 'trial' and 'a trial' should be considered correct)
        if answer in flashcard['meaning'].lower():
            print("✅ Correct!")
            score += 1
        else:
            print(f"❌ Wrong! The correct answer is: {flashcard['meaning']}")

    print(f"\nQuiz Over! Your Score: {score}/{len(flashcards)}")
