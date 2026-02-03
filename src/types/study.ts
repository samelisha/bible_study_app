export interface Verse {
  verse: number
  text: string
}

export interface CommentarySection {
  content: string
}

export type CommentaryConfidence = "high" | "moderate" | "none"
