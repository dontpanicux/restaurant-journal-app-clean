'use client'

import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
] as const

interface ReturnRadioProps {
  value: string
  onChange: (value: string) => void
}

export function ReturnRadio({ value, onChange }: ReturnRadioProps) {
  return (
    <div className="flex gap-6">
      {OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onChange(option.value)}
            className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all',
              value === option.value ? 'border-primary' : 'border-muted-foreground/40'
            )}
          >
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <span
            className="text-sm cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}
