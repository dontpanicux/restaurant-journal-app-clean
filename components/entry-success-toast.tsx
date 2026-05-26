'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'

const DURATION = 4000

export function EntrySuccessToast() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    toast.custom(
      (id) => (
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3"
          style={{
            width: 380,
            height: 60,
            background: '#2d1b14',
            boxShadow: '0px 10px 24px -6px rgba(0,0,0,0.15)',
          }}
        >
          {/* Terracotta checkmark circle */}
          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#bc592d' }}>
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <p className="text-sm font-medium text-white leading-normal">
              Entry added to your journal!
            </p>
            <p className="text-xs leading-normal" style={{ color: '#6b5a52' }}>
              Your review has been saved.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => toast.dismiss(id)}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: '#6b5a52' }} />
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 flex overflow-hidden">
            <div
              className="h-full"
              style={{
                background: '#bc592d',
                animation: `toast-progress ${DURATION}ms linear forwards`,
              }}
            />
            <div className="flex-1 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      ),
      { duration: DURATION }
    )
  }, [])

  return null
}
