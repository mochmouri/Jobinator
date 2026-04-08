import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CareerCard from './CareerCard'
import { supabase } from '@/lib/supabaseClient'
import type { Profession } from '@/types'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface Props {
  profession: Profession
  related: Profession[]
  onRestart: () => void
  onTeach: () => void
}

export default function Result({ profession, related, onRestart, onTeach }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleFit() {
    if (submitting || submitted) return
    setSubmitting(true)
    await supabase
      .from('professions')
      .update({ feedback_score: (profession.feedback_score ?? 0) + 1 })
      .eq('id', profession.id)
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(onRestart, 1200)
  }

  return (
    <div className="flex flex-col min-h-svh px-6 py-10">
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="animate-fade-up">
          <p className="text-muted text-sm font-medium mb-2 uppercase tracking-widest">
            We think you'd thrive as a…
          </p>

          <CareerCard profession={profession} variant="primary" />

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleFit}
              disabled={submitting || submitted}
            >
              <ThumbsUp size={16} />
              {submitted ? 'Brilliant!' : submitting ? 'Saving…' : 'This fits me'}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="flex-1 gap-2"
              onClick={onTeach}
            >
              <ThumbsDown size={16} />
              This doesn't fit me
            </Button>
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <p className="text-muted text-xs font-medium uppercase tracking-widest mb-4">
                You might also consider
              </p>
              <div className="flex flex-col gap-3">
                {related.map(r => (
                  <CareerCard key={r.id} profession={r} variant="secondary" />
                ))}
              </div>
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
