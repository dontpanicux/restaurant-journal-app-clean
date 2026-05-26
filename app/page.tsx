import Link from 'next/link'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import { Star, CalendarDays, Map } from 'lucide-react'

const FOOD_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', alt: 'Pancakes' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=500&fit=crop', alt: 'Fine dining' },
  { src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=500&fit=crop', alt: 'Fresh salad' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=500&fit=crop', alt: 'Colorful dish' },
  { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=500&fit=crop', alt: 'Pizza' },
  { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=500&fit=crop', alt: 'Restaurant' },
]

const FEATURES = [
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Keep track of the flavors that defined your evening.',
  },
  {
    icon: CalendarDays,
    title: 'Track Visits',
    description: 'Remember exactly when you discovered that hidden gem.',
  },
  {
    icon: Map,
    title: 'Build Your Food Map',
    description: 'A personal catalog of your culinary adventures.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center gap-16 py-16">

          {/* Text + CTA block */}
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-4 max-w-[800px] px-8">
              {/* Cutlery icon — exported from Figma node 6:109 */}
              <div className="w-20 h-20 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/dining-icon.svg" alt="Dining icon" width={60} height={60} />
              </div>

              {/* Heading */}
              <h1
                className="text-[64px] font-bold text-center leading-[1.1] text-foreground"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Your dining story<br />starts here
              </h1>

              {/* Subtitle */}
              <p className="text-[18px] text-muted-foreground text-center leading-[1.6]">
                Log every meal, savor every memory. Sign in to start your restaurant journal.
              </p>
            </div>

            {/* CTA */}
            <Link
              href={user ? '/journal' : '/auth'}
              className="h-12 px-6 flex items-center rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: '#bc592d' }}
            >
              {user ? 'Go to My Journal' : 'Log In To Get Started'}
            </Link>
          </div>

          {/* Photo grid — 3 cols mobile, 6 cols desktop, rounded corners */}
          <div className="w-full px-16">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 rounded-2xl overflow-hidden">
              {FOOD_PHOTOS.map((photo) => (
                <div key={photo.src} className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          <div className="w-full px-16 grid grid-cols-3 gap-8 pb-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-5"
              >
                <feature.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                <div className="flex flex-col gap-2">
                  <h3
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-[14px] text-muted-foreground leading-[1.5]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
