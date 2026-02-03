import { useEffect, useState } from "react"
import { useStudyState } from "../hooks/useStudyState"
import { fetchVerses, fetchCommentary } from "../services/api"
import { KJVPanel } from "../components/study/KJVPanel"
import { ClarkePanel } from "../components/study/ClarkePanel"
import { AIAssistantPanel } from "../components/study/AIAssistantPanel"
import { StudyLayout } from "../components/study/StudyLayout"

export default function StudyMode() {
  const state = useStudyState()
  const [verses, setVerses] = useState([])
  const [commentary, setCommentary] = useState([])
  const [confidence, setConfidence] = useState<"high" | "moderate" | "none">(
    "none"
  )

  useEffect(() => {
    fetchVerses(state.book, state.chapter).then(setVerses)
    fetchCommentary(state.book, state.chapter).then(res => {
      setCommentary(res.commentary)
      setConfidence(res.confidence)
    })
  }, [state.book, state.chapter])

  return (
    <StudyLayout
      left={
        <KJVPanel
          verses={verses}
          activeVerse={state.activeVerse}
          onSelectVerse={state.setActiveVerse}
        />
      }
      middle={
        <ClarkePanel
          sections={commentary}
          confidence={confidence}
        />
      }
      right={
        <AIAssistantPanel
          book={state.book}
          chapter={state.chapter}
          verse={state.activeVerse}
        />
      }
    />
  )
}
