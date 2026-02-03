interface CommentarySection {
  content: string
}

interface Props {
  book: string
  chapter: number
  sections: CommentarySection[]
  confidence: "high" | "moderate" | "none"
}

const confidenceLabels: Record<Props["confidence"], string> = {
  high: "Chapter focus",
  moderate: "Semantic fallback",
  none: "Limited data",
}

export function ClarkePanel({ book, chapter, sections, confidence }: Props) {
  return (
    <div className="panel-body">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Adam Clarke Commentary</p>
          <h2>{book} {chapter}</h2>
        </div>
        <div className={`panel-badge panel-badge-${confidence}`}>
          {confidenceLabels[confidence]}
        </div>
      </div>

      <div className="panel-scroll">
        {confidence !== "high" && (
          <p className="panel-note">
            Clarke comments at the chapter or section level for many passages.
          </p>
        )}

        {sections.length === 0 ? (
          <div className="panel-empty">
            No commentary passages surfaced yet. Try another chapter.
          </div>
        ) : (
          sections.map((s, i) => (
            <p key={i} className="commentary-block">
              {s.content}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
