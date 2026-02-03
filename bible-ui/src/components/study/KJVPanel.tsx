interface Verse {
  verse: number
  text: string
}

interface Props {
  book: string
  chapter: number
  verses: Verse[]
  activeVerse: number | null
  onSelectVerse: (v: number) => void
}

export function KJVPanel({ book, chapter, verses, activeVerse, onSelectVerse }: Props) {
  return (
    <div className="panel-body">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">KJV Scripture</p>
          <h2>{book} {chapter}</h2>
        </div>
        <div className="panel-meta">{verses.length} verses</div>
      </div>

      <div className="panel-scroll">
        {verses.length === 0 ? (
          <div className="panel-empty">
            No verses loaded for this chapter yet.
          </div>
        ) : (
          verses.map(v => (
            <p
              key={v.verse}
              className={
                activeVerse === v.verse
                  ? "verse-row verse-row-active"
                  : "verse-row"
              }
              onClick={() => onSelectVerse(v.verse)}
            >
              <span className="verse-number">{v.verse}</span>
              <span className="verse-text">{v.text}</span>
            </p>
          ))
        )}
      </div>
    </div>
  )
}
