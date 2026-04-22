import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  asChild?: boolean
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--primary)] text-white shadow-sm hover:brightness-110 active:brightness-95',
  secondary: 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-50',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  danger: 'bg-[#C0392B] text-white hover:brightness-110',
}

export function Button({ className, variant = 'primary', asChild = false, children, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    className,
  )

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, {
      className: cn(classes, child.props.className),
    })
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
