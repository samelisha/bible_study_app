from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from app.core.database import get_db

from app.services.embeddings import embed
from app.services.retrieval import retrieve_commentary

router = APIRouter(prefix="/commentary", tags=["Commentary"])


@router.get("/")
def get_commentary_by_chapter(
    book: str,
    chapter: int,
    source: str = "adam_clarke",
    limit: int = 12,
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT
            cd.id,
            cd.content
        FROM commentary_docs cd
        WHERE cd.source = :source
          AND cd.book = :book
          AND cd.chapter = :chapter
        ORDER BY cd.id
        LIMIT :limit
    """)

    rows = db.execute(sql, {
        "source": source,
        "book": book,
        "chapter": chapter,
        "limit": limit
    }).fetchall()

    if rows:
        return {
            "commentary": [
                {
                    "commentary_id": r.id,
                    "content": r.content
                }
                for r in rows
            ],
            "confidence": "high",
            "mode": "chapter"
        }

    # Fallback to semantic retrieval if metadata isn't present
    query = f"{book} chapter {chapter} Adam Clarke commentary"
    query_embedding = embed(query)
    semantic_rows = retrieve_commentary(
        db,
        query_embedding,
        limit=limit
    )

    return {
        "commentary": [
            {
                "commentary_id": i,
                "content": r.content
            }
            for i, r in enumerate(semantic_rows)
        ],
        "confidence": "moderate" if semantic_rows else "none",
        "mode": "semantic"
    }
