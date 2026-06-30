# Learning Human Language with AI

A vocabulary-learning web app that helps users build their English vocabulary through
personal flashcards, dictionary lookups, AI-powered word insights, and daily language
content. It combines a **Django** REST backend, a **MongoDB** database, and a vanilla
**HTML/CSS/JavaScript** frontend, with **Google Gemini** providing the AI features.

---

## Features

- **User accounts** — sign up and log in with token-based sessions; each user's
  flashcards are private to them.
- **Flashcards** — add, list, search, and delete flashcards (word, meaning, example
  sentence, synonyms, antonyms).
- **Dictionary lookup** — definitions, synonyms, and antonyms sourced from the
  [Free Dictionary API](https://dictionaryapi.dev/), with [Datamuse](https://www.datamuse.com/api/)
  and **NLTK WordNet** as fallbacks.
- **AI word lookup** — Google Gemini generates a meaning, example sentence, synonyms,
  and antonyms for any word.
- **Daily content** — AI-generated *Word of the Day*, *Phrase of the Day*, and
  *This Day in Language*, cached per day in MongoDB.
- **CLI quiz** — a terminal flashcard quiz ([main.py](main.py)) for the MongoDB-backed deck.

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Backend    | Django 5.2, django-cors-headers                         |
| Database   | MongoDB (via PyMongo)                                    |
| AI         | Google Gemini (`google-generativeai`, Gemini 1.5 Flash/Pro) |
| NLP        | NLTK (WordNet)                                           |
| External   | Free Dictionary API, Datamuse API                       |
| Frontend   | HTML, CSS, vanilla JavaScript                           |

---

## Project Structure

```
.
├── main.py                     # CLI flashcard quiz entry point
├── backend/
│   ├── manage.py               # Django management entry point
│   ├── ai_agent.py             # Google Gemini integration (word/phrase/daily content)
│   ├── quiz.py                 # CLI quiz logic
│   ├── backend/                # Django project config (settings, urls, wsgi/asgi)
│   ├── api/                    # REST API app (views, urls)
│   └── database/
│       ├── db.py               # MongoDB connection & collections
│       ├── flashcards.py       # Flashcard data access
│       ├── dictionary.py       # Dictionary lookup (FreeDict → Datamuse → WordNet)
│       ├── daily_content.py    # Daily AI content with per-day caching
│       └── session_manager.py  # Token-based session handling
└── frontend/
    ├── index.html              # Vocabulary lookup page
    ├── login.html / login.js   # Auth UI
    ├── dashboard.html / .js     # Flashcard dashboard
    └── *.css, script.js        # Styles and shared scripts
```

---

## Prerequisites

- **Python 3.13** (a `myenv/` virtualenv is included in the repo)
- **MongoDB** running locally at `mongodb://localhost:27017/` (database: `vocab_db`)
- A **Google AI (Gemini) API key**

---

## Setup

1. **Clone and enter the project**
   ```bash
   git clone <repo-url>
   cd "Learning Human Language with AI"
   ```

2. **Create and activate a virtual environment** (or use the bundled `myenv/`)
   ```bash
   python -m venv myenv
   # Windows
   myenv\Scripts\activate
   # macOS/Linux
   source myenv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install Django django-cors-headers pymongo google-generativeai python-dotenv nltk requests
   ```

4. **Configure your API key** — create a `.env` file in the `backend/` directory:
   ```env
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   ```

5. **Start MongoDB** (ensure the local server is running on port 27017).

---

## Running the App

### Backend (Django API)

```bash
cd backend
python manage.py runserver
```

The API is served under `http://localhost:8000/api/`.

### Frontend

Open the HTML files in `frontend/` directly in a browser, or serve them with a static
file server (e.g. `python -m http.server`) and start from `login.html`.

### CLI Quiz

```bash
python main.py
```

---

## API Endpoints

All endpoints are prefixed with `/api/`. Flashcard endpoints require an
`Authorization: Token <token>` header.

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| POST   | `/signup/`            | Register a new user                      |
| POST   | `/login/`             | Log in, returns a session token          |
| POST   | `/add/`               | Add a flashcard                          |
| GET    | `/all/`               | List the user's flashcards               |
| GET    | `/search/?query=`     | Search flashcards by word or meaning     |
| DELETE | `/delete/`            | Delete a flashcard by id                 |
| GET    | `/lookup-word/?word=` | Dictionary lookup (FreeDict/Datamuse/WordNet) |
| GET    | `/lookup-word/ai/?word=` | AI-generated word details (Gemini)    |
| GET    | `/daily-content/`     | Daily word, phrase, and language fact    |

---

## Notes & Caveats

> ⚠️ **This is a learning/student project.** A few things are intentionally simple and
> **not production-ready**:
> - Passwords are stored in **plain text** (no hashing).
> - MongoDB connection details and `SECRET_KEY` are hardcoded; `DEBUG = True`.
> - `CORS_ALLOW_ALL_ORIGINS = True`.
>
> Harden these (password hashing, environment-based secrets, restricted CORS, `DEBUG = False`)
> before any real deployment.
