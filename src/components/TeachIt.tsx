import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabaseClient'
import type { Profession } from '@/types'
import { CheckCircle } from 'lucide-react'

const MAX_CHARS = 200

interface Props {
  shownProfession: Profession
  onRestart: () => void
}

export default function TeachIt({ shownProfession, onRestart }: Props) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!text.trim() || submitting || submitted) return
    setSubmitting(true)
    await supabase.from('suggestions').insert({
      suggestion_text: text.trim(),
      shown_profession_id: shownProfession.id,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-svh px-6 py-10">
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="animate-fade-up">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-3 leading-snug">
            Help Jobinator get smarter
          </h2>
          <p className="text-muted text-base mb-8 leading-relaxed">
            We matched you with{' '}
            <span className="font-medium text-text">{shownProfession.name}</span>,
            but that doesn't sound right to you. What's one thing about your ideal work life
            that we never asked?
          </p>

          {submitted ? (
            <div className="flex items-start gap-3 p-5 rounded-xl border border-card-border bg-white">
              <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-text text-sm leading-relaxed">
                Thanks — your answer helps future students find their path.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Textarea
                  placeholder="e.g. I want to work outside most of the day…"
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                  rows={4}
                />
                <span className="absolute bottom-3 right-4 text-xs text-muted tabular-nums">
                  {text.length} / {MAX_CHARS}
                </span>
              </div>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="w-full"
              >
                {submitting ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onRestart}
          className="text-muted text-sm underline-offset-4 hover:text-text hover:underline transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  )
}
