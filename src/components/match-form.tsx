'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayerSearch } from '@/components/player-search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile, Vibe } from '@/lib/supabase/types'

const VIBES: { value: Vibe; label: string; emoji: string }[] = [
  { value: 'epic', label: 'Epic', emoji: '⚡' },
  { value: 'roast', label: 'Roast', emoji: '🔥' },
  { value: 'friendly', label: 'Friendly', emoji: '🤝' },
]

export function MatchForm() {
  const router = useRouter()
  const [winners, setWinners] = useState<[Profile | null, Profile | null]>([null, null])
  const [losers, setLosers] = useState<[Profile | null, Profile | null]>([null, null])
  const [score, setScore] = useState('')
  const [vibe, setVibe] = useState<Vibe>('friendly')
  const [beerDebtorId, setBeerDebtorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allPlayers = [...winners, ...losers].filter(Boolean) as Profile[]
  const allIds = allPlayers.map(p => p.id)
  const allSelected = winners[0] && winners[1] && losers[0] && losers[1]
  const canSubmit = allSelected && score.trim() && beerDebtorId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_ids: winners.map(p => p!.id),
          loser_ids: losers.map(p => p!.id),
          score: score.trim(),
          beer_debtor_id: beerDebtorId,
          vibe,
        }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to log match')
      }
      const { matchId } = await res.json()
      router.push(`/match/${matchId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Winners */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest">🏆 Winners</h2>
        <PlayerSearch
          label="Search winner 1..."
          value={winners[0]}
          onChange={v => setWinners([v, winners[1]])}
          exclude={allIds.filter(id => id !== winners[0]?.id)}
        />
        <PlayerSearch
          label="Search winner 2..."
          value={winners[1]}
          onChange={v => setWinners([winners[0], v])}
          exclude={allIds.filter(id => id !== winners[1]?.id)}
        />
      </section>

      {/* Losers */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold text-destructive uppercase tracking-widest">💀 Losers</h2>
        <PlayerSearch
          label="Search loser 1..."
          value={losers[0]}
          onChange={v => setLosers([v, losers[1]])}
          exclude={allIds.filter(id => id !== losers[0]?.id)}
        />
        <PlayerSearch
          label="Search loser 2..."
          value={losers[1]}
          onChange={v => setLosers([losers[0], v])}
          exclude={allIds.filter(id => id !== losers[1]?.id)}
        />
      </section>

      {/* Score */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</h2>
        <Input
          placeholder="e.g. 6-2, 6-4"
          value={score}
          onChange={e => setScore(e.target.value)}
        />
      </section>

      {/* Vibe */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vibe</h2>
        <div className="grid grid-cols-3 gap-2">
          {VIBES.map(v => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVibe(v.value)}
              className={`py-3 rounded-lg text-sm font-semibold transition-all ${
                vibe === v.value
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* Beer Debtor */}
      {allSelected && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">🍺 Beer Debtor</h2>
          <p className="text-xs text-muted-foreground">Who pays the round?</p>
          <div className="grid grid-cols-2 gap-2">
            {allPlayers.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => setBeerDebtorId(player.id)}
                className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all text-left ${
                  beerDebtorId === player.id
                    ? 'bg-amber-400 text-black ring-2 ring-amber-400 ring-offset-1 ring-offset-background'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                }`}
              >
                @{player.username}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && (
        <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base font-bold"
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⚡</span> Generating Chronicle...
          </span>
        ) : (
          '⚡ Log Match'
        )}
      </Button>
    </form>
  )
}
