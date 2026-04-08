import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ProgressBar from './ProgressBar'
import type { Question } from '@/types'
import { Check, X } from 'lucide-react'

interface Props {
  question: Question
  stepNumber: number
  onAnswer: (yes: boolean) => void
  onRestart: () => void
}

export default function QuestionFlow({ question, stepNumber, onAnswer, onRestart }: Props) {
  const [chosen, setChosen] = useState<boolean | null>(null)

  function handleAnswer(yes: boolean) {
    if (chosen !== null) return
    setChosen(yes)
    setTimeout(() => onAnswer(yes), 300)
  }

  return (
    <div className="flex flex-col min-h-svh px-6 py-10">
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col justify-center">
        <ProgressBar current={stepNumber} />

        <div className="animate-slide-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text mb-10 leading-snug">
            {question.text.startsWith('[leaf]')
              ? 'Confirming your match…'
              : question.text}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1 gap-2"
              variant={chosen === true ? 'default' : chosen === false ? 'ghost' : 'default'}
              onClick={() => handleAnswer(true)}
              disabled={chosen !== null}
              style={chosen === true ? { opacity: 1 } : chosen === false ? { opacity: 0.4 } : {}}
            >
              <Check size={18} />
              Yes
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2"
              variant={chosen === false ? 'default' : chosen === true ? 'ghost' : 'ghost'}
              onClick={() => handleAnswer(false)}
              disabled={chosen !== null}
              style={chosen === false ? { opacity: 1, backgroundColor: '#1E4D3B', color: 'white' } : chosen === true ? { opacity: 0.4 } : {}}
            >
              <X size={18} />
              No
            </Button>
          </div>
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
