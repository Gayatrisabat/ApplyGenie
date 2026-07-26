import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'border-secondary/50 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
        destructive: 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20',
        outline: 'text-foreground border-border/50',
        success: 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20',
        warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
