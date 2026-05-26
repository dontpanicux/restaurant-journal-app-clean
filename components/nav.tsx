'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavProps {
  user?: {
    id: string
    email?: string
  } | null
  fullName?: string | null
}

export function Nav({ user, fullName }: NavProps) {
  const router = useRouter()
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Restaurant Journal
        </Link>

        {user ? (
          <nav className="flex items-center gap-6">
            <Link href="/journal" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              My Journal
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 outline-none cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{fullName ?? 'Account'}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <nav className="flex items-center gap-4">
            <Link
              href="/auth"
              className="h-12 px-6 flex items-center rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth?tab=signup"
              className="h-12 px-6 flex items-center rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: '#2d1b14' }}
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
