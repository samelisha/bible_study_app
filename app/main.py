from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import verses, commentary, ai, health, metadata, notes

app = FastAPI(title="Bible Study API")

# ✅ CORS (required for Safari + Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(verses.router, tags=["verses"])
app.include_router(commentary.router, tags=["commentary"])
app.include_router(metadata.router, tags=["metadata"])
app.include_router(notes.router, tags=["notes"])
app.include_router(ai.router, tags=["ai"])
