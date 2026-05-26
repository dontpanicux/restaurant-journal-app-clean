import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { JournalGrid } from '@/components/journal-grid'
import { Plus, Settings } from 'lucide-react'
import type { EntryPhoto } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: entries }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hasEntries = entries && entries.length > 0

  // Fetch first photo for each entry
  const entryIds = entries?.map((e) => e.id) ?? []
  const photosResult = entryIds.length
    ? await supabase.from('entry_photos').select('*').in('entry_id', entryIds).eq('display_order', 0)
    : { data: [] as EntryPhoto[] }

  const photos = (photosResult.data ?? []) as EntryPhoto[]

  const photoUrlMap: Record<string, string> = {}
  for (const photo of photos) {
    const { data } = await supabase.storage
      .from('journal-photos')
      .createSignedUrl(photo.storage_path, 3600)
    if (data) photoUrlMap[photo.entry_id] = data.signedUrl
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} fullName={profile?.full_name} />

      {/* Welcome banner — only when entries exist */}
      {hasEntries && (
        <div className="bg-card border-b border-border px-16 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span
              className="text-[18px] text-foreground"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              🍽️ Welcome back, {firstName}!
            </span>
            <Link
              href="/journal/new"
              className="text-[18px] font-bold text-primary underline underline-offset-2"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Log your next meal
            </Link>
          </div>
          <Settings className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>
      )}

      <main className="flex-1">
        {/* Empty state */}
        {!hasEntries ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p
              className="text-2xl text-muted-foreground"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              You haven&apos;t added any entries yet
            </p>
            <Link href="/journal/new">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md cursor-pointer">
                <Plus className="w-7 h-7 text-white" />
              </div>
            </Link>
            <Link href="/journal/new" className="text-sm text-primary hover:underline">
              Add your first restaurant
            </Link>
          </div>
        ) : (
          <div className="px-16 pt-12 pb-24 flex flex-col gap-12">
            <JournalGrid entries={entries} photoUrlMap={photoUrlMap} />
          </div>
        )}
      </main>

      <Footer />

      {/* FAB — dark pill */}
      {hasEntries && (
        <Link
          href="/journal/new"
          className="fixed bottom-10 right-10 bg-foreground text-background flex items-center gap-3 px-6 py-4 rounded-full shadow-lg hover:bg-foreground/90 transition-colors font-semibold text-sm"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </Link>
      )}
    </div>
  )
}
