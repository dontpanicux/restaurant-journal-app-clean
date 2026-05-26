# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack restaurant journaling app. Users create accounts and log restaurant visits with ratings, photos, and notes.

- **Figma design**: fileKey `SoRaHSV8Y2olzLbAkQ6GD8`
- **Dev server**: `npm run dev` → http://localhost:3000
- **No git repo yet** — `git init`, GitHub, and Vercel deployment are taught live in a course session

## Commands

```bash
npm run dev       # Start dev server on :3000
npm run build     # Production build
npm run start     # Run production server (after build)
npm run lint      # ESLint (eslint-config-next)

# Regenerate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id dfacojfrqusypytmdxju > lib/database.types.ts
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (base-ui v4) |
| Backend | Supabase (Auth, Postgres, Storage, RLS) |
| Fonts | Playfair Display (headings) + Inter (body) |

## Supabase

- **Project ref**: `dfacojfrqusypytmdxju` (region: us-west-1)
- **Tables**: `profiles`, `journal_entries`, `entry_photos`
- **Storage bucket**: `journal-photos` (private, path: `{userId}/{entryId}/{filename}`)
- **RLS**: enabled on all tables, users own their data via `auth.uid() = user_id`
- **Env vars** in `.env.local` (covered by `.gitignore`)

## Architecture

### Auth flow (two layers)

1. **`proxy.ts`** — runs as Next.js middleware, refreshes the Supabase session cookie on every request and redirects unauthenticated users away from `/journal/**`.
2. **`app/journal/layout.tsx`** — Server Component double-check; redirects to `/auth` if no user. This is the authoritative guard; `proxy.ts` handles cookie refresh and is the first-pass redirect.
3. **`app/auth/callback/route.ts`** — handles the email confirmation redirect; calls `exchangeCodeForSession(code)` then redirects to `/journal`.

### Server vs. client pages

- **Server Components** (async, `createClient` from `lib/supabase/server.ts`): `app/journal/page.tsx`, `app/journal/[id]/page.tsx`. Data is fetched at render time, signed photo URLs are generated here and passed as props.
- **Client Components** (`'use client'`, `createClient` from `lib/supabase/client.ts`): `app/journal/new/page.tsx`, `app/journal/[id]/edit/page.tsx`. These use local state + `supabase` directly for form submission and photo upload.

### Signed photo URLs

Photos are stored privately in `journal-photos`. Signed URLs (1-hour expiry) are generated server-side via `supabase.storage.from('journal-photos').createSignedUrl(path, 3600)` and passed as props — never generate them client-side.

### Fonts

Applied as CSS variables via `app/layout.tsx`. `globals.css` maps `--font-heading: var(--font-playfair)` in `@theme inline`, so use the `font-heading` Tailwind class for non-heading elements. `h1`, `h2`, `h3` inherit Playfair automatically via `@layer base`.

### Dark mode

`@custom-variant dark` is declared in `globals.css` but no dark-mode CSS variables are defined — the app is light-mode only.

## Next.js 16 Gotchas

- **Auth proxy**: `proxy.ts` (not `middleware.ts`) with `export async function proxy()`
- **Async params**: `params` and `searchParams` in page components are `Promise<{...}>` and must be awaited before use. Client Components use `useParams()` hook instead.
- **No `asChild`**: shadcn v4 uses `@base-ui/react`, which dropped the Radix `asChild` prop. Use `buttonVariants` directly on `<Link>` instead:
  ```tsx
  <Link href="..." className={buttonVariants({ variant: 'outline' })}>...</Link>
  ```
- **Select onChange**: `onValueChange` receives `(value: string | null, ...) => void`
- **Post-mutation navigation in Client Components**: Use `window.location.href` (not `router.push`) when navigating to a Server Component page after a mutation — `router.push` does a client-side transition that won't re-run the Server Component's data fetching. The edit page uses this pattern after saving.
- **Date parsing timezone**: Parse `YYYY-MM-DD` strings as `new Date(date + 'T00:00:00')` to force local-timezone interpretation; omitting the time suffix causes UTC midnight to shift to the prior day in negative-offset timezones.

## Data patterns

- **Photo uploads**: Sequential (not parallel) — each file is uploaded to storage then an `entry_photos` row is inserted before the next. Path: `{userId}/{entryId}/{index}.{ext}`. Edit page appends starting from `existingPhotoCount`; there is no UI to delete existing photos.
- **Nav props**: `<Nav>` is a Client Component. Pass `user` and `fullName` props (fetched server-side) to show the authenticated avatar/dropdown. Omitting both renders the unauthenticated login/signup state.
- **Exported types**: `lib/database.types.ts` exports `JournalEntry`, `EntryPhoto`, and `Profile` convenience aliases at the bottom — prefer these over the verbose `Tables<'...'>` generic.

## Routes

| Route | Access | Component type | Description |
|---|---|---|---|
| `/` | Public | Server | Landing page |
| `/auth` | Public | Client | Login / Sign Up (tab param: `?tab=signup`) |
| `/journal` | Protected | Server | My Journal dashboard |
| `/journal/new` | Protected | Client | New entry form |
| `/journal/[id]` | Protected | Server | Entry detail (`?new=1` shows success toast) |
| `/journal/[id]/edit` | Protected | Client | Edit existing entry |

## Key Files

```
proxy.ts                        # Auth guard + cookie refresh (Next.js 16 middleware)
app/journal/layout.tsx          # Server-side auth double-check for all /journal routes
app/auth/callback/route.ts      # Email confirmation handler
lib/supabase/client.ts          # Browser Supabase client (use in 'use client' components)
lib/supabase/server.ts          # Server Component Supabase client (use in async Server Components)
lib/database.types.ts           # Generated Supabase types — do not edit manually
components/nav.tsx              # Top nav (auth state, avatar dropdown, logout)
components/journal-card.tsx     # Entry card for journal grid
components/journal-grid.tsx     # Grid layout rendering JournalCard items
components/star-rating.tsx      # Interactive (onChange) + read-only (readonly prop) star rating
components/photo-upload.tsx     # Drag-and-drop / click-to-upload photo input
components/price-range-picker.tsx  # $ / $$ / $$$ / $$$$ toggle
components/return-radio.tsx     # Yes / Maybe / No radio buttons
components/entry-success-toast.tsx  # Custom sonner toast; rendered on /journal/[id] when ?new=1; fires once via useRef guard
components/footer.tsx           # Site footer
lib/utils.ts                    # cn() helper (clsx + tailwind-merge)
```
