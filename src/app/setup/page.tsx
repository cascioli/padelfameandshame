'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SetupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters (a-z, 0-9, _)')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .maybeSingle()

    if (existing) {
      setError('Username taken. Try another.')
      setLoading(false)
      return
    }

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      username: trimmed,
    })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">🏓</div>
        <h1 className="text-2xl font-black">Pick your username</h1>
        <p className="mt-2 text-sm text-muted-foreground">This is how the club will know you.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-base">@</span>
            <Input
              placeholder="padel_king"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="pl-8 h-12 text-base"
              maxLength={20}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">Letters, numbers, underscores. 3–20 chars.</p>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full h-12 font-bold text-base" disabled={loading}>
          {loading ? 'Setting up...' : '🚀 Let\'s Play'}
        </Button>
      </form>
    </div>
  )
}
