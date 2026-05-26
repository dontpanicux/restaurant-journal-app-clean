import Link from 'next/link'
import { StarRating } from './star-rating'
import { formatDistanceToNow } from 'date-fns'
import type { JournalEntry } from '@/lib/database.types'

interface JournalCardProps {
  entry: JournalEntry
  photoUrl?: string | null
}

export function JournalCard({ entry, photoUrl }: JournalCardProps) {
  const timeAgo = entry.created_at
    ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })
    : ''

  return (
    <Link href={`/journal/${entry.id}`} className="block group">
      <div className="bg-card border border-border rounded-2xl h-[240px] flex overflow-hidden hover:shadow-md transition-shadow">
        {/* Photo */}
        <div className="w-[240px] shrink-0 overflow-hidden">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={entry.restaurant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            {entry.cuisine_type && (
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {entry.cuisine_type}
              </p>
            )}
            <h3
              className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {entry.restaurant_name}
            </h3>
            {entry.location && (
              <p className="text-[13px] text-muted-foreground">{entry.location}</p>
            )}
            <div className="flex items-center gap-2">
              <StarRating value={entry.rating} readonly size="sm" />
              {timeAgo && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </>
              )}
            </div>
          </div>

          {entry.highlights && (
            <p
              className="text-[15px] text-foreground leading-[1.4] line-clamp-2 overflow-hidden text-ellipsis"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              &ldquo;{entry.highlights}&rdquo;
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
