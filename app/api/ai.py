import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import StudyRequest
from app.services.embeddings import embed
from app.services.retrieval import (
    retrieve_commentary,
    retrieve_verses,
    retrieve_verses_by_reference
)
from app.services.rag import build_prompt
from app.services.llm import ask_llm

router = APIRouter(prefix="/ai", tags=["AI"])


def extract_book_chapter(text: str):
    match = re.search(r"([1-3]?\s?[A-Za-z]+)\s+(\d+)", text)
    if match:
        return match.group(1).strip(), int(match.group(2))
    return None, None


def serialize_commentary(rows):
    return [
        {"content": r.content}
        for r in rows
        if getattr(r, "content", None)
    ]


@router.post("/study")
def ai_study(
    request: StudyRequest,
    db: Session = Depends(get_db)
):
    question = request.question.strip()
    selected_book = request.book
    selected_chapter = request.chapter
    selected_verse = request.verse

    extracted_book, extracted_chapter = extract_book_chapter(question)

    q_lower = question.lower()
    reference_terms = [
        "this verse",
        "this chapter",
        "this passage",
        "these verses",
        "the verse",
        "the chapter",
        "the passage",
        "here",
        "above",
        "below"
    ]

    has_reference_terms = any(term in q_lower for term in reference_terms)
    has_explicit_reference = extracted_book and extracted_chapter
    has_selected_verse = selected_verse is not None
    has_book_in_question = (
        selected_book.lower() in q_lower
        if selected_book
        else False
    )

    use_passage_scope = (
        has_reference_terms
        or has_explicit_reference
        or has_selected_verse
        or has_book_in_question
    )

    if has_explicit_reference:
        scope_book = extracted_book
        scope_chapter = extracted_chapter
        scope_verse = selected_verse
    else:
        scope_book = selected_book
        scope_chapter = selected_chapter
        scope_verse = selected_verse

    question_with_ref = question
    if use_passage_scope and scope_book:
        reference = scope_book
        if scope_chapter:
            reference = f"{reference} {scope_chapter}"
            if scope_verse:
                reference = f"{reference}:{scope_verse}"
        question_with_ref = f"{question} (Reference: {reference})"

    # ------------------------
    # 1. Verse-focused retrieval
    # ------------------------
    commentary_query = f"""
    Adam Clarke commentary on {question_with_ref}.
    Focus on interpretation of the specific verse.
    """

    commentary_embedding = embed(commentary_query)
    verse_embedding = embed(question_with_ref)

    verse_commentary = retrieve_commentary(
        db,
        commentary_embedding,
        book=scope_book if use_passage_scope else None,
        chapter=scope_chapter if use_passage_scope else None
    )

    # ------------------------
    # 2. Chapter-level fallback
    # ------------------------
    chapter_commentary = []
    if not verse_commentary and use_passage_scope and scope_book and scope_chapter:
        chapter_query = f"""
        Adam Clarke commentary on {scope_book} chapter {scope_chapter}.
        Focus on doctrine, exposition, and theology of the chapter.
        """
        chapter_embedding = embed(chapter_query)
        chapter_commentary = retrieve_commentary(
            db,
            chapter_embedding,
            book=scope_book,
            chapter=scope_chapter
        )

    # ------------------------
    # 3. Verse grounding (KJV)
    # ------------------------
    if use_passage_scope and scope_book and scope_chapter:
        verse_rows = retrieve_verses_by_reference(
            db,
            book=scope_book,
            chapter=scope_chapter,
            verse=scope_verse
        )
    else:
        verse_rows = retrieve_verses(
            db,
            verse_embedding,
            book=None,
            chapter=None,
            verse=None,
            limit=10
        )

    # ------------------------
    # 4. Prompt + LLM
    # ------------------------
    prompt = build_prompt(
        question_with_ref,
        verse_commentary,
        chapter_commentary,
        verse_rows
    )

    try:
        answer = ask_llm(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"LLM unavailable: {exc.__class__.__name__}"
        ) from exc

    return {
        "answer": answer,
        "meta": {
            "book": scope_book,
            "chapter": scope_chapter,
            "verse": scope_verse,
            "scope": "passage" if use_passage_scope else "global",
            "verse_commentary_chunks": len(verse_commentary),
            "chapter_commentary_chunks": len(chapter_commentary),
            "verse_chunks": len(verse_rows)
        },
        "sources": {
            "commentary": (
                serialize_commentary(verse_commentary[:5])
                if verse_commentary
                else serialize_commentary(chapter_commentary[:5])
            ),
            "verses": [
                {
                    "reference": f"{v.book} {v.chapter}:{v.verse}",
                    "text": v.text
                }
                for v in verse_rows
            ]
        }
    }
