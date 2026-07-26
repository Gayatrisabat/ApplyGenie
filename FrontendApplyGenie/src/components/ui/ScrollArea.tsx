import * as React from 'react'
import { cn } from '@/utils/cn'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  horizontal?: boolean
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, horizontal, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <div
        className={cn(
          'overflow-auto',
          horizontal ? 'overflow-x-auto' : 'overflow-y-auto',
        )}
      >
        {children}
      </div>
    </div>
  ),
)
ScrollArea.displayName = 'ScrollArea'

export { ScrollArea }
