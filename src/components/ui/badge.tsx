import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        'bg-[rgba(30,77,59,0.08)] text-accent border border-[rgba(30,77,59,0.15)]',
        className
      )}
      {...props}
    />
  )
}

export { Badge }
