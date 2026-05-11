import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Button } from '@/components/ui/button'
import type { Match, Profile } from '@/lib/supabase/types'

function VibeTag({ vibe }: { vibe: string }) {
  const map: Record<string, string> = { epic: '⚡ Epic', roast: '🔥 Roast', friendly: '🤝 Friendly' }
  const colors: Record<string, string> = {
    epic: 'bg-primary/20 text-primary border-primary/30',
    roast: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    friendly: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colors[vibe] ?? ''}`}>
      {map[vibe] ?? vibe}
    </span>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile + matches in parallel
  const [{ data: profile }, { data: matches }] = await Promise.all([
    supabase.from('profiles').select().eq('id', user.id).maybeSingle(),
    supabase.from('matches').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  if (!profile) redirect('/setup')

  const playerIds = [...new Set(
    (matches ?? []).flatMap((m: Match) => [...m.winner_ids, ...m.loser_ids, m.beer_debtor_id])
  )]

  const { data: players } = playerIds.length
    ? await supabase.from('profiles').select('id, username').in('id', playerIds)
    : { data: [] as Pick<Profile, 'id' | 'username'>[] }

  const nameMap = Object.fromEntries((players ?? []).map(p => [p.id, p.username]))

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎾</span>
            <span className="font-black text-sm tracking-tight">
              Hall of <span className="text-primary">Fame & Shame</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-primary font-bold">@{profile.username}</span>
            <span>⚡{profile.karma}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <Link href="/match/new">
          <Button className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20">
            ⚡ Log a Match
          </Button>
        </Link>

        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Recent Chronicles
          </h2>

          {!matches?.length && (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <div className="text-4xl">🏓</div>
              <p className="text-sm">No matches yet. Be the first to log one!</p>
            </div>
          )}

          {matches?.map((match: Match) => {
            const winnerNames = match.winner_ids.map(id => nameMap[id] ?? '?').join(' & ')
            const loserNames = match.loser_ids.map(id => nameMap[id] ?? '?').join(' & ')
            const beerName = nameMap[match.beer_debtor_id] ?? '?'
            const date = new Date(match.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

            return (
              <article key={match.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-primary truncate">{winnerNames}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-xs font-medium text-muted-foreground truncate">{loserNames}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">{match.score}</span>
                  <VibeTag vibe={match.vibe} />
                </div>

                {match.chronicle_text && (
                  <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-3 italic">
                    {match.chronicle_text}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-amber-400">🍺 @{beerName} owes beers</span>
                  <Link
                    href={`/match/${match.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    details →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <Nav userId={user.id} />
    </div>
  )
}
