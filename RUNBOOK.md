# Phase 1 Runbook

Step-by-step guide to setting up, building, and running the Vocabulary Learning App
from a fresh clone. This runbook covers the curated offline dictionary (Phase 1).

---

## Prerequisites

- **Python 3.10+** (tested on 3.12)
- **MongoDB** running locally on `mongodb://localhost:27017/`
- **Google Gemini API key** (free tier is sufficient for development)

## 1. Environment Setup

### Create and activate the virtual environment

```bash
# Create
python -m venv myenv

# Activate (Windows)
myenv\Scripts\activate

# Activate (macOS/Linux)
source myenv/bin/activate
```

### Install Python dependencies

```bash
pip install -r requirements.txt
```

### Download NLTK data corpora

```bash
python -m nltk.downloader wordnet cmudict omw-1.4
```

### Configure the API key

Create a `.env` file at the repository root:

```
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

This key is used for AI-generated example sentences (ingestion), live AI word lookup,
and daily content generation.

## 2. Download Data Source Files

The headword CSVs go in the `data/` directory. Download URLs are pinned to an immutable
commit for reproducibility.

```bash
# Create the data directory if it doesn't exist
mkdir -p data

# Download (the URLs are also recorded in backend/ingestion/config.py)
curl -L -o data/cefrj-vocabulary-profile-1.5.csv \
  "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/d4e45b75b38f27b30dfc5c44d8c571aec7e7092f/cefrj-vocabulary-profile-1.5.csv"

curl -L -o data/octanove-vocabulary-profile-c1c2-1.0.csv \
  "https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/d4e45b75b38f27b30dfc5c44d8c571aec7e7092f/octanove-vocabulary-profile-c1c2-1.0.csv"
```

### Verify checksums (optional but recommended)

```bash
sha256sum data/cefrj-vocabulary-profile-1.5.csv
# Expected: b0dd3c635f1c9a4fdf1490c7e5b7c48e8bbe55b652ad0c9860a95f98e10ae498

sha256sum data/octanove-vocabulary-profile-c1c2-1.0.csv
# Expected: 18c33a407f2f89f7b8de9671c6d45fe3ea0bce45e7d2d7dcaab48d73e0f7b380
```

## 3. Dictionary Ingestion

All ingestion commands run from the `backend/` directory.

### Phase 1: Offline assembly (no network, no API key needed)

Assembles every headword from WordNet, CMUdict, wordfreq, and lemminflect, then
upserts into the `words` collection. Idempotent — skips headwords already present
(use `--force` to re-assemble all).

```bash
cd backend
python -m ingestion.ingest
```

Options:
- `--force` — re-assemble every headword (overwrites existing docs)
- `--limit N` — only process the first N headwords (for testing)

### Phase 2: Gemini example fill (requires API key and network)

Fills senses that lack an example sentence with AI-generated examples. Batches
20 words per API call and self-throttles to stay under the free-tier rate limit.

```bash
python -m ingestion.ingest --fill-examples
```

**Important: Gemini free tier is 5 requests per minute.** The script throttles itself
to 4 rpm. A full run (~55 batched calls) takes approximately 14 minutes. If the quota
is hit (429 errors), the script stops gracefully. Re-run it — it is idempotent and
resumable. Keep running until the output reports:

```
still unfilled: 0 examples, 0 definitions
```

### POS reorder (one-time fix, already applied)

Reorders `pos_entries` so the CEFR-expert POS leads the array. Run with `--dry-run`
first to preview changes.

```bash
python -m ingestion.ingest --reorder --dry-run
python -m ingestion.ingest --reorder
```

This was applied during the initial build (660 documents reordered). It is idempotent
and safe to re-run.

## 4. Running the Application

### Start the Django backend

```bash
cd backend
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`.

### Serve the frontend

The frontend is static HTML/CSS/JS in the `frontend/` directory. Serve it with any
static file server (e.g., VS Code Live Server, `python -m http.server 3000`).

### API Endpoints

| Endpoint                  | Auth     | Rate Limit          | Description                     |
|---------------------------|----------|---------------------|---------------------------------|
| `GET /api/lookup-word/`   | Public   | None                | Curated dictionary lookup       |
| `GET /api/lookup-word/ai/`| Required | 3/user/60s          | Live AI word lookup (Gemini)    |
| `GET /api/daily-content/` | Public   | 10/IP/60s           | Daily content (day-cached)      |

## 5. Testing

### Automated tests

```bash
cd backend
pytest -q tests/
```

Expected: 32 tests passing.

### Gate (compile + lint + test)

```bash
python harness/gate.py learnlang
```

### Frontend smoke test

1. Search `access` → shows `/ˈæksˌɛs/`, verb, B2 badge, verb definition, noun in
   "Other senses"
2. Search `the` → friendly "not in our B2-C2 learning set yet" message
3. AI Lookup without login → "Please log in" message
4. AI Lookup after login → normal AI result
5. 4 rapid AI lookups → 4th returns "too many requests"
6. Dark mode toggle → all elements remain legible
7. Daily content section → Word of the Day, Phrase of the Day, This Day in Language

## 6. Known Limitations

### 183 headwords with mismatched or missing POS (not a bug — a documented deferral)

Of the ~4,500 curated headwords, 183 still headline a POS that the CEFR expert list
did not intend, because the expert-assigned POS is not in WordNet:

- **57** have WordNet coverage but only for a *different* POS (e.g., CEFR says verb,
  WordNet lists only the noun).
- **126** have no WordNet entry at all (served entirely by Gemini definition + example).

The `--reorder` phase cannot fix these because there is no correct entry to promote.
This is evidence for a future **Open English WordNet (OEWN) upgrade**, which has
broader modern coverage. The evidence should accumulate before that migration.

### Gemini free-tier constraint (5 rpm)

The Gemini free tier allows **5 requests per minute** (~1,500/day). This is a throughput
limit, not a cost limit (the actual API cost is negligible at ~$0.20 total for the
full dictionary build).

Implications:
- Ingestion: the `--fill-examples` phase self-throttles and is resumable. Budget
  approximately 14 minutes per full run.
- Live AI endpoint: gated behind auth + per-user rate limit (3/60s). The free tier
  is a development substrate, not a production one.
- Daily content: day-cached in Mongo (one Gemini call per calendar day). Safe for
  public access.

### Visible-sense contract

`pos_entries[0].senses[0]` is the canonical primary sense. The lookup response maps
it to `meaning`, `example_sentence`, `synonyms`, `antonyms`. The `--reorder` phase
ensures the expert-assigned POS leads the array. Any future change to which sense
is surfaced must update the reorder logic in lockstep.

## 7. Project Structure

```
├── backend/
│   ├── api/                  # Django views, URLs, rate-limiting
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── ratelimit.py      # PyMongo TTL rate-limit utility
│   ├── database/
│   │   ├── db.py             # Mongo collections
│   │   ├── dictionary.py     # Curated lookup (Phase 1 keystone)
│   │   ├── daily_content.py  # Day-cached AI daily content
│   │   └── session_manager.py
│   ├── ingestion/
│   │   ├── config.py         # Locked Phase 1 parameters
│   │   ├── sources.py        # Offline data loaders
│   │   ├── schema.py         # Pydantic WordDocument schema
│   │   └── ingest.py         # Two-phase ingestion pipeline
│   ├── ai_agent.py           # Gemini API wrapper
│   ├── tests/                # pytest suite (32 tests)
│   └── backend/settings.py   # Django settings
├── frontend/
│   ├── index.html            # Landing page
│   ├── script.js             # Frontend logic
│   └── style.css             # Styles (light/dark theme)
├── data/                     # Source CSVs (not committed)
├── requirements.txt
├── ATTRIBUTIONS.md
├── RUNBOOK.md                # This file
└── .env                      # API key (gitignored)
```