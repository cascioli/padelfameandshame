import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Profile, Match } from '@/lib/supabase/types'

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="text-sm font-bold text-muted-foreground w-8 text-center">{rank}</span>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // All 3 queries in parallel
  const [{ data: profile }, { data: profiles }, { data: matches }] = await Promise.all([
    supabase.from('profiles').select('id').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('*').order('karma', { ascending: false }),
    supabase.from('matches').select('beer_debtor_id'),
  ])

  if (!profile) redirect('/setup')

  // Count beer debts per player
  const beerCounts: Record<string, number> = {}
  for (const m of (matches as Pick<Match, 'beer_debtor_id'>[] ?? [])) {
    beerCounts[m.beer_debtor_id] = (beerCounts[m.beer_debtor_id] ?? 0) + 1
  }

  const shameRanking = [...(profiles ?? [])]
    .sort((a, b) => (beerCounts[b.id] ?? 0) - (beerCounts[a.id] ?? 0))
    .filter(p => (beerCounts[p.id] ?? 0) > 0)

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h1 className="font-black text-base">Rankings</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <Tabs defaultValue="karma">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="karma" className="flex-1">⚡ Karma</TabsTrigger>
            <TabsTrigger value="shame" className="flex-1">🍺 Hall of Shame</TabsTrigger>
          </TabsList>

          {/* Karma Ranking */}
          <TabsContent value="karma" className="space-y-2">
            <p className="text-xs text-muted-foreground mb-4">
              Win matches → earn karma. Lose → lose karma.
            </p>
            {(profiles ?? []).map((p: Profile, i) => (
              <Link key={p.id} href={`/player/${p.id}`}>
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-secondary ${
                  p.id === user.id ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
                }`}>
                  <MedalBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate">@{p.username}</span>
                      {p.id === user.id && <span className="text-xs text-primary">(you)</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>🏆 {p.wins}W</span>
                      <span>💀 {p.losses}L</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-primary text-lg">{p.karma}</p>
                    <p className="text-xs text-muted-foreground">karma</p>
                  </div>
                </div>
              </Link>
            ))}
            {!profiles?.length && (
              <p className="text-center text-muted-foreground text-sm py-12">No players yet.</p>
            )}
          </TabsContent>

          {/* Hall of Shame */}
          <TabsContent value="shame" className="space-y-2">
            <p className="text-xs text-muted-foreground mb-4">
              Most times owing beers. The true losers.
            </p>
            {shameRanking.map((p, i) => (
              <Link key={p.id} href={`/player/${p.id}`}>
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-secondary ${
                  p.id === user.id ? 'border-amber-400/50 bg-amber-400/5' : 'border-border bg-card'
                }`}>
                  <MedalBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate">@{p.username}</span>
                      {p.id === user.id && <span className="text-xs text-amber-400">(you)</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">⚡{p.karma} karma</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-amber-400 text-lg">{beerCounts[p.id] ?? 0}</p>
                    <p className="text-xs text-muted-foreground">🍺 rounds</p>
                  </div>
                </div>
              </Link>
            ))}
            {!shameRanking.length && (
              <div className="text-center py-12 space-y-2">
                <div className="text-4xl">🎉</div>
                <p className="text-sm text-muted-foreground">No shame yet. Log some matches!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Nav userId={user.id} />
    </div>
  )
}
