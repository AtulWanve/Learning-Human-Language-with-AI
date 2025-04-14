from backend.quiz import start_quiz
from database.flashcards import add_flashcard

def menu():
    print("\nFlashcard App - MongoDB Version")
    print("1. Add a Flashcard")
    print("2. Start Quiz")
    print("3. Exit")

def main():
    while True:
        menu()
        choice = input("Enter your choice: ")

        if choice == "1":
            word = input("Enter the word: ").strip()
            meaning = input("Enter the meaning: ").strip()
            add_flashcard(word, meaning)

        elif choice == "2":
            start_quiz()

        elif choice == "3":
            print("Exiting the app. Goodbye!")
            break

        else:
            print("Invalid choice! Please try again.")

if __name__ == "__main__":
    main()
