import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  delta?: string
  icon?: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'danger'
  footer?: string
}

const tones: Record<NonNullable<MetricCardProps['tone']>, string> = {
  neutral: 'text-stone-900',
  good: 'text-[var(--primary)]',
  warn: 'text-amber-600',
  danger: 'text-red-600',
}

export function MetricCard({ title, value, delta, icon, tone = 'neutral', footer }: MetricCardProps) {
  return (
    <Card className="min-h-[140px]">
      <CardContent className="flex h-full flex-col justify-between gap-3 p-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">{title}</p>
            <p className={cn('mt-1 text-3xl font-semibold tracking-tight', tones[tone])}>{value}</p>
          </div>
          {icon ? <div className="rounded-2xl bg-stone-50 p-3 text-[var(--primary)]">{icon}</div> : null}
        </div>
        {(delta || footer) && (
          <div className="space-y-1 text-sm">
            {delta ? <p className="font-medium text-[var(--primary)]">{delta}</p> : null}
            {footer ? <p className="text-stone-500">{footer}</p> : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
