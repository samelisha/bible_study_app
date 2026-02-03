from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(
    prefix="/verses",
    tags=["Verses"]
)

@router.get("/")
def get_verses(
    book: str,
    chapter: int,
    verse: int | None = None,
    version: str = "KJV",
    db: Session = Depends(get_db)
):
    sql = text(f"""
        SELECT
            id,
            book,
            chapter,
            verse,
            text
        FROM bible_verses
        WHERE version_code = :version
          AND book = :book
          AND chapter = :chapter
          { "AND verse = :verse" if verse else "" }
        ORDER BY verse
    """)

    params = {
        "version": version,
        "book": book,
        "chapter": chapter
    }
    if verse:
        params["verse"] = verse

    rows = db.execute(sql, params).fetchall()

    return [
        {
            "verse_id": r.id,
            "reference": f"{r.book} {r.chapter}:{r.verse}",
            "book": r.book,
            "chapter": r.chapter,
            "verse": r.verse,
            "text": r.text
        }
        for r in rows
    ]
