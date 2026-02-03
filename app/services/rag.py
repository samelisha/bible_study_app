def build_prompt(
    question,
    verse_commentary,
    chapter_commentary,
    verses
):
    verse_commentary_texts = [c.content.strip() for c in verse_commentary if c.content]
    chapter_commentary_texts = [c.content.strip() for c in chapter_commentary if c.content]

    verses_block = "\n".join(
        f"{v.book} {v.chapter}:{v.verse} — {v.text}"
        for v in verses
    )

    if verse_commentary_texts:
        commentary_section = (
            "Adam Clarke Commentary (Verse-level):\n"
            + "\n\n".join(verse_commentary_texts[:8])
        )
        confidence = "strong"
    elif chapter_commentary_texts:
        commentary_section = (
            "Adam Clarke Commentary (Chapter-level context):\n"
            "NOTE: Clarke does not comment directly on this verse. "
            "The following reflects his teaching on the chapter as a whole.\n\n"
            + "\n\n".join(chapter_commentary_texts[:10])
        )
        confidence = "moderate"
    else:
        commentary_section = (
            "No Adam Clarke commentary was retrieved for this verse or chapter."
        )
        confidence = "weak"

    return f"""
You are a Bible study assistant grounded ONLY in:
- The King James Version (KJV)
- Adam Clarke's Commentary

Question:
{question}

{commentary_section}

KJV Scripture:
{verses_block}

Rules (STRICT):
1. Use ONLY the provided Scripture and commentary excerpts.
2. If the answer is not explicitly in the excerpts, say so plainly.
3. Do NOT invent Adam Clarke commentary.
4. Clearly distinguish verse-level vs chapter-level material.
5. Avoid speculation or outside knowledge.
6. If you quote, keep quotes under 15 words.

Response format (follow exactly):
- Commentary confidence: {confidence}
- Answer: 2-4 concise sentences grounded in the excerpts
- Scripture support: list references with short quotes or paraphrases
- Commentary support: cite Clarke excerpts or say \"None in excerpts\"
- Practical reflection: only if directly supported, otherwise \"None in excerpts\"
"""
