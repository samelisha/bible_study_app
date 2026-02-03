from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db

router = APIRouter(prefix="/metadata", tags=["Metadata"])

CANONICAL_BOOKS = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation",
]

BOOK_ALIASES = {
    "psalm": "psalms",
    "song of songs": "song of solomon",
    "canticles": "song of solomon",
    "revelations": "revelation",
}


def normalize_book(name: str) -> str:
    cleaned = name.replace(".", " ")
    return " ".join(cleaned.strip().lower().split())


CANONICAL_INDEX = {
    normalize_book(name): index
    for index, name in enumerate(CANONICAL_BOOKS)
}


def canonical_sort_key(name: str):
    normalized = normalize_book(name)
    normalized = BOOK_ALIASES.get(normalized, normalized)
    index = CANONICAL_INDEX.get(normalized)
    return (index is None, index if index is not None else 999, name)


@router.get("/books")
def get_books(
    version: str = "KJV",
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT DISTINCT book
        FROM bible_verses
        WHERE version_code = :version
        ORDER BY book
    """)

    rows = db.execute(sql, {"version": version}).fetchall()
    books = [r.book for r in rows]
    return sorted(books, key=canonical_sort_key)


@router.get("/chapters")
def get_chapters(
    book: str,
    version: str = "KJV",
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT DISTINCT chapter
        FROM bible_verses
        WHERE version_code = :version
          AND book = :book
        ORDER BY chapter
    """)

    rows = db.execute(sql, {"version": version, "book": book}).fetchall()
    return [r.chapter for r in rows]


@router.get("/verses")
def get_verses(
    book: str,
    chapter: int,
    version: str = "KJV",
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT DISTINCT verse
        FROM bible_verses
        WHERE version_code = :version
          AND book = :book
          AND chapter = :chapter
        ORDER BY verse
    """)

    rows = db.execute(sql, {
        "version": version,
        "book": book,
        "chapter": chapter
    }).fetchall()

    return [r.verse for r in rows]
