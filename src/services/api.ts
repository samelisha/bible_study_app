const API_BASE = "http://localhost:8000"

export async function fetchVerses(book: string, chapter: number) {
  const res = await fetch(
    `${API_BASE}/verses?book=${book}&chapter=${chapter}`
  )
  return res.json()
}

export async function fetchCommentary(book: string, chapter: number) {
  const res = await fetch(
    `${API_BASE}/commentary?book=${book}&chapter=${chapter}`
  )
  return res.json()
}

export async function askAI(payload: {
  book: string
  chapter: number
  verse?: number
  question: string
}) {
  const res = await fetch(`${API_BASE}/ai/study`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}
