import { Progress } from '@/components/ui/progress'

interface Props {
  current: number
  estimated?: number
}

export default function ProgressBar({ current, estimated = 12 }: Props) {
  const pct = Math.min(Math.round((current / estimated) * 100), 100)
  return (
    <div className="mb-8">
      <Progress value={pct} className="mb-2" />
      <p className="text-xs text-muted text-right tabular-nums">
        Question {current} of ~{estimated}
      </p>
    </div>
  )
}
