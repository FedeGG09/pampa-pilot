import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'warning' | 'danger' | 'success'
}

const tones: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  danger: 'border-red-200 bg-red-50 text-red-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
}

export function Alert({ className, tone = 'info', ...props }: AlertProps) {
  return <div className={cn('rounded-2xl border p-4', tones[tone], className)} {...props} />
}
