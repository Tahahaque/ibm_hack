import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('h-10 w-full rounded-xl border border-borderlight bg-white px-3 text-sm text-text-primary outline-none transition-all duration-180 focus:border-scarlet', className)}
    {...props}
  />
))

Input.displayName = 'Input'
