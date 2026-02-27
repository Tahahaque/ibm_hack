import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('min-h-[96px] w-full rounded-xl border border-borderlight bg-white px-3 py-2 text-sm text-text-primary outline-none transition-all duration-180 focus:border-scarlet', className)}
    {...props}
  />
))

Textarea.displayName = 'Textarea'
