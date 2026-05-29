'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}

function AuthForm() {
  const searchParams = useSearchParams()

  const status = searchParams.get('status')
  const pendingEmail = searchParams.get('email') ?? ''
  const callbackError = searchParams.get('error') ?? ''
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  const [tab, setTab] = useState(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(callbackError)

  const supabase = createClient()

  useEffect(() => {
    setError('')
  }, [tab])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email before logging in. Check your inbox for a verification link.')
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      window.location.href = '/journal'
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user && !data.user.email_confirmed_at) {
      window.location.href = `/auth?status=check-email&email=${encodeURIComponent(email)}`
    } else {
      window.location.href = '/journal'
    }
  }

  const header = (
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-16 h-[88px] flex items-center">
        <Link href="/" className="font-bold text-2xl text-foreground" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Restaurant Journal
        </Link>
      </div>
    </header>
  )

  const footer = (
    <footer className="border-t border-border py-12">
      <p className="text-center text-[13px] text-muted-foreground">
        © 2026 Restaurant Journal. Savor every memory.
      </p>
    </footer>
  )

  if (status === 'check-email') {
    return (
      <div className="min-h-screen flex flex-col">
        {header}
        <main className="flex-1 flex items-start justify-center py-[120px] px-4">
          <div
            className="w-[480px] bg-card border border-border rounded-3xl p-12 flex flex-col gap-8"
            style={{ boxShadow: '0px 12px 20px rgba(45,27,20,0.05)' }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to{' '}
                <strong className="text-foreground">{pendingEmail}</strong>.
                Click it to activate your account and start your journal.
              </p>
              <Link href="/auth" className="text-sm text-primary hover:underline font-medium">
                Back to log in
              </Link>
            </div>
          </div>
        </main>
        {footer}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {header}

      <main className="flex-1 flex items-start justify-center py-[120px] px-4">
        <div
          className="w-[480px] bg-card border border-border rounded-3xl p-12 flex flex-col gap-8"
          style={{ boxShadow: '0px 12px 20px rgba(45,27,20,0.05)' }}
        >
          {/* Custom tab bar */}
          <div className="flex gap-6 w-full">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 flex flex-col gap-2 items-start"
              >
                <span className={cn(
                  'text-base w-full text-center',
                  tab === t ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
                )}>
                  {t === 'login' ? 'Log in' : 'Create an account'}
                </span>
                <div className={cn(
                  'h-0.5 w-full rounded-sm',
                  tab === t ? 'bg-primary' : 'bg-border'
                )} />
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-[15px] border-border"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-[15px] border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              <p className="text-sm font-semibold text-primary text-right -mt-2 cursor-pointer hover:underline">
                Forgot password?
              </p>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full h-12 text-sm font-semibold rounded-lg" disabled={loading}>
                {loading ? 'Signing in…' : 'Log In'}
              </Button>
            </form>
          )}

          {/* Signup form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <Field label="Full Name">
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 text-[15px] border-border"
                />
              </Field>

              <Field label="Email Address">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-[15px] border-border"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 text-[15px] border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password">
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 text-[15px] border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </Field>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full h-12 text-sm font-semibold rounded-lg" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </main>

      {footer}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-semibold text-foreground">{label}</label>
      {children}
    </div>
  )
}
