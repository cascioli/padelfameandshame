'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'signin' | 'register' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  function reset() {
    setError('')
    setPassword('')
    setConfirm('')
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    // If email confirmation is disabled in Supabase, user is logged in immediately
    router.push('/')
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setMagicSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🎾</div>
        <h1 className="text-2xl font-black tracking-tight">
          Padel Hall of<br />
          <span className="text-primary">Fame & Shame</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Your club's post-match ritual.</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        {/* Mode tabs */}
        {!magicSent && (
          <div className="flex bg-secondary rounded-lg p-1 gap-1">
            {(['signin', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); reset() }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {/* Magic link sent state */}
        {magicSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="text-4xl">📬</div>
            <h2 className="text-lg font-bold">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
              Magic link sent to <span className="text-foreground font-medium">{email}</span>
            </p>
            <button
              onClick={() => { setMagicSent(false); setMode('signin'); setEmail('') }}
              className="text-xs text-muted-foreground underline"
            >
              Back to sign in
            </button>
          </div>

        ) : mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
              {loading ? 'Sending...' : '✉️ Send Magic Link'}
            </Button>
            <button
              type="button"
              onClick={() => { setMode('signin'); reset() }}
              className="w-full text-xs text-muted-foreground underline"
            >
              Back to password sign in
            </button>
          </form>

        ) : mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
              {loading ? 'Signing in...' : '🎾 Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => { setMode('magic'); reset() }}
              className="w-full text-xs text-muted-foreground underline"
            >
              Forgot password? Use magic link instead
            </button>
          </form>

        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
              <Input
                type="password"
                placeholder="min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
              {loading ? 'Creating account...' : '🚀 Create Account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
