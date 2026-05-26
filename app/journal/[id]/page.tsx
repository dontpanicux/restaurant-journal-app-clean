import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { StarRating } from '@/components/star-rating'
import { EntrySuccessToast } from '@/components/entry-success-toast'
import { ChevronLeft, Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { EntryPhoto } from '@/lib/database.types'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}

export default async function EntryDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { new: isNew } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [entryResult, photosResult, profileResult] = await Promise.all([
    supabase.from('journal_entries').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('entry_photos').select('*').eq('entry_id', id).order('display_order'),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const entry = entryResult.data
  const photos: EntryPhoto[] = (photosResult.data ?? []) as EntryPhoto[]
  const profile = profileResult.data

  if (!entry) notFound()

  // Build signed URLs
  const signedUrls: string[] = []
  for (const photo of photos) {
    const { data } = await supabase.storage
      .from('journal-photos')
      .createSignedUrl(photo.storage_path, 3600)
    if (data) signedUrls.push(data.signedUrl)
  }

  const wouldReturnMap: Record<string, string> = { yes: 'Yes, definitely', maybe: 'Maybe', no: 'No' }
  const wouldReturnLabel = (entry.would_return ? wouldReturnMap[entry.would_return] : null) ?? '—'

  const formattedDate = entry.date_of_visit
    ? new Date(entry.date_of_visit + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} fullName={profile?.full_name} />
      {isNew && <EntrySuccessToast />}

      <main className="flex-1 py-12">
        <div className="max-w-[900px] mx-auto px-8 flex flex-col gap-10">

          {/* Breadcrumb */}
          <Link href="/journal" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit transition-colors">
            <ChevronLeft className="w-4 h-4" />
            My Journal / {entry.restaurant_name}
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-2">
            {entry.cuisine_type && (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {entry.cuisine_type}
              </p>
            )}
            <div className="flex items-center gap-3">
              <h1
                className="text-5xl font-bold leading-[1.1] text-foreground"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {entry.restaurant_name}
              </h1>
              {isNew && (
                <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Photos */}
          {signedUrls.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">Photos</p>
              {/* Hero */}
              <div className="w-full h-[450px] rounded-3xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={signedUrls[0]}
                  alt={entry.restaurant_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails */}
              {signedUrls.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {signedUrls.slice(1, 4).map((url, i) => (
                    <div key={i} className="h-[180px] rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Two-column: content + sidebar */}
          <div className="flex gap-16 items-start">

            {/* Left: Overview + Highlights */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">

              {/* Overview card */}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-foreground">Overview</p>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between gap-4">
                  {/* Rating */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">Overall Rating</p>
                    <StarRating value={entry.rating} readonly size="md" />
                  </div>

                  {entry.location && (
                    <>
                      <div className="w-px h-10 bg-border shrink-0" />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">{entry.location}</p>
                      </div>
                    </>
                  )}

                  {entry.price_range && (
                    <>
                      <div className="w-px h-10 bg-border shrink-0" />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">Price Range</p>
                        <p className="text-sm font-medium text-foreground">{entry.price_range}</p>
                      </div>
                    </>
                  )}

                  {entry.would_return && (
                    <>
                      <div className="w-px h-10 bg-border shrink-0" />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">Would return?</p>
                        <div className="flex items-center gap-1">
                          {entry.would_return === 'yes' && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                          )}
                          <p className={cn(
                            'text-sm font-semibold',
                            entry.would_return === 'yes' && 'text-emerald-600',
                            entry.would_return === 'maybe' && 'text-amber-600',
                            entry.would_return === 'no' && 'text-destructive',
                          )}>
                            {wouldReturnLabel}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Highlights card */}
              {entry.highlights && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm font-semibold text-foreground">Review Highlights</p>
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <p className="text-sm italic leading-relaxed text-foreground">
                      &ldquo;{entry.highlights}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-[240px] shrink-0 flex flex-col gap-6">
              {entry.cuisine_type && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">Cuisine Type</p>
                  <p className="text-sm font-semibold text-foreground">{entry.cuisine_type}</p>
                </div>
              )}

              {formattedDate && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">Visited On</p>
                  <p className="text-sm text-foreground">{formattedDate}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href={`/journal/${id}/edit`}
                  className={cn(buttonVariants(), 'w-full justify-center')}
                >
                  Edit Entry
                </Link>
                <Link
                  href="/journal"
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
                >
                  Back to Journal
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
