'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (readonly ? value : (hovered || value))
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizeClass,
                filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
