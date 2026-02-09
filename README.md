# Elisha's Bible Study Workspace

A Bible study app with a FastAPI backend and a React (Vite) frontend. The app loads Bible text from PostgreSQL (KJV), uses Adam Clarke's commentary for grounded AI assistance, and provides a notes drawer for study notes tied to passages.

## Features
- Canonical book ordering with book/chapter/verse dropdowns
- KJV verse pane with optional verse filtering
- AI study assistant grounded in KJV + Adam Clarke
- Notes drawer with create/edit, search, and pin-to-passage

## Screenshots
![Study Workspace](docs/images/study-workspace.svg)
![Notes Drawer](docs/images/notes-drawer.svg)

Replace the placeholder SVGs in `docs/images/` with real screenshots whenever you're ready.

## Install on iPhone (PWA)
1. Deploy the frontend and backend over HTTPS (required by iOS for installable web apps).
2. Open the app in Safari on your iPhone.
3. Tap the Share icon, then **Add to Home Screen**.
4. Launch it from your home screen like a native app.

Notes:
- The AI still runs on your backend (Ollama or other LLM); the iPhone only calls the API.
- If you change the server URL, update `bible-ui/src/services/api.ts` and rebuild.

## Project Structure
- `app/` – FastAPI backend (API routes, services, DB access)
- `bible-ui/` – React + Vite frontend
- `scripts/` – helper scripts (e.g., commentary metadata enrichment)

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL with pgvector extension
- Ollama installed and running (for local LLM)

## Environment Setup
Create a `.env` file in the project root (not committed) with:

```
DATABASE_URL=postgresql://bible_user:bible_pass@localhost:5432/bible_db
```

Optional (to avoid HF Hub rate limits when downloading embeddings):

```
HF_TOKEN=your_huggingface_token
```

## Database Tables
This app expects:
- `bible_verses` (KJV text)
- `bible_verse_embeddings` (pgvector embeddings)
- `commentary_docs` and `commentary_embeddings` (Adam Clarke)
- `study_notes` (notes)

Notes table schema used:

```
CREATE TABLE study_notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  verse_ref TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Backend (FastAPI)
Install dependencies:

```
pip install -r requirements.txt
```

Run the API:

```
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000` with Swagger at `/docs`.

### Notes API
- `GET /notes` – list notes (supports `search`, `verse_ref`, `tag`, `limit`, `offset`)
- `POST /notes` – create a note
- `PUT /notes/{id}` – update a note

### API Examples
List canonical books:

```
curl "http://localhost:8000/metadata/books"
```

Get chapters for John:

```
curl "http://localhost:8000/metadata/chapters?book=John"
```

Fetch KJV verses (single verse):

```
curl "http://localhost:8000/verses?book=John&chapter=3&verse=16"
```

Ask the AI a question:

```
curl -X POST "http://localhost:8000/ai/study" \\
  -H "Content-Type: application/json" \\
  -d '{\"question\":\"Who is Nicodemus?\",\"book\":\"John\",\"chapter\":3}'
```

Create a note:

```
curl -X POST "http://localhost:8000/notes/" \\
  -H "Content-Type: application/json" \\
  -d '{\"title\":\"Nicodemus\",\"content\":\"A Pharisee who came to Jesus by night.\",\"verse_ref\":\"John 3:1\"}'
```

List notes for a passage:

```
curl "http://localhost:8000/notes?verse_ref=John%203"
```

## Frontend (Vite + React)
Install dependencies:

```
cd bible-ui
npm install
```

Start the dev server:

```
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Deployment (Simple)
1. Update the frontend API base before building:
   - Edit `bible-ui/src/services/api.ts` and change `API_BASE` to your production API URL.
2. Update CORS in `app/main.py` to allow your production frontend origin.
3. Build the frontend:

```
cd bible-ui
npm install
npm run build
```

4. Serve the frontend static files (example using a simple static server):

```
cd bible-ui/dist
python -m http.server 4173
```

5. Run the API in production mode:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For a production deployment, place a reverse proxy (Nginx/Caddy) in front of both services and enable HTTPS.

## Embeddings + LLM
- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- LLM: Ollama model `qwen2.5:3b`

Make sure Ollama is running and the model is pulled:

```
ollama pull qwen2.5:3b
```

## Commentary Metadata (Optional)
If commentary docs are missing book/chapter metadata, the helper script can enrich the NT metadata:

```
python scripts/enrich_adam_clarke_metadata.py
```

Set `DRY_RUN = False` in the script to commit changes.

## Troubleshooting
- **Blank UI**: Ensure Vite dev server is running and no TypeScript errors.
- **AI errors**: Confirm Ollama is running and the model exists.
- **No notes showing**: Verify the `study_notes` table exists and API is running.

## License
Personal study project (add your preferred license if needed).
