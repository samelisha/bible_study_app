interface Props {
  books: string[]
  chapters: number[]
  verses: number[]
  book: string
  chapter: number
  verse: number | null
  onBookChange: (book: string) => void
  onChapterChange: (chapter: number) => void
  onVerseChange: (verse: number | null) => void
}

export function StudyControls({
  books,
  chapters,
  verses,
  book,
  chapter,
  verse,
  onBookChange,
  onChapterChange,
  onVerseChange,
}: Props) {
  const safeBook = books.includes(book) ? book : books[0] ?? ""
  const safeChapter = chapters.includes(chapter)
    ? chapter
    : chapters[0] ?? ""

  return (
    <div className="study-controls">
      <label className="study-control">
        <span>Book</span>
        <select
          value={safeBook}
          onChange={event => onBookChange(event.target.value)}
          disabled={books.length === 0}
        >
          {books.length === 0 && <option>Loading…</option>}
          {books.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label className="study-control">
        <span>Chapter</span>
        <select
          value={safeChapter}
          onChange={event => onChapterChange(Number(event.target.value))}
          disabled={chapters.length === 0}
        >
          {chapters.length === 0 && <option value="">—</option>}
          {chapters.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="study-control">
        <span>Verse</span>
        <select
          value={verse ?? ""}
          onChange={event => {
            const value = event.target.value
            onVerseChange(value ? Number(value) : null)
          }}
          disabled={verses.length === 0}
        >
          <option value="">All</option>
          {verses.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
