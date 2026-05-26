'use client'

import { cn } from '@/lib/utils'

const OPTIONS = ['$', '$$', '$$$', '$$$$'] as const
type PriceRange = typeof OPTIONS[number]

interface PriceRangePickerProps {
  value: string
  onChange: (value: PriceRange) => void
}

export function PriceRangePicker({ value, onChange }: PriceRangePickerProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'px-4 py-2 rounded-md border text-sm font-medium transition-all',
            value === option
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
