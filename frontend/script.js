document.addEventListener('DOMContentLoaded', () => {
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
    window.location.href = 'games.html'; // change to your actual games page URL
  });
}

if (dashboardBtn) {
  dashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // change to your actual dashboard page URL
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

  // Toggle login/logout functionality
  function toggleLoginStatus() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Logout
      localStorage.removeItem('auth_token');
      updateLoginButtonText();
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
      // If search input is hidden, show and focus it
      if (searchInput.classList.contains('hidden')) {
        searchInput.classList.remove('hidden');
        searchInput.focus();
        return;
      }

      // If input visible, trigger search
      const query = searchInput.value.trim();
      if (!query) return;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/lookup-word?word=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayWordInfo(data);
      } catch (error) {
        displayWordInfo({ error: 'Failed to fetch word info.' });
      }
    });
  }

  // Function to display word info or error messages
  function displayWordInfo(data) {
    const wordEl = get('word');
    const meaningEl = get('meaning');
    const exampleEl = get('example');
    const synonymsEl = get('synonyms');
    const antonymsEl = get('antonyms');

    if (!wordEl || !meaningEl || !exampleEl || !synonymsEl || !antonymsEl) return;

    if (data.error) {
      wordEl.textContent = '';
      meaningEl.textContent = data.error;
      exampleEl.textContent = '';
      synonymsEl.textContent = '';
      antonymsEl.textContent = '';
      return;
    }

    wordEl.textContent = data.word || '';
    meaningEl.textContent = data.definition || 'N/A';
    exampleEl.textContent = data.example_sentence || 'N/A';
    synonymsEl.textContent = (data.synonyms && data.synonyms.length > 0) ? data.synonyms.join(', ') : 'N/A';
    antonymsEl.textContent = (data.antonyms && data.antonyms.length > 0) ? data.antonyms.join(', ') : 'N/A';
  }

  // Initial theme and login button text setup
  applyTheme();
  updateLoginButtonText();
});
