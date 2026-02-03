import { Verse } from "../../types/study"

interface Props {
  verses: Verse[]
  activeVerse: number | null
  onSelectVerse: (v: number) => void
}

export function KJVPanel({ verses, activeVerse, onSelectVerse }: Props) {
  return (
    <div className="p-4 overflow-y-auto text-[16.5px] leading-relaxed">
      {verses.map(v => (
        <p
          key={v.verse}
          className={`cursor-pointer mb-2 ${
            activeVerse === v.verse ? "bg-yellow-100 dark:bg-yellow-900" : ""
          }`}
          onClick={() => onSelectVerse(v.verse)}
        >
          <sup className="text-gray-400 mr-1">{v.verse}</sup>
          {v.text}
        </p>
      ))}
    </div>
  )
}
