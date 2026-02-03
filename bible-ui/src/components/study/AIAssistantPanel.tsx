import { useMemo, useState } from "react"
import { askAI } from "../../services/api"

interface Props {
  book: string
  chapter: number
  verse: number | null
}

interface Message {
  role: "user" | "assistant"
  text: string
}

export function AIAssistantPanel({ book, chapter, verse }: Props) {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const referenceLabel = useMemo(() => {
    const verseLabel = verse ? `:${verse}` : ""
    return `${book} ${chapter}${verseLabel}`
  }, [book, chapter, verse])

  async function submit() {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setQuestion("")

    setMessages(prev => [...prev, { role: "user", text: trimmed }])

    try {
      const res = await askAI({
        book,
        chapter,
        verse: verse ?? undefined,
        question: trimmed,
      })
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: res.answer },
      ])
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "AI response failed. Try again in a moment."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-body panel-body-chat">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">AI Study Assistant</p>
          <h2>{referenceLabel}</h2>
        </div>
        <div className="panel-meta">Grounded in KJV + Clarke</div>
      </div>

      <div className="panel-scroll chat-scroll">
        {messages.length === 0 ? (
          <div className="panel-empty">
            Ask a question about the passage, doctrine, or Clarke's notes.
          </div>
        ) : (
          <div className="chat-thread">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={
                  msg.role === "user"
                    ? "chat-bubble chat-bubble-user"
                    : "chat-bubble chat-bubble-assistant"
                }
              >
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Ask about this passage…"
          value={question}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          rows={3}
        />
        <div className="chat-actions">
          {error && <span className="chat-error">{error}</span>}
          <button onClick={submit} disabled={loading || !question.trim()}>
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}
