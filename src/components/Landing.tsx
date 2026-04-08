import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  function scrollToHow() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 animate-fade-up">
        <div className="max-w-xl w-full mx-auto text-center">
          <h1 className="font-display text-6xl sm:text-7xl font-black text-text mb-4 leading-none tracking-tight">
            Jobinator
          </h1>
          <p className="text-muted text-lg sm:text-xl leading-relaxed mb-10 max-w-md mx-auto">
            [COPY NEEDED] — A short, compelling line that tells students aged 16–22 what Jobinator helps them do.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={onStart} className="w-full sm:w-auto">
              Discover your career
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={scrollToHow}
              className="w-full sm:w-auto"
            >
              How it works
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-6 py-20 border-t border-card-border"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-text text-center mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Answer questions',
                body: '[COPY NEEDED] — One sentence describing the yes/no question format.',
              },
              {
                step: '02',
                title: 'Get matched',
                body: '[COPY NEEDED] — One sentence on how the result is reached.',
              },
              {
                step: '03',
                title: 'Explore careers',
                body: '[COPY NEEDED] — One sentence on what the result page shows.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center sm:text-left">
                <span className="inline-block font-display text-4xl font-black text-[rgba(30,77,59,0.15)] mb-3 leading-none">
                  {step}
                </span>
                <h3 className="font-semibold text-text mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
