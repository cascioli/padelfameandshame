'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">🎾</div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Padel Hall of<br />
          <span className="text-primary">Fame & Shame</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Your club's post-match ritual.</p>
      </div>

      {sent ? (
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">📬</div>
          <h2 className="text-lg font-bold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            Magic link sent to <span className="text-foreground font-medium">{email}</span>
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="text-xs text-muted-foreground underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
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
          <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
            {loading ? 'Sending...' : '✉️ Send Magic Link'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No password. No hassle. Just padel.
          </p>
        </form>
      )}
    </div>
  )
}
