import { useEffect, useMemo, useState } from "react"
import "./StudyMode.css"
import { useStudyState } from "../hooks/useStudyState"
import {
  fetchVerses,
  fetchBooks,
  fetchChapters,
  fetchVerseNumbers,
} from "../services/api"
import { KJVPanel } from "../components/study/KJVPanel"
import { AIAssistantPanel } from "../components/study/AIAssistantPanel"
import { StudyLayout } from "../components/study/StudyLayout"
import { StudyControls } from "../components/study/StudyControls"
import { NotesDrawer } from "../components/study/NotesDrawer"

export default function StudyMode() {
  const {
    book,
    chapter,
    activeVerse,
    setBook,
    setChapter,
    setActiveVerse,
  } = useStudyState()

  const [verses, setVerses] = useState<any[]>([])
  const [filterVerse, setFilterVerse] = useState<number | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)

  const [books, setBooks] = useState<string[]>([])
  const [chapters, setChapters] = useState<number[]>([])
  const [verseNumbers, setVerseNumbers] = useState<number[]>([])

  useEffect(() => {
    fetchBooks()
      .then(data => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]))
  }, [])

  useEffect(() => {
    if (books.length === 0) return
    if (!books.includes(book)) {
      setBook(books[0])
    }
  }, [books, book, setBook])

  useEffect(() => {
    if (!book) return
    fetchChapters(book)
      .then(data => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]))
  }, [book])

  useEffect(() => {
    if (chapters.length === 0) return
    if (!chapters.includes(chapter)) {
      setChapter(chapters[0])
    }
  }, [chapters, chapter, setChapter])

  useEffect(() => {
    if (!book || !chapter) return
    fetchVerseNumbers(book, chapter)
      .then(data => setVerseNumbers(Array.isArray(data) ? data : []))
      .catch(() => setVerseNumbers([]))
  }, [book, chapter])

  useEffect(() => {
    if (activeVerse && !verseNumbers.includes(activeVerse)) {
      setActiveVerse(null)
    }
  }, [verseNumbers, activeVerse, setActiveVerse])

  useEffect(() => {
    if (filterVerse && !verseNumbers.includes(filterVerse)) {
      setFilterVerse(null)
    }
  }, [verseNumbers, filterVerse])

  useEffect(() => {
    if (!book || !chapter) return

    fetchVerses(book, chapter, filterVerse)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVerses(data)
        } else {
          setVerses([])
        }
      })
      .catch(() => setVerses([]))
  }, [book, chapter, filterVerse])

  const referenceLabel = useMemo(() => {
    if (!book || !chapter) return ""
    const verseLabel = activeVerse ? `:${activeVerse}` : ""
    return `${book} ${chapter}${verseLabel}`
  }, [book, chapter, activeVerse])

  return (
    <>
      <StudyLayout
        header={
          <div className="study-header-inner">
            <div className="study-title">
              <div className="study-mark">KJV</div>
              <div>
                <p className="study-kicker">Elisha&apos;s BIBLE STUDY WORKSPACE</p>
                <h1>Clarke + KJV Companion</h1>
              </div>
            </div>

            <StudyControls
              books={books}
              chapters={chapters}
              verses={verseNumbers}
              book={book}
              chapter={chapter}
              verse={filterVerse}
              onBookChange={nextBook => {
                setBook(nextBook)
                setActiveVerse(null)
                setFilterVerse(null)
              }}
              onChapterChange={nextChapter => {
                setChapter(nextChapter)
                setActiveVerse(null)
                setFilterVerse(null)
              }}
              onVerseChange={nextVerse => {
                setFilterVerse(nextVerse)
                setActiveVerse(nextVerse ?? null)
              }}
            />

            <div className="study-status">
              <span>AI grounded in KJV + Adam Clarke</span>
              <div className="study-status-row">
                <strong>{referenceLabel || "Select a passage"}</strong>
                <button className="button-secondary" onClick={() => setNotesOpen(true)}>
                  Notes
                </button>
              </div>
            </div>
          </div>
        }
        left={
          <KJVPanel
            book={book}
            chapter={chapter}
            verses={verses}
            activeVerse={activeVerse}
            onSelectVerse={setActiveVerse}
          />
        }
        right={
          <AIAssistantPanel
            book={book}
            chapter={chapter}
            verse={activeVerse}
          />
        }
      />
      <NotesDrawer
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        reference={referenceLabel}
      />
    </>
  )
}
