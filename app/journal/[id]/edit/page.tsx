'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [restaurantName, setRestaurantName] = useState('')
  const [location, setLocation] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [dateOfVisit, setDateOfVisit] = useState('')
  const [rating, setRating] = useState(0)
  const [priceRange, setPriceRange] = useState('')
  const [highlights, setHighlights] = useState('')
  const [wouldReturn, setWouldReturn] = useState('yes')
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setRestaurantName(data.restaurant_name)
        setLocation(data.location ?? '')
        setCuisineType(data.cuisine_type ?? '')
        setDateOfVisit(data.date_of_visit ?? '')
        setRating(data.rating)
        setPriceRange(data.price_range ?? '')
        setHighlights(data.highlights ?? '')
        setWouldReturn(data.would_return ?? 'yes')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      toast.error('Please add a rating before saving.')
      return
    }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const { error } = await supabase
      .from('journal_entries')
      .update({
        restaurant_name: restaurantName,
        location: location || null,
        cuisine_type: cuisineType || null,
        date_of_visit: dateOfVisit || null,
        rating,
        price_range: priceRange || null,
        highlights: highlights || null,
        would_return: wouldReturn,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to save changes. Please try again.')
      setSaving(false)
      return
    }

    // Upload any new photos
    const existingPhotoCount = await supabase
      .from('entry_photos')
      .select('id', { count: 'exact' })
      .eq('entry_id', id)
      .then(r => r.count ?? 0)

    for (let i = 0; i < newPhotos.length; i++) {
      const file = newPhotos[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${id}/${existingPhotoCount + i}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('journal-photos')
        .upload(path, file)

      if (!uploadError) {
        await supabase.from('entry_photos').insert({
          entry_id: id,
          storage_path: path,
          display_order: existingPhotoCount + i,
        })
      }
    }

    toast.success('Entry updated!')
    window.location.href = `/journal/${id}`
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link href={`/journal/${id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 w-fit">
          <ChevronLeft className="w-4 h-4" />
          My Journal / {restaurantName}
        </Link>

        <h1
          className="text-4xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Edit Entry
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
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

            <div className="space-y-1.5">
              <Label htmlFor="date-of-visit">Date of Visit</Label>
              <Input
                id="date-of-visit"
                type="date"
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Overall Rating <span className="text-destructive">*</span></Label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <div className="space-y-1.5">
              <Label>Price Range</Label>
              <PriceRangePicker value={priceRange} onChange={setPriceRange} />
            </div>

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

            <div className="space-y-1.5">
              <Label>Would you return?</Label>
              <ReturnRadio value={wouldReturn} onChange={setWouldReturn} />
            </div>

            <div className="space-y-1.5">
              <Label>Add More Photos</Label>
              <PhotoUpload files={newPhotos} onChange={setNewPhotos} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href={`/journal/${id}`} className={buttonVariants({ variant: 'ghost' })}>
                Cancel
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
