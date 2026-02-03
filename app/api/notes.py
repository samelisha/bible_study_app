from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.models.schemas import NoteCreate, NoteUpdate

router = APIRouter(prefix="/notes", tags=["Notes"])


def serialize_note(row):
    return {
        "id": row.id,
        "title": row.title,
        "content": row.content,
        "tags": row.tags,
        "verse_ref": row.verse_ref,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@router.get("/")
def list_notes(
    search: str | None = None,
    verse_ref: str | None = None,
    tag: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    conditions = ["1=1"]
    params: dict[str, object] = {"limit": limit, "offset": offset}

    if search:
        conditions.append("(title ILIKE :search OR content ILIKE :search)")
        params["search"] = f"%{search}%"
    if verse_ref:
        conditions.append("verse_ref ILIKE :verse_ref")
        params["verse_ref"] = f"%{verse_ref}%"
    if tag:
        conditions.append("tags ILIKE :tag")
        params["tag"] = f"%{tag}%"

    sql = text(f"""
        SELECT id, title, content, tags, verse_ref, created_at, updated_at
        FROM study_notes
        WHERE {' AND '.join(conditions)}
        ORDER BY updated_at DESC
        LIMIT :limit OFFSET :offset
    """)

    rows = db.execute(sql, params).fetchall()
    return [serialize_note(r) for r in rows]


@router.get("/{note_id}")
def get_note(
    note_id: int,
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT id, title, content, tags, verse_ref, created_at, updated_at
        FROM study_notes
        WHERE id = :id
    """)

    row = db.execute(sql, {"id": note_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Note not found")

    return serialize_note(row)


@router.post("/")
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db)
):
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")

    sql = text("""
        INSERT INTO study_notes (title, content, tags, verse_ref)
        VALUES (:title, :content, :tags, :verse_ref)
        RETURNING id, title, content, tags, verse_ref, created_at, updated_at
    """)

    row = db.execute(sql, {
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "tags": payload.tags,
        "verse_ref": payload.verse_ref
    }).fetchone()

    db.commit()

    return serialize_note(row)


@router.put("/{note_id}")
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db)
):
    sql = text("""
        UPDATE study_notes
        SET title = COALESCE(:title, title),
            content = COALESCE(:content, content),
            tags = COALESCE(:tags, tags),
            verse_ref = COALESCE(:verse_ref, verse_ref),
            updated_at = now()
        WHERE id = :id
        RETURNING id, title, content, tags, verse_ref, created_at, updated_at
    """)

    row = db.execute(sql, {
        "id": note_id,
        "title": payload.title.strip() if payload.title is not None else None,
        "content": payload.content.strip() if payload.content is not None else None,
        "tags": payload.tags,
        "verse_ref": payload.verse_ref
    }).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Note not found")

    db.commit()

    return serialize_note(row)
