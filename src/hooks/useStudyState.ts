import { useState } from "react"

export function useStudyState() {
  const [book, setBook] = useState("John")
  const [chapter, setChapter] = useState(3)
  const [activeVerse, setActiveVerse] = useState<number | null>(null)

  return {
    book,
    chapter,
    activeVerse,
    setBook,
    setChapter,
    setActiveVerse,
  }
}
