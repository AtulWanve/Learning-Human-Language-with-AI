// script.js
document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://127.0.0.1:8000/api';

  const API = {
    lookupWord: (word) =>
      fetch(`${API_URL}/lookup-word/?word=${encodeURIComponent(word)}`),

    aiLookupWord: (word) => {
      const token = localStorage.getItem('auth_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      return fetch(`${API_URL}/lookup-word/ai/?word=${encodeURIComponent(word)}`, {
        headers
      });
    },

    getDailyContent: () =>
      fetch(`${API_URL}/daily-content/`),
  };

  // Utility to get element by id
  const get = (id) => document.getElementById(id);

  // Elements
  const loginBtn = get('login-logout-button');
  const toggleDarkBtn = get('toggle-dark-mode');
  const searchInput = get('search-input');
  const searchBtn = get('search-button');
  const gamesBtn = get('games-button');
  const dashboardBtn = get('dashboard-button');


  // Theme CSS variables for light/dark mode
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
  };

  // Apply CSS variables for theme
  const applyCSSVars = (vars) => {
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  };

  const homeTitle = get("home-title");
  if (homeTitle) {
    homeTitle.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

if (dashboardBtn) {
  dashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

  // Apply theme on load based on saved preference or system preference
  function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (!savedTheme) {
      document.documentElement.classList.add('no-theme');
    } else {
      document.documentElement.classList.remove('no-theme');
    }

    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    if (document.body) {
      document.body.classList.toggle('dark-mode', isDark);
    }
    applyCSSVars(isDark ? darkVars : lightVars);

    // Set dark mode toggle button icon accordingly
    if (toggleDarkBtn) {
      toggleDarkBtn.textContent = isDark ? '☀️' : '🌙';
    }
  }

  // Update login button text based on token presence
  const updateLoginButtonText = () => {
    if (!loginBtn) return;
    const token = localStorage.getItem('auth_token');
    loginBtn.textContent = token ? '🔓 Logout' : '🔑 Login';
  };

  // Toggle visibility of "My Dashboard" based on login status
  const updateDashboardVisibility = () => {
    const token = localStorage.getItem('auth_token');
    if (dashboardBtn) {
      dashboardBtn.style.display = token ? 'inline-block' : 'none';
    }
  };

  function updateAuthUI() {
    updateLoginButtonText();
    updateDashboardVisibility();
  }

  // Toggle login/logout functionality
  function toggleLoginStatus() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Logout
      localStorage.removeItem('auth_token');
      updateAuthUI();
      window.location.reload();
    } else {
      // Redirect to login page
      window.location.href = 'login.html';
    }
  }

  // Setup login button listener if it exists
  if (loginBtn) {
    updateLoginButtonText();
    loginBtn.addEventListener('click', toggleLoginStatus);
  }

  // Toggle dark mode on button click
  if (toggleDarkBtn) {
    toggleDarkBtn.addEventListener('click', () => {
      if (!document.body) return;
      const dark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      applyCSSVars(dark ? darkVars : lightVars);
      toggleDarkBtn.textContent = dark ? '☀️' : '🌙';
    });
  }

  // Handle saving flashcards from the lookup results
  const saveFlashcardBtn = get('save-flashcard-button');
  const saveFlashcardMsg = get('save-flashcard-message');
  let lookupSaveable = false;

  if (saveFlashcardBtn) {
    saveFlashcardBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        saveFlashcardMsg.textContent = 'Please login to save flashcards.';
        saveFlashcardMsg.classList.remove('hidden');
        saveFlashcardMsg.className = 'feedback-message error';
        setTimeout(() => {
          saveFlashcardMsg.classList.add('hidden');
        }, 3000);
        return;
      }

      const word = get('word').textContent;
      if (!lookupSaveable || word === 'N/A' || !word) {
         saveFlashcardMsg.textContent = 'No word to save.';
         saveFlashcardMsg.classList.remove('hidden');
         saveFlashcardMsg.className = 'feedback-message error';
         setTimeout(() => {
           saveFlashcardMsg.classList.add('hidden');
         }, 3000);
         return;
      }

      const meaning = get('meaning').textContent;
      const example = get('example').textContent;

      const synonymsText = get('synonyms').textContent;
      let synonyms = [];
      if (synonymsText && synonymsText !== 'N/A' && synonymsText !== 'Synonyms not found.') {
        synonyms = synonymsText.split(',').map(s => s.trim());
      }

      const antonymsText = get('antonyms').textContent;
      let antonyms = [];
      if (antonymsText && antonymsText !== 'N/A' && antonymsText !== 'Antonyms not found.') {
        antonyms = antonymsText.split(',').map(s => s.trim());
      }

      try {
        const response = await fetch(`${API_URL}/add/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            word: word,
            meaning: meaning !== 'No meaning available.' ? meaning : '',
            example_sentence: example !== 'Example not found.' ? example : '',
            synonyms: synonyms,
            antonyms: antonyms
          })
        });

        if (response.ok) {
          saveFlashcardMsg.textContent = 'Flashcard saved successfully!';
          saveFlashcardMsg.classList.remove('hidden', 'error');
          saveFlashcardMsg.classList.add('success');
        } else {
          let message = 'Failed to save flashcard.';
          try {
            const data = await response.json();
            message = data.error || 'Failed to save flashcard.';
          } catch (e) {
            message = 'Failed to save flashcard.';
          }
          saveFlashcardMsg.textContent = message;
          saveFlashcardMsg.classList.remove('hidden', 'success');
          saveFlashcardMsg.classList.add('error');
        }
      } catch (error) {
        console.error('Error saving flashcard:', error);
        saveFlashcardMsg.textContent = 'Network error occurred.';
        saveFlashcardMsg.classList.remove('hidden', 'success');
        saveFlashcardMsg.classList.add('error');
      }

      setTimeout(() => {
        saveFlashcardMsg.classList.add('hidden');
      }, 3000);
    });
  }

  // Search button toggles input focus (or triggers search if input visible)
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      if (!query) return;

      const lookupMode = document.querySelector('input[name="lookup-mode"]:checked')?.value || 'traditional';
      const apiCall = lookupMode === 'ai' ? API.aiLookupWord : API.lookupWord;

      try {
        const response = await apiCall(query);

        if (response.status === 401) {
          displayWordInfo({ error: 'Please log in to use AI Lookup.' }, query);
          return;
        }
        if (response.status === 429) {
          displayWordInfo({ error: 'Too many requests — please wait a minute and try again.' }, query);
          return;
        }

        const data = await response.json();
        displayWordInfo(data, query);
      } catch (error) {
        displayWordInfo({ error: 'Failed to fetch word info.' });
      }
    });
  }

  if (searchInput && searchBtn) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchBtn.click();
    }
  });
}


  // Render senses beyond the primary one (pos_entries[0].senses[0])
  function renderOtherSenses(posEntries) {
    const container = get('other-senses');
    const block = get('senses-block');
    if (!container || !block) return;
    container.innerHTML = '';
    const items = [];
    (posEntries || []).forEach((entry, pi) => {
      (entry.senses || []).forEach((sense, si) => {
        if (pi === 0 && si === 0) return;            // skip the primary (already shown)
        items.push({
          pos: entry.pos,
          def: sense.definition || '',
          ex: (sense.examples && sense.examples[0]) ? sense.examples[0].text : '',
        });
      });
    });
    if (items.length === 0) { block.classList.add('hidden'); return; }
    block.classList.remove('hidden');
    items.slice(0, 6).forEach((it) => {
      const item = document.createElement('div');
      item.className = 'sense-item';
      const tag = document.createElement('span');
      tag.className = 'pos-tag';
      tag.textContent = it.pos || '';
      const def = document.createElement('span');
      def.className = 'sense-def';
      def.textContent = ' ' + it.def;
      item.appendChild(tag);
      item.appendChild(def);
      if (it.ex) {
        const ex = document.createElement('p');
        ex.className = 'sense-ex';
        ex.textContent = it.ex;
        item.appendChild(ex);
      }
      container.appendChild(item);
    });
  }

  // Function to display word info or error messages
  function displayWordInfo(data, query) {
    const wordEl = get('word');
    const meaningEl = get('meaning');
    const exampleEl = get('example');
    const synonymsEl = get('synonyms');
    const antonymsEl = get('antonyms');
    const resultsSection = get('results');
    const ipaEl = get('ipa');
    const posEl = get('pos');
    const cefrEl = get('cefr');
    const sensesBlock = get('senses-block');

    if (!wordEl || !meaningEl || !exampleEl || !synonymsEl || !antonymsEl) return;

    const clearMeta = () => {
      if (ipaEl) ipaEl.textContent = '';
      if (posEl) posEl.textContent = '';
      if (cefrEl) cefrEl.textContent = '';
      if (sensesBlock) sensesBlock.classList.add('hidden');
    };

    // Network / server error
    if (data.error) {
      lookupSaveable = false;
      resultsSection.classList.remove('hidden');
      wordEl.textContent = query || '';
      meaningEl.textContent = "No meaning available.";
      exampleEl.textContent = "Example not found.";
      synonymsEl.textContent = "Synonyms not found.";
      antonymsEl.textContent = "Antonyms not found.";
      clearMeta();
      return;
    }

    resultsSection.classList.remove('hidden');
    wordEl.textContent = query || data.headword || '';

    // Word not in the curated learning set: show the friendly message, no rich data
    if (data.found === false) {
      lookupSaveable = false;
      meaningEl.textContent = data.meaning || "This word isn't in the learning set yet.";
      exampleEl.textContent = '';
      synonymsEl.textContent = '';
      antonymsEl.textContent = '';
      clearMeta();
      return;
    }

    lookupSaveable = true;

    meaningEl.textContent = data.meaning?.trim() || "No meaning available.";
    exampleEl.textContent = data.example_sentence?.trim() || "Example not found.";
    synonymsEl.textContent = (data.synonyms && data.synonyms.length > 0) ? data.synonyms.join(', ') : "Synonyms not found.";
    antonymsEl.textContent = (data.antonyms && data.antonyms.length > 0) ? data.antonyms.join(', ') : "Antonyms not found.";

    if (ipaEl) ipaEl.textContent = data.pronunciation?.ipa ? `/${data.pronunciation.ipa}/` : '';
    if (posEl) posEl.textContent = data.pos || '';
    if (cefrEl) cefrEl.textContent = data.cefr || '';
    renderOtherSenses(data.pos_entries);
  }

  API.getDailyContent()
  .then(res => res.json())
  .then(data => {
    const word = data.word_of_the_day?.word || "N/A";
    const meaning = data.word_of_the_day?.meaning || "N/A";
    const phrase = data.phrase_of_the_day?.phrase || "N/A";
    const phraseMeaning = data.phrase_of_the_day?.meaning || "N/A";
    const langHistory = data.this_day_in_language || "N/A";

    get('wod-word').textContent = word;
    get('wod-meaning').textContent = meaning;
    get('wod-example').textContent = data.word_of_the_day?.example || "N/A";

    get('pod-phrase').textContent = phrase;
    get('pod-meaning').textContent = phraseMeaning;
    get('pod-example').textContent = data.phrase_of_the_day?.example || "N/A";

    get('language-history').textContent = langHistory;

  })
  .catch(err => {
    console.error("Error loading daily content:", err);
    document.getElementById('word-of-day').textContent = "N/A";
    document.getElementById('phrase-of-day').textContent = "N/A";
    document.getElementById('language-history').textContent = "N/A";
  });

  // Initial theme and login button text setup
  applyTheme();
  updateAuthUI();
});
