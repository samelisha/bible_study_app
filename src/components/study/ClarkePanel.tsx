import { CommentarySection, CommentaryConfidence } from "../../types/study"

interface Props {
  sections: CommentarySection[]
  confidence: CommentaryConfidence
}

export function ClarkePanel({ sections, confidence }: Props) {
  return (
    <div className="p-4 overflow-y-auto text-[16px] leading-relaxed">
      {confidence !== "high" && (
        <div className="mb-4 text-sm text-gray-600 italic">
          Adam Clarke does not comment directly on this verse, but provides
          teaching for this chapter.
        </div>
      )}

      {sections.map((s, i) => (
        <p key={i} className="mb-4">
          {s.content}
        </p>
      ))}
    </div>
  )
}
