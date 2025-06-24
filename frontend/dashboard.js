// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
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

  const API = {
  login: (data) =>
    fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }),

  signup: (data) =>
    fetch(`${API_URL}/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }),

  getFlashcards: () => {
    const token = localStorage.getItem("auth_token");
    return fetch(`${API_URL}/all/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
      },
    });
  },


  addFlashcard: (data) => {
    const token = localStorage.getItem("auth_token");
    return fetch(`${API_URL}/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  deleteFlashcard: (id) => {
    const token = localStorage.getItem("auth_token");
    return fetch(`${API_URL}/delete/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({ id }),
    });
  },
  
  aiLookup: (word) => {
  const token = localStorage.getItem("auth_token");
  return fetch(`${API_URL}/lookup-word/ai/?word=${encodeURIComponent(word)}`, {
    headers: {
      "Authorization": `Token ${token}`,
    },
  });
},



  searchFlashcards: (query) =>
    fetch(`${API_URL}/search/?query=${encodeURIComponent(query)}`),

};


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
  const loginBtn = get("login-logout-button");
  const correctMeaning = get('correct-meaning');
  const meaningText = get('meaning-text');
  const flashcardOptions = get('flashcard-options');


  quizQuestion.classList.add('hidden');
  quizAnswer.classList.add('hidden');
  quizFeedback.classList.add('hidden');
  quizScore.classList.add('hidden');
  submitBtn.classList.add('hidden');
  nextQBtn.classList.add('hidden');


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

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
  const theme = getPreferredTheme();
  document.body.classList.toggle('dark-mode', theme === 'dark');
  applyCSSVars(theme === 'dark' ? darkVars : lightVars);
}

function toggleDarkMode() {
  const current = getPreferredTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme();
}


function updateLoginUI() {
  const token = localStorage.getItem('auth_token');
  const deleteFlashcardButtons = document.querySelectorAll('.delete-btn');
  
}

const manualBtn = get('manual-fill-btn');
const additionalFields = get('additional-fields');

if (manualBtn) {
  manualBtn.addEventListener('click', () => {
    form.classList.remove('hidden');
    form.style.display = 'block';

    if (additionalFields) {
      additionalFields.classList.remove('hidden');
      additionalFields.style.display = 'block';
    }
    if (flashcardOptions) {
      flashcardOptions.style.display = 'none';
    }

    wordInput.focus();
  });
}

const useAiBtn = get('ai-fill-btn');
if (useAiBtn) {
  useAiBtn.addEventListener('click', async () => {
    const word = wordInput.value.trim();
    if (!word) {
      alert("Please enter a word first!");
      return;
    }

    useAiBtn.disabled = true;
    useAiBtn.textContent = "⏳ Loading...";

    try {
      const res = await API.aiLookup(word);
      const data = await res.json();

      if (res.ok && data.meaning) {
        // Show form if it's not visible
        form.classList.remove('hidden');
        form.style.display = 'block';

        if (additionalFields) {
          additionalFields.classList.remove('hidden');
          additionalFields.style.display = 'block';
        }

        // Fill the values
        meaningInput.value = data.meaning || '';
        exampleInput.value = data.example_sentence || '';
        synonymsInput.value = (data.synonyms || []).join(', ');
        antonymsInput.value = (data.antonyms || []).join(', ');
        if (flashcardOptions) {
          flashcardOptions.style.display = 'none';
          flashcardOptions.classList.add('hidden')
        }

      } else {
        alert(data.error || 'Could not generate flashcard using AI.');
      }
    } catch (err) {
      console.error("AI Lookup Error:", err);
      alert("Error generating flashcard using AI.");
    } finally {
      useAiBtn.disabled = false;
      useAiBtn.textContent = "Use AI";
    }
  });
}


const fillWithAiBtn = get('fill-with-ai-btn');
if (fillWithAiBtn) {
  fillWithAiBtn.addEventListener('click', async () => {
    const word = wordInput.value.trim();
    if (!word) {
      alert("Please enter a word first!");
      return;
    }

    fillWithAiBtn.disabled = true;
    fillWithAiBtn.textContent = "⏳ Loading...";

    try {
      const res = await API.aiLookup(word);
      const data = await res.json();

      if (res.ok && data.meaning) {
        meaningInput.value = data.meaning || '';
        exampleInput.value = data.example_sentence || '';
        synonymsInput.value = (data.synonyms || []).join(', ');
        antonymsInput.value = (data.antonyms || []).join(', ');
      } else {
        alert(data.error || 'Could not generate flashcard using AI.');
      }
    } catch (err) {
      console.error("AI Lookup Error:", err);
      alert("Error generating flashcard using AI.");
    } finally {
      fillWithAiBtn.disabled = false;
      fillWithAiBtn.textContent = "Fill with AI";
    }
  });
}




// Toggle login status function
function toggleLoginStatus() {
  const token = localStorage.getItem('auth_token');

  if (token) {
    localStorage.removeItem('auth_token');
    console.log('Logged out. Token removed.');
    updateLoginButtonText();
    updateLoginUI();
    window.location.href = 'index.html';
  } else {
    console.log('Already logged out, redirecting to login page.');
    updateLoginButtonText();
    updateLoginUI();
    window.location.href = 'login.html';
  }
}

// Login Button Setup 
if (loginBtn) {
  loginBtn.textContent = localStorage.getItem('auth_token') ? '🔓 Logout' : '🔑 Login';
  loginBtn.addEventListener('click', toggleLoginStatus);
} else {
  console.error('Login button not found!');
}
  
  toggleDarkBtn.addEventListener('click', toggleDarkMode);
  applyTheme();
  updateLoginButtonText();
  updateLoginUI();

  // Check login state on page load
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
      const res = await API.getFlashcards();

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
    appState.flashcards.sort((a, b) => a.word.localeCompare(b.word));
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
      const res = await API.deleteFlashcard(id);
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
      const res = await API.addFlashcard({
        word,
        meaning,
        example_sentence: example,
        synonyms,
        antonyms
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
    quizQuestion.classList.remove('hidden');
    quizAnswer.classList.remove('hidden');
    quizAnswer.disabled = false;
    quizFeedback.classList.remove('hidden');
    quizScore.classList.remove('hidden');
    submitBtn.classList.remove('hidden');
    nextQBtn.classList.add('hidden');
    
    quizFeedback.textContent = '';
    quizScore.textContent = '';
    
    displayQuizQuestion();
  });

  function displayQuizQuestion() {
    const { word } = appState.randomFlashcards[appState.quizIndex];
    quizQuestion.textContent = `What is the meaning of "${word}"?`;
    quizAnswer.value = '';
    quizFeedback.textContent = '';
    quizAnswer.disabled = false;
    quizAnswer.classList.remove('hidden');
    submitBtn.classList.remove('hidden');
    nextQBtn.classList.add('hidden');
    correctMeaning.classList.add('hidden');

  }

  function completeQuiz() {
    quizQuestion.textContent = 'Quiz Completed!';
    quizScore.textContent = `Your Score: ${appState.score} / ${appState.randomFlashcards.length}`;
    quizAnswer.classList.add('hidden');
    submitBtn.classList.add('hidden');
    nextQBtn.classList.add('hidden');
  }

  submitBtn.addEventListener('click', () => {
  const flashcard = appState.randomFlashcards[appState.quizIndex];

  if (!flashcard) {
    quizFeedback.textContent = '⚠️ Please start the quiz first!';
    return;
  }

  const userAns = quizAnswer.value.trim().toLowerCase();

  const validAnswers = [
    flashcard.meaning.toLowerCase(),
    ...(Array.isArray(flashcard.synonyms) ? flashcard.synonyms.map(s => s.toLowerCase()) : [])
  ];

  if (!userAns) {
    quizFeedback.textContent = 'Please enter an answer!';
    return;
  }

  if (validAnswers.includes(userAns)) {
    appState.score++;
    quizFeedback.textContent = '✅ Correct!';
    correctMeaning.classList.add('hidden');
  } else {
    let displayedAnswer = flashcard.meaning;
    if (Array.isArray(flashcard.synonyms) && flashcard.synonyms.length > 0) {
      displayedAnswer = flashcard.synonyms.slice(0, 3).join(', ');

    }
    quizFeedback.textContent = `❌ Incorrect! Correct: "${displayedAnswer}"`;
    meaningText.textContent = flashcard.meaning;
    correctMeaning.classList.remove('hidden');

  }
  
  quizAnswer.disabled = true;
  submitBtn.classList.add('hidden');

  if (appState.quizIndex < appState.randomFlashcards.length - 1) {
    nextQBtn.classList.remove('hidden');
  } else {
    completeQuiz();
  }
});


  nextQBtn.addEventListener('click', () => {
    appState.quizIndex++;
    if (appState.quizIndex < appState.randomFlashcards.length) {
      displayQuizQuestion();
      quizAnswer.disabled = false;
    } else {
      completeQuiz();
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
    searchInput.addEventListener('keydown', async function(event) {
      if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;

// Find index of the matching flashcard
const index = appState.flashcards.findIndex(fc => fc.word.toLowerCase() === searchTerm);

if (index !== -1) {
  const matchedFlashcard = appState.flashcards[index];
  console.log('Found flashcard at index:', index);
  console.log('Matched flashcard:', matchedFlashcard);
  appState.currentFlashcardIndex=index
  appState.showingDefinition = false;
  displayFlashcard();
  updateNavButtons();
  searchInput.blur();
  flashcardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

} else {
  console.log('Flashcard not found.');
}
      }
    });
  }

  fetchFlashcards();
});
