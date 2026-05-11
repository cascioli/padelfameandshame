import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/supabase/types'

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: match }, { data: me }] = await Promise.all([
    supabase.from('matches').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id').eq('id', user.id).maybeSingle(),
  ])

  if (!match) notFound()
  if (!me) redirect('/setup')

  const allIds = [...new Set([...match.winner_ids, ...match.loser_ids, match.beer_debtor_id])]
  const { data: players } = await supabase
    .from('profiles')
    .select('id, username, karma, wins, losses')
    .in('id', allIds)

  const nameMap = Object.fromEntries((players ?? []).map((p: Pick<Profile, 'id' | 'username'>) => [p.id, p.username]))
  const beerDebtor = players?.find(p => p.id === match.beer_debtor_id)

  const winnerNames = match.winner_ids.map((id: string) => nameMap[id] ?? '?').join(' & ')
  const loserNames = match.loser_ids.map((id: string) => nameMap[id] ?? '?').join(' & ')
  const date = new Date(match.created_at).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  const cardUrl = beerDebtor ? `/api/card/${beerDebtor.id}` : null
  const shareText = match.chronicle_text
    ? `${match.chronicle_text}\n\nPadel Hall of Fame & Shame`
    : `${winnerNames} beat ${loserNames} ${match.score} 🎾`

  const vibeMap: Record<string, string> = { epic: '⚡ Epic', roast: '🔥 Roast', friendly: '🤝 Friendly' }
  const vibeColors: Record<string, string> = {
    epic: 'text-primary',
    roast: 'text-orange-400',
    friendly: 'text-blue-400',
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">← Back</Link>
          <h1 className="font-black text-base">Match Chronicle</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Score card */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold ${vibeColors[match.vibe] ?? ''}`}>
              {vibeMap[match.vibe]}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Winners 🏆</p>
              <p className="font-black text-primary text-lg leading-tight">{winnerNames}</p>
            </div>
            <div className="text-3xl font-black text-foreground shrink-0">{match.score}</div>
            <div className="flex-1 text-right">
              <p className="text-xs text-muted-foreground mb-1">Losers 💀</p>
              <p className="font-bold text-muted-foreground text-lg leading-tight">{loserNames}</p>
            </div>
          </div>

          {match.chronicle_text && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-bold">Chronicle</p>
              <p className="text-base leading-relaxed text-foreground/90 italic">{match.chronicle_text}</p>
            </div>
          )}
        </div>

        {/* Beer shame */}
        {beerDebtor && (
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍺</span>
              <div>
                <p className="font-black text-amber-400">@{beerDebtor.username} owes the round!</p>
                <p className="text-xs text-muted-foreground">Beer Debtor of the day</p>
              </div>
            </div>

            {/* Trading card preview */}
            {cardUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Trading Card</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cardUrl}
                  alt={`${beerDebtor.username}'s trading card`}
                  className="rounded-lg w-full max-w-[200px] mx-auto block border border-border"
                />
              </div>
            )}
          </div>
        )}

        {/* Share */}
        <div className="space-y-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full">
              📱 Share on WhatsApp
            </Button>
          </a>
          {cardUrl && (
            <a href={cardUrl} download target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                🃏 Download Trading Card
              </Button>
            </a>
          )}
        </div>
      </main>

      <Nav userId={user.id} />
    </div>
  )
}
