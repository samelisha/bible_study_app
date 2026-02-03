const API_BASE = "http://localhost:8000"

export async function fetchVerses(
  book: string,
  chapter: number,
  verse?: number | null
) {
  const params = new URLSearchParams({
    book,
    chapter: String(chapter),
  })
  if (verse) {
    params.set("verse", String(verse))
  }
  const res = await fetch(`${API_BASE}/verses/?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch verses")
  return res.json()
}

export async function fetchCommentary(book: string, chapter: number) {
  const res = await fetch(
    `${API_BASE}/commentary/?book=${encodeURIComponent(book)}&chapter=${chapter}`
  )

  const data = await res.json()

  if (Array.isArray(data)) {
    return {
      commentary: data,
      confidence: "high" as const,
    }
  }

  return {
    commentary: Array.isArray(data?.commentary) ? data.commentary : [],
    confidence: (data?.confidence as "high" | "moderate" | "none") ?? "none",
  }
}

export async function fetchBooks() {
  const res = await fetch(`${API_BASE}/metadata/books`)
  if (!res.ok) throw new Error("Failed to fetch books")
  return res.json()
}

export async function fetchChapters(book: string) {
  const res = await fetch(
    `${API_BASE}/metadata/chapters?book=${encodeURIComponent(book)}`
  )
  if (!res.ok) throw new Error("Failed to fetch chapters")
  return res.json()
}

export async function fetchVerseNumbers(book: string, chapter: number) {
  const res = await fetch(
    `${API_BASE}/metadata/verses?book=${encodeURIComponent(book)}&chapter=${chapter}`
  )
  if (!res.ok) throw new Error("Failed to fetch verses")
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
  if (!res.ok) {
    const text = await res.text()
    let message = "AI request failed"
    if (text) {
      try {
        const data = JSON.parse(text)
        if (data?.detail) {
          message = String(data.detail)
        } else {
          message = text
        }
      } catch {
        message = text
      }
    }
    throw new Error(message)
  }
  return res.json()
}

export interface StudyNote {
  id: number
  title: string
  content: string
  tags?: string | null
  verse_ref?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export async function fetchNotes(params?: {
  search?: string
  verse_ref?: string
  tag?: string
  limit?: number
}) {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.verse_ref) query.set("verse_ref", params.verse_ref)
  if (params?.tag) query.set("tag", params.tag)
  if (params?.limit) query.set("limit", String(params.limit))

  const res = await fetch(`${API_BASE}/notes/?${query.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch notes")
  return res.json() as Promise<StudyNote[]>
}

export async function createNote(payload: {
  title: string
  content: string
  tags?: string | null
  verse_ref?: string | null
}) {
  const res = await fetch(`${API_BASE}/notes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to create note")
  }
  return res.json() as Promise<StudyNote>
}

export async function updateNote(
  noteId: number,
  payload: {
    title?: string
    content?: string
    tags?: string | null
    verse_ref?: string | null
  }
) {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to update note")
  }
  return res.json() as Promise<StudyNote>
}
