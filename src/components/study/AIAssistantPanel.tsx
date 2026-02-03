import { useState } from "react"
import { askAI } from "../../services/api"

interface Props {
  book: string
  chapter: number
  verse: number | null
}

export function AIAssistantPanel({ book, chapter, verse }: Props) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)

  async function submit() {
    const res = await askAI({
      book,
      chapter,
      verse: verse ?? undefined,
      question,
    })
    setAnswer(res.answer)
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <textarea
        className="border p-2 mb-2 text-sm"
        placeholder="Ask about this passage…"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white py-1 mb-4"
        onClick={submit}
      >
        Ask
      </button>

      {answer && (
        <div className="text-[15.5px] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}
