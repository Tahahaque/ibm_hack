import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-scarlet text-white hover:opacity-95',
        outline: 'border border-scarlet bg-white text-scarlet hover:bg-red-50',
        ghost: 'bg-transparent text-text-primary hover:bg-red-50',
        success: 'bg-success text-white hover:opacity-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-5',
        sm: 'h-8 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})

Button.displayName = 'Button'

export { Button, buttonVariants }
