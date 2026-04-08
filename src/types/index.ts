export interface Profession {
  id: string
  name: string
  description: string
  traits: string[]
  related_ids: string[]
  feedback_score: number
  created_at: string
}

export interface Question {
  id: string
  text: string
  yes_next: string | null
  no_next: string | null
  profession_id: string | null
  is_root: boolean
  created_at: string
}

export interface Suggestion {
  id?: string
  suggestion_text: string
  shown_profession_id: string
  created_at?: string
}

export type View = 'landing' | 'question' | 'result' | 'teach'
