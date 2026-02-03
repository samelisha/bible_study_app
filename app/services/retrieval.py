from sqlalchemy import text


def retrieve_commentary(
    db,
    embedding,
    limit: int = 18,
    book: str | None = None,
    chapter: int | None = None
):
    sql = text("""
        SELECT cd.content
        FROM commentary_embeddings ce
        JOIN commentary_docs cd ON cd.id = ce.doc_id
        WHERE cd.source = 'adam_clarke'
          {book_filter}
          {chapter_filter}
        ORDER BY ce.embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """.format(
        book_filter="AND cd.book = :book" if book else "",
        chapter_filter="AND cd.chapter = :chapter" if chapter else ""
    ))

    params = {
        "embedding": embedding,
        "limit": limit
    }
    if book:
        params["book"] = book
    if chapter:
        params["chapter"] = chapter

    return db.execute(sql, params).fetchall()


def retrieve_verses_by_reference(
    db,
    book: str,
    chapter: int,
    verse: int | None = None
):
    sql = text(f"""
        SELECT bv.book, bv.chapter, bv.verse, bv.text
        FROM bible_verses bv
        WHERE bv.version_code = 'KJV'
          AND bv.book = :book
          AND bv.chapter = :chapter
          { "AND bv.verse = :verse" if verse else "" }
        ORDER BY bv.verse
    """)

    params = {"book": book, "chapter": chapter}
    if verse:
        params["verse"] = verse

    return db.execute(sql, params).fetchall()


def retrieve_verses(
    db,
    embedding,
    book: str | None,
    chapter: int | None,
    verse: int | None = None,
    limit: int = 6
):
    sql = text(f"""
        SELECT bv.book, bv.chapter, bv.verse, bv.text
        FROM bible_verse_embeddings be
        JOIN bible_verses bv ON bv.id = be.verse_id
        WHERE bv.version_code = 'KJV'
        { "AND bv.book = :book" if book else "" }
        { "AND bv.chapter = :chapter" if chapter else "" }
        { "AND bv.verse = :verse" if verse else "" }
        ORDER BY be.embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """)

    params = {"embedding": embedding, "limit": limit}
    if book:
        params["book"] = book
    if chapter:
        params["chapter"] = chapter
    if verse:
        params["verse"] = verse

    return db.execute(sql, params).fetchall()
