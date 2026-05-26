'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { StarRating } from '@/components/star-rating'
import { PriceRangePicker } from '@/components/price-range-picker'
import { ReturnRadio } from '@/components/return-radio'
import { PhotoUpload } from '@/components/photo-upload'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

const CUISINES = [
  'American', 'Italian', 'Japanese', 'Chinese', 'Mexican', 'French', 'Thai',
  'Indian', 'Mediterranean', 'Korean', 'Spanish', 'Greek', 'Middle Eastern',
  'Vietnamese', 'Peruvian', 'Seafood', 'Steakhouse', 'Pizza', 'Bakery', 'Other',
]

export default function NewEntryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [restaurantName, setRestaurantName] = useState('')
  const [location, setLocation] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [dateOfVisit, setDateOfVisit] = useState('')
  const [rating, setRating] = useState(0)
  const [priceRange, setPriceRange] = useState('')
  const [highlights, setHighlights] = useState('')
  const [wouldReturn, setWouldReturn] = useState('yes')
  const [photos, setPhotos] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      toast.error('Please add a rating before saving.')
      return
    }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        restaurant_name: restaurantName,
        location: location || null,
        cuisine_type: cuisineType || null,
        date_of_visit: dateOfVisit || null,
        rating,
        price_range: priceRange || null,
        highlights: highlights || null,
        would_return: wouldReturn,
      })
      .select()
      .single()

    if (error || !entry) {
      toast.error('Failed to save entry. Please try again.')
      setSaving(false)
      return
    }

    // Upload photos
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${entry.id}/${i}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('journal-photos')
        .upload(path, file)

      if (!uploadError) {
        await supabase.from('entry_photos').insert({
          entry_id: entry.id,
          storage_path: path,
          display_order: i,
        })
      }
    }

    router.push(`/journal/${entry.id}?new=1`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <Link href="/journal" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" />
          My Journal / New Entry
        </Link>

        <h1
          className="text-4xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Log a New Restaurant
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            {/* Restaurant name */}
            <div className="space-y-1.5">
              <Label htmlFor="restaurant-name">Restaurant Name <span className="text-destructive">*</span></Label>
              <Input
                id="restaurant-name"
                placeholder="e.g. Tartine Manufactory"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>

            {/* Location + Cuisine */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location / City</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cuisine Type</Label>
                <Select value={cuisineType} onValueChange={(v) => setCuisineType(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date of visit */}
            <div className="space-y-1.5">
              <Label htmlFor="date-of-visit">Date of Visit</Label>
              <Input
                id="date-of-visit"
                type="date"
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
              />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label>Overall Rating <span className="text-destructive">*</span></Label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Price range */}
            <div className="space-y-1.5">
              <Label>Price Range</Label>
              <PriceRangePicker value={priceRange} onChange={setPriceRange} />
            </div>

            {/* Highlights */}
            <div className="space-y-1.5">
              <Label htmlFor="highlights">Highlights</Label>
              <Textarea
                id="highlights"
                placeholder="What stood out? Describe the dishes, ambiance, service…"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Would return */}
            <div className="space-y-1.5">
              <Label>Would you return?</Label>
              <ReturnRadio value={wouldReturn} onChange={setWouldReturn} />
            </div>

            {/* Photos */}
            <div className="space-y-1.5">
              <Label>Upload Photos</Label>
              <PhotoUpload files={photos} onChange={setPhotos} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/journal" className={buttonVariants({ variant: 'ghost' })}>
                Cancel
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
