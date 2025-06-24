// script.js
document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://127.0.0.1:8000/api';

  const API = {
    lookupWord: (word) =>
      fetch(`${API_URL}/lookup-word/?word=${encodeURIComponent(word)}`),

    aiLookupWord: (word) =>
      fetch(`${API_URL}/lookup-word/ai/?word=${encodeURIComponent(word)}`),

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

  if (gamesBtn) {
  gamesBtn.addEventListener('click', () => {
    window.location.href = 'games.html';
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

  // Search button toggles input focus (or triggers search if input visible)
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      if (!query) return;

      const lookupMode = document.querySelector('input[name="lookup-mode"]:checked')?.value || 'traditional';
      const apiCall = lookupMode === 'ai' ? API.aiLookupWord : API.lookupWord;

      try {
        const response = await apiCall(query);
        const data = await response.json();
        displayWordInfo(data, query);
      } catch (error) {
        displayWordInfo({ error: 'Failed to fetch word info.' });
      }
    });
  }

  if (searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchBtn.click();
    }
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

    if (!wordEl || !meaningEl || !exampleEl || !synonymsEl || !antonymsEl) return;

    if (data.error) {
      resultsSection.classList.add('hidden')
      wordEl.textContent = query || '';
      meaningEl.textContent = "No meaning available.";
      exampleEl.textContent = "Example not found.";
      synonymsEl.textContent = "Synonyms not found.";
      antonymsEl.textContent = "Antonyms not found.";
      return;
    }

    resultsSection.classList.remove('hidden');
    wordEl.textContent = query || '';
    meaningEl.textContent = data.meaning?.trim() || "No meaning available.";
    exampleEl.textContent = data.example_sentence?.trim() || "Example not found.";
    synonymsEl.textContent = (data.synonyms && data.synonyms.length > 0) ? data.synonyms.join(', ') : "Synonyms not found.";
    antonymsEl.textContent = (data.antonyms && data.antonyms.length > 0) ? data.antonyms.join(', ') : "Antonyms not found.";
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
