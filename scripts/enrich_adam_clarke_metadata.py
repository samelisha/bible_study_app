import re
import psycopg2
from psycopg2.extras import RealDictCursor

# =========================
# CONFIG
# =========================
DRY_RUN = False      # ← SET TO False TO COMMIT
SOURCE = "adam_clarke"

DB_CONFIG = {
    "dbname": "bible_db",
    "user": "bible_user",
    "password": "bible_pass",   # change if needed
    "host": "localhost",
    "port": 5432,
}

# =========================
# NT BOOKS (CANONICAL)
# =========================
NT_BOOKS = [
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1 Corinthians", "2 Corinthians",
    "Galatians", "Ephesians", "Philippians", "Colossians",
    "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon",
    "Hebrews", "James", "1 Peter", "2 Peter",
    "1 John", "2 John", "3 John", "Jude", "Revelation",
]

# =========================
# REGEX (STRICT & SAFE)
# =========================

# CHAPTER III.
CHAPTER_PATTERN = re.compile(
    r"^CHAPTER\s+([IVXLC]+)\.?",
    re.IGNORECASE,
)

# Matthew 1:
# John 3:
# Romans 8:
BOOK_HEADER_PATTERN = re.compile(
    r"^\s*(" + "|".join(re.escape(b) for b in NT_BOOKS) + r")\s+(\d+):",
    re.IGNORECASE,
)

# Footer / scrape junk indicators
JUNK_PATTERNS = [
    "Site Tools",
    "Manage My Preferences",
    "Reset My Password",
    "Bible Lexicons",
    "Additional Resources",
    "Daily Meditations",
    "Complete List of",
]

# =========================
# ROMAN NUMERALS
# =========================
ROMAN_MAP = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
    "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    "XI": 11, "XII": 12, "XIII": 13, "XIV": 14,
    "XV": 15, "XVI": 16, "XVII": 17, "XVIII": 18,
    "XIX": 19, "XX": 20,
}


def roman_to_int(roman: str) -> int | None:
    return ROMAN_MAP.get(roman.upper())


def is_junk(content: str) -> bool:
    return any(pat in content for pat in JUNK_PATTERNS)


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, content
        FROM commentary_docs
        WHERE source = %s
        ORDER BY id
    """, (SOURCE,))

    rows = cur.fetchall()

    current_book = None
    current_chapter = None
    updates = []

    for row in rows:
        content = (row["content"] or "").strip()
        if not content or is_junk(content):
            continue

        # -------------------------
        # CHAPTER DETECTION
        # -------------------------
        chapter_match = CHAPTER_PATTERN.match(content)
        if chapter_match:
            chapter = roman_to_int(chapter_match.group(1))
            if chapter:
                current_chapter = chapter
            continue

        # -------------------------
        # BOOK DETECTION (STRICT)
        # -------------------------
        book_match = BOOK_HEADER_PATTERN.match(content)
        if book_match:
            current_book = book_match.group(1)
            # Do NOT continue — this row still belongs to the book/chapter

        # -------------------------
        # ASSIGN METADATA
        # -------------------------
        if current_book and current_chapter:
            updates.append((current_book, current_chapter, row["id"]))

    print(f"Rows eligible for update: {len(updates)}")

    if DRY_RUN:
        print("DRY RUN — no updates written")
        print("Sample updates:")
        for u in updates[:15]:
            print(u)
        return

    # -------------------------
    # COMMIT
    # -------------------------
    cur.executemany("""
        UPDATE commentary_docs
        SET book = %s, chapter = %s
        WHERE id = %s
    """, updates)

    conn.commit()
    print("✅ Adam Clarke NT metadata enrichment committed successfully")


if __name__ == "__main__":
    main()
