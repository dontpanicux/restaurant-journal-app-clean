# Google OAuth Sign-In (saved for later)

This documents the "Continue with Google" feature that was added to `app/auth/page.tsx`
and later removed. The full original change is also preserved in git history at commit
**`c7e6aa1`** (`feat: add Google OAuth sign-in to auth page`).

To restore: either `git show c7e6aa1` / cherry-pick it, or paste the three snippets below
back into `app/auth/page.tsx`, then complete the provider setup checklist.

---

## Code

### 1. Handler — add inside `AuthForm`, just above `handleSignup`

```tsx
async function handleGoogle() {
  setLoading(true)
  setError('')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  // On success the browser is redirected to Google, so we only handle errors here.
  if (error) {
    setError(error.message)
    setLoading(false)
  }
}
```

### 2. Button + divider — add inside the card, just above `{/* Login form */}`

Shared by both tabs (button label switches on `tab`).

```tsx
{/* Continue with Google (shared by both tabs) */}
<div className="flex flex-col gap-5">
  <Button
    type="button"
    variant="outline"
    onClick={handleGoogle}
    disabled={loading}
    className="w-full h-12 text-sm font-semibold rounded-lg gap-2.5 border-border"
  >
    <GoogleIcon className="w-5 h-5" />
    {tab === 'login' ? 'Log in with Google' : 'Sign up with Google'}
  </Button>

  <div className="flex items-center gap-4">
    <div className="h-px flex-1 bg-border" />
    <span className="text-xs font-medium text-muted-foreground">or</span>
    <div className="h-px flex-1 bg-border" />
  </div>
</div>
```

### 3. Icon — add at module scope (e.g. next to the `Field` component)

```tsx
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
```

No extra imports are needed — `Button` is already imported and `GoogleIcon` is local.
The existing `app/auth/callback/route.ts` already handles the OAuth code exchange
(`exchangeCodeForSession`), so no callback changes are required.

---

## Re-enable checklist (the parts outside the code)

1. **Google Cloud Console**
   - Create/select a project → **APIs & Services → Credentials → Create OAuth client ID** (Web application).
   - Add Authorized redirect URI: `https://dfacojfrqusypytmdxju.supabase.co/auth/v1/callback`
   - Configure the **OAuth consent screen** (app name, support + developer email). Add test users while in Testing, or **Publish** the app for anyone.
   - Copy the **Client ID** and **Client Secret**.

2. **Supabase** → Authentication → Providers → **Google** → enable → paste Client ID + Secret → Save.

3. **Supabase** → Authentication → **URL Configuration** → ensure **Redirect URLs** allow each origin the app runs on:
   - `http://localhost:3000/**`
   - `https://restaurant-journal-app-clean.vercel.app/**`
   - (optional, for preview deploys) `https://restaurant-journal-app-clean-*.vercel.app/**`

   The Google → Supabase redirect URI (`.../auth/v1/callback`) is the **same** for local and
   production — only Supabase's redirect allowlist needs each app origin.

4. Sign-ins populate `profiles.full_name` via the existing `handle_new_user` trigger
   (Supabase includes `full_name` in Google user metadata).
</content>
</invoke>
