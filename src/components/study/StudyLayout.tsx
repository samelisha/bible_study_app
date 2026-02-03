import { ReactNode } from "react"

export function StudyLayout({
  left,
  middle,
  right,
}: {
  left: ReactNode
  middle: ReactNode
  right: ReactNode
}) {
  return (
    <div className="grid grid-cols-3 h-screen divide-x dark:divide-gray-700">
      <div>{left}</div>
      <div>{middle}</div>
      <div>{right}</div>
    </div>
  )
}
