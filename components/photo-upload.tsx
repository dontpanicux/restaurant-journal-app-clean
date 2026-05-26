'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function PhotoUpload({ files, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const previews = files.map((f) => URL.createObjectURL(f))

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return
    const accepted = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
    onChange([...files, ...accepted])
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'
        )}
      >
        <Camera className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drag photos here or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
