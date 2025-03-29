from database.flashcards import add_flashcard, quiz_flashcards, list_flashcards

def main():
    while True:
        print("\nFlashcard App - MongoDB Version")
        print("1. Add a Flashcard")
        print("2. Start Quiz")
        print("3. View Flashcards")
        print("4. Exit")
        
        choice = input("Enter your choice: ")
        
        if choice == "1":
            word = input("Enter the word: ")
            meaning = input("Enter the meaning: ")
            add_flashcard(word, meaning)
        elif choice == "2":
            quiz_flashcards()
        elif choice == "3":
            list_flashcards()
        elif choice == "4":
            print("Exiting... Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
