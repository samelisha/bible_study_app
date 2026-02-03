from pydantic import BaseModel

class StudyRequest(BaseModel):
    question: str
    book: str | None = None
    chapter: int | None = None
    verse: int | None = None


class NoteCreate(BaseModel):
    title: str
    content: str
    tags: str | None = None
    verse_ref: str | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: str | None = None
    verse_ref: str | None = None
