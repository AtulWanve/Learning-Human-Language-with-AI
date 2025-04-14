document.addEventListener("DOMContentLoaded", function () {
    let flashcards = [];
    let currentFlashcardIndex = 0;
    let showingDefinition = false;
    let quizIndex = 0;
    let score = 0;
    let randomFlashcards = [];
    const API_URL = "http://127.0.0.1:8000/api";

    // Apply system theme preference or saved theme
    function applyTheme() {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const savedTheme = localStorage.getItem("theme");
        const isDarkMode = savedTheme ? savedTheme === "dark" : systemPrefersDark;
        document.body.classList.toggle("dark-mode", isDarkMode);
    }

    function toggleDarkMode() {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    document.getElementById("toggle-dark-mode").addEventListener("click", toggleDarkMode);
    applyTheme();

    // Hide saved flashcards initially
    let savedFlashcardsList = document.getElementById("flashcard-list");
    savedFlashcardsList.classList.add("hidden");

    document.getElementById("toggle-saved-flashcards").addEventListener("click", function () {
        savedFlashcardsList.classList.toggle("hidden");
        this.textContent = savedFlashcardsList.classList.contains("hidden") ? "Show Saved Flashcards" : "Hide Saved Flashcards";
    });

    // Fetch flashcards from API
    async function fetchFlashcards() {
        try {
            const response = await fetch(`${API_URL}/all/`);
            const data = await response.json();
            if (data.flashcards && data.flashcards.length > 0) {
                flashcards = data.flashcards;
                currentFlashcardIndex = 0;
                updateFlashcardList();
                displayFlashcard();
                updateNavButtons();
                startQuiz();
            } else {
                document.getElementById("flashcard").textContent = "No flashcards available!";
                flashcards = [];
            }
        } catch (error) {
            console.error("Error fetching flashcards:", error);
        }
    }

    // Display flashcard
    function displayFlashcard() {
        let flashcardElement = document.getElementById("flashcard");
        if (flashcards.length === 0) {
            flashcardElement.textContent = "No flashcards available!";
            return;
        }
        let flashcard = flashcards[currentFlashcardIndex];
        flashcardElement.innerHTML = showingDefinition
            ? `<strong>Meaning:</strong> ${flashcard.meaning || "N/A"}<br>
               <strong>Example:</strong> ${flashcard.example_sentence || "N/A"}<br>
               <strong>Synonyms:</strong> ${flashcard.synonyms?.length ? flashcard.synonyms.join(", ") : "N/A"}<br>
               <strong>Antonyms:</strong> ${flashcard.antonyms?.length ? flashcard.antonyms.join(", ") : "N/A"}<br>`
            : `<strong>Word:</strong> ${flashcard.word}`;
    }

    document.getElementById("flashcard").addEventListener("click", function () {
        showingDefinition = !showingDefinition;
        displayFlashcard();
    });

    function updateNavButtons() {
        document.getElementById("prev-flashcard").disabled = currentFlashcardIndex === 0;
        document.getElementById("next-flashcard").disabled = currentFlashcardIndex === flashcards.length - 1;
    }

    document.getElementById("prev-flashcard").addEventListener("click", function () {
        if (currentFlashcardIndex > 0) {
            currentFlashcardIndex--;
            showingDefinition = false;
            displayFlashcard();
            updateNavButtons();
        }
    });

    document.getElementById("next-flashcard").addEventListener("click", function () {
        if (currentFlashcardIndex < flashcards.length - 1) {
            currentFlashcardIndex++;
            showingDefinition = false;
            displayFlashcard();
            updateNavButtons();
        }
    });

    document.getElementById("shuffle-flashcards").addEventListener("click", function () {
        flashcards.sort(() => Math.random() - 0.5);
        currentFlashcardIndex = 0;
        showingDefinition = false;
        displayFlashcard();
        updateNavButtons();
    });

    // Update flashcard list
    function updateFlashcardList() {
        let list = document.getElementById("flashcard-list");
        list.innerHTML = "";
        flashcards.forEach((flashcard, index) => {
            let li = document.createElement("li");
            li.innerHTML = `<strong>${flashcard.word}:</strong> ${flashcard.meaning || "N/A"}`;
            let deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.onclick = () => deleteFlashcard(index);
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    }

    // Delete flashcard
    async function deleteFlashcard(index) {
        try {
            const response = await fetch(`${API_URL}/delete/`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word: flashcards[index].word })
            });

            if (response.ok) {
                flashcards.splice(index, 1);
                updateFlashcardList();
                if (flashcards.length === 0) {
                    document.getElementById("flashcard").textContent = "No flashcards available!";
                } else {
                    currentFlashcardIndex = Math.min(currentFlashcardIndex, flashcards.length - 1);
                    displayFlashcard();
                    updateNavButtons();
                }
            }
        } catch (error) {
            console.error("Error deleting flashcard:", error);
        }
    }

    // Add flashcard
    document.getElementById("flashcard-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        let word = document.getElementById("word").value.trim();
        let meaning = document.getElementById("meaning").value.trim();
        let example_sentence = document.getElementById("example_sentence").value.trim();
        let synonyms = document.getElementById("synonyms").value.trim().split(",").map(s => s.trim());
        let antonyms = document.getElementById("antonyms").value.trim().split(",").map(a => a.trim());

        if (!word || !meaning) {
            alert("Please enter both word and meaning!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word, meaning, example_sentence, synonyms, antonyms })
            });

            if (response.status === 409) {
                const errorData = await response.json();
                alert(errorData.error);
            } else if (response.ok) {
                await fetchFlashcards();
                document.getElementById("flashcard-form").reset();
            } else {
                throw new Error("Something went wrong!");
            }
        } catch (error) {
            console.error("Error adding flashcard:", error);
        }
    });

    // Quiz Functionality
    function startQuiz() {
        if (flashcards.length === 0) {
            document.getElementById("quiz-question").textContent = "No flashcards available!";
            return;
        }
        // Select up to 5 random flashcards for the quiz
        randomFlashcards = flashcards.sort(() => Math.random() - 0.5).slice(0, 5);
        quizIndex = 0;
        score = 0;
        displayQuizQuestion();
    }

    function displayQuizQuestion() {
        if (quizIndex < randomFlashcards.length) {
            document.getElementById("quiz-question").textContent = `What is the meaning or synonym of "${randomFlashcards[quizIndex].word}"?`;
            document.getElementById("quiz-score").textContent = `Score: ${score}`;
            document.getElementById("next-question").style.display = "none"; // Hide the Next Question button initially
        } else {
            document.getElementById("quiz-question").textContent = `Quiz Over! Final Score: ${score}/${randomFlashcards.length}`;
            document.getElementById("submit-answer").style.display = "none";
        }
    }

    document.getElementById("submit-answer").addEventListener("click", function () {
        const userAnswer = document.getElementById("quiz-answer").value.trim().toLowerCase();
        const flashcard = randomFlashcards[quizIndex];
        const correctMeaning = flashcard.meaning.toLowerCase();
        const correctSynonyms = flashcard.synonyms ? flashcard.synonyms.map(s => s.toLowerCase()) : [];

        // Check if the user's answer is correct (either meaning or synonym)
        if (userAnswer === correctMeaning || correctSynonyms.includes(userAnswer)) {
            score++;
        }

        // Update score in real-time when answer is submitted
        document.getElementById("quiz-score").textContent = `Score: ${score}`;

        // Hide the submit button and show the next question button
        document.getElementById("submit-answer").style.display = "none";
        document.getElementById("next-question").style.display = "block";
    });

    // Add event listener for Next Question button
    document.getElementById("next-question").addEventListener("click", function () {
        quizIndex++;
        if (quizIndex < randomFlashcards.length) {
            displayQuizQuestion();
            document.getElementById("quiz-answer").value = "";  // Clear the input field
            document.getElementById("submit-answer").style.display = "block";  // Show Submit button again
            document.getElementById("next-question").style.display = "none";  // Hide Next Question button
        } else {
            document.getElementById("quiz-question").textContent = `Quiz Over! Final Score: ${score}/${randomFlashcards.length}`;
            document.getElementById("next-question").style.display = "none";
            document.getElementById("submit-answer").style.display = "none";
        }
    });

    document.getElementById("login-button").addEventListener("click", () => window.location.href = "login.html");

    fetchFlashcards();
});
