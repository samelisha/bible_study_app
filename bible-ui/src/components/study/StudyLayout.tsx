import type { ReactNode } from "react"

interface Props {
  header: ReactNode
  left: ReactNode
  right: ReactNode
}

export function StudyLayout({ header, left, right }: Props) {
  return (
    <div className="study-shell">
      <div className="study-backdrop" aria-hidden="true" />
      <header className="study-header">{header}</header>
      <main className="study-main">
        <section className="study-panel">{left}</section>
        <section className="study-panel">{right}</section>
      </main>
    </div>
  )
}
