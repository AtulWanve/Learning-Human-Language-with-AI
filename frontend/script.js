// script.js
document.addEventListener('DOMContentLoaded', () => {
  const appState = {
    flashcards: [],
    currentFlashcardIndex: 0,
    showingDefinition: false,
    quizIndex: 0,
    score: 0,
    randomFlashcards: [],
    loading: false,
  };

  const API_URL = 'http://127.0.0.1:8000/api';

  const get = (id) => document.getElementById(id);

  const flashcardElement = get('flashcard');
  const flashcardWord = get('flashcard-word');
  const flashcardMeaning = get('flashcard-meaning');
  const flashcardExample = get('flashcard-example');
  const flashcardSynonyms = get('flashcard-synonyms');
  const flashcardAntonyms = get('flashcard-antonyms');
  const prevBtn = get('prev-flashcard');
  const nextBtn = get('next-flashcard');
  const shuffleBtn = get('shuffle-flashcards');
  const form = get('flashcard-form');
  const wordInput = get('word');
  const meaningInput = get('meaning');
  const exampleInput = get('example_sentence');
  const synonymsInput = get('synonyms');
  const antonymsInput = get('antonyms');
  const addMessage = get('add-flashcard-message');
  const savedList = get('flashcard-list');
  const toggleSavedBtn = get('toggle-saved-flashcards');
  const savedMessage = get('saved-flashcards-message');
  const quizQuestion = get('quiz-question');
  const quizAnswer = get('quiz-answer');
  const submitBtn = get('submit-answer');
  const nextQBtn = get('next-question');
  const quizFeedback = get('quiz-feedback');
  const quizScore = get('quiz-score');
  const startQuizBtn = get('start-quiz');
  const toggleDarkBtn = get('toggle-dark-mode');
  const searchToggle = get('search-toggle');
  const searchInput = get('header-search-input');
  const loginBtn = get('login-button');

  const lightVars = {
    '--bg-body': '#f0f0f0',
    '--text-primary': '#333',
    '--bg-section': 'white',
    '--shadow-color': 'rgba(0,0,0,0.1)',
    '--accent-color': '#4CAF50',
    '--accent-hover': '#45a049',
    '--input-bg': 'white',
    '--input-border': '#ccc',
    '--input-text': '#333',
    '--flashcard-bg': '#e3f2fd',
    '--flashcard-border': '#4CAF50',
    '--delete-bg': '#ff4d4d',
    '--delete-hover': '#cc0000',
  };

  const darkVars = {
    '--bg-body': '#121212',
    '--text-primary': 'white',
    '--bg-section': '#1e1e1e',
    '--shadow-color': 'rgba(255,255,255,0.1)',
    '--accent-color': '#66bb6a',
    '--accent-hover': '#558b2f',
    '--input-bg': '#444',
    '--input-border': '#777',
    '--input-text': 'white',
    '--flashcard-bg': '#333',
    '--flashcard-border': '#66bb6a',
    '--delete-bg': '#e57373',
    '--delete-hover': '#d32f2f',
  };

  // Update login button text based on token presence
  function updateLoginButtonText() {
    const token = localStorage.getItem('auth_token');
    loginBtn.textContent = token ? '🔓 Logout' : '🔑 Login';
  }

  function applyCSSVars(vars) {
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }

function applyTheme() {
  // 1. mark “no saved preference” on <html> if nothing in localStorage
  if (!localStorage.getItem('theme')) {
    document.documentElement.classList.add('no-theme');
  } else {
    document.documentElement.classList.remove('no-theme');
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const dark = saved ? saved === 'dark' : prefersDark;

  document.body.classList.toggle('dark-mode', dark);
  applyCSSVars(dark ? darkVars : lightVars);
}


function updateLoginUI() {
  const token = localStorage.getItem('token');
  const deleteFlashcardButtons = document.querySelectorAll('.delete-btn');
  const addFlashcardButton = get('add-flashcard-btn');
  
}


// Toggle login status function
function toggleLoginStatus() {
  const token = localStorage.getItem('token');
  
  if (token) {
    localStorage.removeItem('token'); // Remove token (logout)
    console.log('Logged out. Token removed.');
    updateLoginButtonText(); // Update button text after logout
    updateLoginUI();
  } else {
    console.log('Already logged out, redirecting to login page.');
    window.location.href = 'login.html';
  }
}



// Login Button Setup 
if (loginBtn) {
  loginBtn.textContent = localStorage.getItem('token') ? '🔓 Logout' : '🔑 Login';
  loginBtn.addEventListener('click', toggleLoginStatus);
} else {
  console.error('Login button not found!');
}
  
  function toggleDarkMode() {
    const dark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    applyCSSVars(dark ? darkVars : lightVars);
  
    console.log('toggleDarkMode -> new mode:', dark ? 'dark' : 'light');
    console.log('toggleDarkMode -> stored in localStorage:', localStorage.getItem('theme'));
  }
  
  toggleDarkBtn.addEventListener('click', toggleDarkMode);
  applyTheme();
  updateLoginButtonText();
  updateLoginUI();

  // Check login state on page load
  const token = localStorage.getItem('auth_token'); // Changed to 'auth_token'
  if (token) {
    // User is "logged in"
    loginBtn.textContent = '🔓 Logout';
    loginBtn.classList.add('logged-in');
  } else {
    // User is not logged in
    loginBtn.textContent = '🔑 Login';
    loginBtn.classList.remove('logged-in');
  }


  toggleSavedBtn.addEventListener('click', () => {
    savedList.classList.toggle('hidden');
    savedMessage.classList.toggle('hidden');
    toggleSavedBtn.textContent = savedList.classList.contains('hidden')
      ? 'Show My Flashcards'
      : 'Hide My Flashcards';
  });

  function getCSRFToken() {
    return get('csrf-token')?.value || '';
  }

  async function fetchFlashcards() {
    try {
      const res = await fetch(`${API_URL}/all/`);
      const data = await res.json();
      appState.flashcards = data.flashcards || [];
      appState.currentFlashcardIndex = 0;
      updateFlashcardList();
      displayFlashcard();
      updateNavButtons();
      startQuizBtn.disabled = appState.flashcards.length < 5;
    } catch {
      flashcardElement.textContent = 'Error loading flashcards.';
      startQuizBtn.disabled = true;
    }
  }

  function displayFlashcard() {
    const fc = appState.flashcards[appState.currentFlashcardIndex];
    if (!fc) return flashcardElement.textContent = 'No flashcards available!';
    const show = appState.showingDefinition;

    flashcardWord.parentElement.style.display = show ? 'none' : 'block';
    flashcardMeaning.parentElement.style.display = show ? 'block' : 'none';
    flashcardExample.parentElement.style.display = show ? 'block' : 'none';
    flashcardSynonyms.parentElement.style.display = show ? 'block' : 'none';
    flashcardAntonyms.parentElement.style.display = show ? 'block' : 'none';

    flashcardWord.textContent = fc.word;
    flashcardMeaning.textContent = fc.meaning || 'N/A';
    flashcardExample.textContent = fc.example_sentence || 'N/A';
    flashcardSynonyms.textContent = (fc.synonyms || []).join(', ') || 'N/A';
    flashcardAntonyms.textContent = (fc.antonyms || []).join(', ') || 'N/A';
  }

  flashcardElement.addEventListener('click', () => {
    if (!appState.flashcards.length) return;
    appState.showingDefinition = !appState.showingDefinition;
    displayFlashcard();
  });

  function updateNavButtons() {
    prevBtn.disabled = appState.currentFlashcardIndex === 0;
    nextBtn.disabled = appState.currentFlashcardIndex >= appState.flashcards.length - 1;
  }

  prevBtn.addEventListener('click', () => {
    if (appState.currentFlashcardIndex > 0) {
      appState.currentFlashcardIndex--;
      appState.showingDefinition = false;
      displayFlashcard();
      updateNavButtons();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (appState.currentFlashcardIndex < appState.flashcards.length - 1) {
      appState.currentFlashcardIndex++;
      appState.showingDefinition = false;
      displayFlashcard();
      updateNavButtons();
    }
  });

  shuffleBtn.addEventListener('click', () => {
    appState.flashcards.sort(() => Math.random() - 0.5);
    appState.currentFlashcardIndex = 0;
    appState.showingDefinition = false;
    displayFlashcard();
    updateNavButtons();
  });

  function updateFlashcardList() {
    savedList.innerHTML = '';
    if (!appState.flashcards.length) {
      savedMessage.classList.remove('hidden');
      return;
    }
    savedMessage.classList.add('hidden');
    appState.flashcards.forEach(fc => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${fc.word}:</strong> ${fc.meaning || 'N/A'}`;
      const btn = document.createElement('button');
      btn.textContent = '❌';
      btn.classList.add('delete-btn');
      btn.onclick = () => deleteFlashcard(fc._id);
      li.appendChild(btn);
      savedList.appendChild(li);
    });
  }

  async function deleteFlashcard(id) {
    if (!confirm('Delete this flashcard?')) return;
    try {
      const res = await fetch(`${API_URL}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw await res.json();
      appState.flashcards = appState.flashcards.filter(f => f._id !== id);
      updateFlashcardList();
      appState.currentFlashcardIndex = Math.min(appState.currentFlashcardIndex, appState.flashcards.length - 1);
      displayFlashcard();
      updateNavButtons();
    } catch (err) {
      alert(err.error || 'Error deleting flashcard.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessage.classList.add('hidden');
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const example = exampleInput.value.trim();
    const synonyms = synonymsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const antonyms = antonymsInput.value.split(',').map(a => a.trim()).filter(Boolean);
    if (!word || !meaning) {
      alert('Please enter both word and meaning!');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ word, meaning, example_sentence: example, synonyms, antonyms })
      });
      const result = await res.json();
      if (!res.ok) throw result;
      addMessage.textContent = 'Flashcard added successfully!';
      form.reset();
      await fetchFlashcards();
    } catch (err) {
      addMessage.textContent = err?.error || 'Failed to add flashcard.';
    } finally {
      addMessage.classList.remove('hidden');
    }
  });

  startQuizBtn.addEventListener('click', () => {
    if (appState.flashcards.length < 5) return;
    appState.randomFlashcards = [...appState.flashcards].sort(() => Math.random() - 0.5).slice(0, 5);
    appState.quizIndex = 0;
    appState.score = 0;
    displayQuizQuestion();
    quizFeedback.textContent = '';
    quizScore.textContent = '';
    submitBtn.classList.remove('hidden');
    nextQBtn.classList.add('hidden');
  });

  function displayQuizQuestion() {
    const { word } = appState.randomFlashcards[appState.quizIndex];
    quizQuestion.textContent = `What is the meaning of "${word}"?`;
    quizAnswer.value = '';
    quizFeedback.textContent = '';
    submitBtn.classList.remove('hidden');
    nextQBtn.classList.add('hidden');
  }

  submitBtn.addEventListener('click', () => {
    const userAns = quizAnswer.value.trim().toLowerCase();
    const correct = appState.randomFlashcards[appState.quizIndex].meaning.toLowerCase();
    if (!userAns) return quizFeedback.textContent = 'Please enter an answer!';
    if (userAns === correct) {
      appState.score++;
      quizFeedback.textContent = '✅ Correct!';
    } else {
      quizFeedback.textContent = `❌ Incorrect! Correct: "${correct}"`;
    }
    submitBtn.classList.add('hidden');
    nextQBtn.classList.remove('hidden');
  });

  nextQBtn.addEventListener('click', () => {
    appState.quizIndex++;
    if (appState.quizIndex < appState.randomFlashcards.length) {
      displayQuizQuestion();
    } else {
      quizQuestion.textContent = 'Quiz Completed!';
      quizScore.textContent = `Your Score: ${appState.score} / ${appState.randomFlashcards.length}`;
      submitBtn.classList.add('hidden');
      nextQBtn.classList.add('hidden');
    }
  });

  // 🔍 Search toggle functionality
  if (searchToggle && searchInput) {
    searchToggle.addEventListener('click', () => {
      searchInput.classList.toggle('open');
      if (searchInput.classList.contains('open')) {
        searchInput.focus();
      } else {
        searchInput.value = '';
      }
    });

    // Close the search bar when clicking outside of it
    document.addEventListener('click', (e) => {
      const isClickInside = searchInput.contains(e.target) || searchToggle.contains(e.target);
      if (!isClickInside && searchInput.classList.contains('open')) {
        searchInput.classList.remove('open');
        searchInput.value = '';
      }
    });
    
    // Add a keydown event listener to check for Enter key press
    searchInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim().toLowerCase();

// Find index of the matching flashcard
const index = appState.flashcards.findIndex(fc => fc.word.toLowerCase() === searchTerm);

if (index !== -1) {
  const matchedFlashcard = appState.flashcards[index];
  console.log('Found flashcard at index:', index);
  console.log('Matched flashcard:', matchedFlashcard);
  appState.currentFlashcardIndex=index
  flashcardWord.textContent = matchedFlashcard.word;
} else {
  console.log('Flashcard not found.');
}
      }
    });
  }

  fetchFlashcards();
});
