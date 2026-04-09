import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Landing from '@/components/Landing'
import QuestionFlow from '@/components/QuestionFlow'
import Result from '@/components/Result'
import TeachIt from '@/components/TeachIt'
import type { View, Question, Profession } from '@/types'

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [step, setStep] = useState(1)

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [questionError, setQuestionError] = useState('')

  const [matchedProfession, setMatchedProfession] = useState<Profession | null>(null)
  const [relatedProfessions, setRelatedProfessions] = useState<Profession[]>([])

  const fetchRoot = useCallback(async () => {
    setLoadingQuestion(true)
    setQuestionError('')
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_root', true)
      .single()
    if (error || !data) {
      setQuestionError('Could not load questions. Please try again.')
      setLoadingQuestion(false)
      return
    }
    setCurrentQuestion(data as Question)
    setLoadingQuestion(false)
  }, [])

  async function fetchQuestion(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data as Question
  }

  async function fetchProfession(id: string): Promise<Profession | null> {
    const { data, error } = await supabase
      .from('professions')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) return null
    return data as Profession
  }

  async function fetchRelated(ids: string[]): Promise<Profession[]> {
    if (!ids || ids.length === 0) return []
    const { data, error } = await supabase
      .from('professions')
      .select('*')
      .in('id', ids.slice(0, 3))
    if (error || !data) return []
    return data as Profession[]
  }

  async function handleStart() {
    setStep(1)
    setMatchedProfession(null)
    setRelatedProfessions([])
    setQuestionError('')
    await fetchRoot()
    setView('question')
  }

  async function handleAnswer(yes: boolean) {
    if (!currentQuestion) return

    const nextId = yes ? currentQuestion.yes_next : currentQuestion.no_next
    if (!nextId) {
      setQuestionError('Reached an unexpected end of the tree.')
      return
    }

    const next = await fetchQuestion(nextId)
    if (!next) {
      setQuestionError('Could not load next question.')
      return
    }

    if (next.profession_id) {
      const prof = await fetchProfession(next.profession_id)
      if (!prof) {
        setQuestionError('Could not load profession.')
        return
      }
      const related = await fetchRelated(prof.related_ids ?? [])
      setMatchedProfession(prof)
      setRelatedProfessions(related)
      setView('result')
      return
    }

    setStep(s => s + 1)
    setCurrentQuestion(next)
  }

  function handleRestart() {
    setView('landing')
    setCurrentQuestion(null)
    setMatchedProfession(null)
    setRelatedProfessions([])
    setStep(1)
    setQuestionError('')
  }

  // Preload root in background so first question loads instantly
  useEffect(() => {
    fetchRoot()
  }, [fetchRoot])

  return (
    <div className="min-h-svh bg-bg font-sans text-text">
      {view === 'landing' && (
        <Landing onStart={handleStart} />
      )}

      {view === 'question' && (
        <>
          {loadingQuestion && (
            <div className="flex min-h-svh items-center justify-center">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loadingQuestion && questionError && (
            <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-muted">{questionError}</p>
              <button
                onClick={handleRestart}
                className="text-accent underline text-sm"
              >
                Start over
              </button>
            </div>
          )}
          {!loadingQuestion && !questionError && currentQuestion && (
            <QuestionFlow
              key={currentQuestion.id}
              question={currentQuestion}
              stepNumber={step}
              onAnswer={handleAnswer}
              onRestart={handleRestart}
            />
          )}
        </>
      )}

      {view === 'result' && matchedProfession && (
        <Result
          profession={matchedProfession}
          related={relatedProfessions}
          onRestart={handleRestart}
          onTeach={() => setView('teach')}
        />
      )}

      {view === 'teach' && matchedProfession && (
        <TeachIt
          shownProfession={matchedProfession}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
