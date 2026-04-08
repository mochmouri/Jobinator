import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Profession } from '@/types'

interface Props {
  profession: Profession
  variant?: 'primary' | 'secondary'
}

export default function CareerCard({ profession, variant = 'primary' }: Props) {
  if (variant === 'secondary') {
    return (
      <Card className="p-4">
        <p className="font-semibold text-text text-sm mb-1">{profession.name}</p>
        <p className="text-muted text-xs leading-relaxed line-clamp-2">{profession.description}</p>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{profession.name}</CardTitle>
        <CardDescription className="mt-2">{profession.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {profession.traits.map(trait => (
            <Badge key={trait}>{trait}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
