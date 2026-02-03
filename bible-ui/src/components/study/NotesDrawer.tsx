import { useEffect, useMemo, useRef, useState } from "react"
import { createNote, fetchNotes, updateNote } from "../../services/api"
import type { StudyNote } from "../../services/api"

interface Props {
  open: boolean
  onClose: () => void
  reference: string
}

const emptyNote = (reference: string) => ({
  id: null as number | null,
  title: "",
  content: "",
  tags: "",
  verse_ref: reference,
})

export function NotesDrawer({ open, onClose, reference }: Props) {
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [filter, setFilter] = useState<"all" | "reference">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(() => emptyNote(reference))
  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  const referenceLabel = useMemo(() => reference || "", [reference])
  const isPinnedToReference =
    Boolean(referenceLabel) && form.verse_ref === referenceLabel

  useEffect(() => {
    if (!open) return
    loadNotes()
  }, [open, filter, search, referenceLabel])

  useEffect(() => {
    if (form.id === null) {
      setForm(prev => ({ ...prev, verse_ref: referenceLabel }))
    }
  }, [referenceLabel, form.id])

  useEffect(() => {
    if (!open) return
    resizeContent()
  }, [open, form.content])

  function resizeContent() {
    if (!contentRef.current) return
    const el = contentRef.current
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  async function loadNotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchNotes({
        search: search.trim() || undefined,
        verse_ref: filter === "reference" ? referenceLabel : undefined,
        limit: 200,
      })
      setNotes(res)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notes"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function startNewNote() {
    setForm(emptyNote(referenceLabel))
    setError(null)
  }

  function editNote(note: StudyNote) {
    setForm({
      id: note.id,
      title: note.title ?? "",
      content: note.content ?? "",
      tags: note.tags ?? "",
      verse_ref: note.verse_ref ?? "",
    })
  }

  function togglePin() {
    if (!referenceLabel) return
    setForm(prev => ({
      ...prev,
      verse_ref: isPinnedToReference ? "" : referenceLabel,
    }))
  }

  async function saveNote() {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (form.id) {
        await updateNote(form.id, {
          title: form.title,
          content: form.content,
          tags: form.tags || null,
          verse_ref: form.verse_ref || null,
        })
      } else {
        await createNote({
          title: form.title,
          content: form.content,
          tags: form.tags || null,
          verse_ref: form.verse_ref || null,
        })
      }

      await loadNotes()
      startNewNote()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className={open ? "notes-overlay notes-overlay-open" : "notes-overlay"}
        onClick={onClose}
      />
      <aside className={open ? "notes-drawer notes-drawer-open" : "notes-drawer"}>
        <div className="notes-header">
          <div>
            <p className="panel-kicker">Study Notes</p>
            <h2>Notes</h2>
          </div>
          <button className="button-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="notes-scroll">
          <div className="notes-filters">
            <select
              value={filter}
              onChange={event => setFilter(event.target.value as "all" | "reference")}
            >
              <option value="all">All Notes</option>
              <option value="reference" disabled={!referenceLabel}>
                This Passage
              </option>
            </select>
            <input
              type="search"
              placeholder="Search notes"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            <button className="button-secondary" onClick={startNewNote}>New</button>
          </div>

          <div className="notes-list">
            {loading ? (
              <div className="panel-empty">Loading notes…</div>
            ) : notes.length === 0 ? (
              <div className="panel-empty">No notes yet. Create one below.</div>
            ) : (
              notes.map(note => (
                <button
                  key={note.id}
                  className={
                    form.id === note.id
                      ? "note-card note-card-active"
                      : "note-card"
                  }
                  onClick={() => editNote(note)}
                >
                  <div className="note-title">{note.title}</div>
                  <div className="note-meta">
                    {note.verse_ref || "No reference"}
                    {note.verse_ref === referenceLabel && (
                      <span className="note-pill">Pinned</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="notes-editor">
            <label className="notes-field">
              <span>Title</span>
              <input
                value={form.title}
                onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
              />
            </label>
          <label className="notes-field">
            <span>Reference</span>
            <input
              value={form.verse_ref ?? ""}
              onChange={event => setForm(prev => ({ ...prev, verse_ref: event.target.value }))}
            />
            <div className="notes-inline">
              <button
                type="button"
                className="button-secondary"
                onClick={togglePin}
                disabled={!referenceLabel}
              >
                {isPinnedToReference ? "Unpin from passage" : "Pin to passage"}
              </button>
              {!referenceLabel && (
                <span className="notes-hint">Select a passage to enable pinning.</span>
              )}
            </div>
          </label>
            <label className="notes-field">
              <span>Tags</span>
              <input
                value={form.tags ?? ""}
                onChange={event => setForm(prev => ({ ...prev, tags: event.target.value }))}
              />
            </label>
            <label className="notes-field">
              <span>Content</span>
              <textarea
                ref={contentRef}
                rows={6}
                value={form.content}
                onChange={event => {
                  setForm(prev => ({ ...prev, content: event.target.value }))
                  resizeContent()
                }}
              />
            </label>

            {error && <div className="notes-error">{error}</div>}

            <div className="notes-actions">
              <button className="button-secondary" onClick={startNewNote}>Clear</button>
              <button onClick={saveNote} disabled={saving}>
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
