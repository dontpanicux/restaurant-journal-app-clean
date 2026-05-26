'use client'

import { useState, useMemo } from 'react'
import { JournalCard } from './journal-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { JournalEntry } from '@/lib/database.types'

interface JournalGridProps {
  entries: JournalEntry[]
  photoUrlMap: Record<string, string>
}

export function JournalGrid({ entries, photoUrlMap }: JournalGridProps) {
  const [search, setSearch] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('all')

  const cuisines = useMemo(() => {
    const set = new Set(entries.map((e) => e.cuisine_type).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch = search
        ? e.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
          (e.location ?? '').toLowerCase().includes(search.toLowerCase())
        : true
      const matchesCuisine = cuisineFilter !== 'all' ? e.cuisine_type === cuisineFilter : true
      return matchesSearch && matchesCuisine
    })
  }, [entries, search, cuisineFilter])

  return (
    <>
      {/* Title bar */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-3">
          <h1
            className="text-5xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            My Journal Entries
          </h1>
          <div className="inline-flex">
            <span className="bg-card border border-border text-primary text-xs font-bold px-3 py-1.5 rounded-full">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-4">
          <div className="relative w-[180px]">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 bg-card"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <Select value={cuisineFilter} onValueChange={(v) => setCuisineFilter(v ?? 'all')}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Cuisine: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cuisine: All</SelectItem>
              {cuisines.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No entries match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {filtered.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              photoUrl={photoUrlMap[entry.id] ?? null}
            />
          ))}
        </div>
      )}
    </>
  )
}
