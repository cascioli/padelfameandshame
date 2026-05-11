import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { Badge } from '@/components/ui/badge'
import type { Match } from '@/lib/supabase/types'

function getTitle(wins: number, losses: number, karma: number): string {
  if (karma > 150 && wins > 10) return 'Legend'
  if (wins > 10) return 'Champion'
  if (karma >= 100 && wins >= 5) return 'Veteran'
  if (losses > wins * 2) return 'Punching Bag'
  if (karma < 50 && losses > wins) return 'Line Thief'
  if (karma < 50) return 'Toxic Player'
  return 'Club Member'
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (!me) redirect('/setup')

  const { data: player } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!player) notFound()

  const { data: recentMatches } = await supabase
    .from('matches')
    .select('*')
    .or(`winner_ids.cs.{${id}},loser_ids.cs.{${id}}`)
    .order('created_at', { ascending: false })
    .limit(5)

  const allIds = [...new Set(
    (recentMatches ?? []).flatMap((m: Match) => [...m.winner_ids, ...m.loser_ids])
  )]
  const { data: players } = allIds.length
    ? await supabase.from('profiles').select('id, username').in('id', allIds)
    : { data: [] }

  const nameMap = Object.fromEntries((players ?? []).map(p => [p.id, p.username]))

  const title = getTitle(player.wins, player.losses, player.karma)
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0
  const isMe = user.id === id

  const isToxic = player.karma < 50
  const isGold = player.wins > 10

  const handleSignOut = async () => {
    'use server'
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const supabase = await createServerClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">← Back</Link>
          <h1 className="font-black text-base">Player Profile</h1>
          {isMe && (
            <form action={handleSignOut}>
              <button type="submit" className="text-xs text-muted-foreground hover:text-destructive">
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Profile hero */}
        <div className={`rounded-xl p-6 text-center space-y-3 border ${
          isToxic
            ? 'bg-emerald-950/30 border-emerald-500/30'
            : isGold
            ? 'bg-yellow-950/30 border-yellow-500/30'
            : 'bg-card border-border'
        }`}>
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl border-2 ${
            isToxic ? 'border-emerald-400 bg-emerald-950' : isGold ? 'border-yellow-400 bg-yellow-950' : 'border-primary bg-secondary'
          }`}>
            🎾
          </div>
          <div>
            <h2 className="text-2xl font-black">@{player.username}</h2>
            <p className={`text-sm font-bold mt-1 ${
              isToxic ? 'text-emerald-400' : isGold ? 'text-yellow-400' : 'text-primary'
            }`}>
              {title}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Wins', value: player.wins, icon: '🏆' },
            { label: 'Losses', value: player.losses, icon: '💀' },
            { label: 'Win%', value: `${winRate}%`, icon: '📊' },
            { label: 'Karma', value: player.karma, icon: '⚡' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 text-center space-y-1">
              <div className="text-xl">{stat.icon}</div>
              <div className="font-black text-lg text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trading card */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trading Card</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/card/${player.id}`}
            alt={`${player.username}'s trading card`}
            className="rounded-xl border border-border w-full max-w-[200px] mx-auto block"
          />
          <a
            href={`/api/card/${player.id}`}
            download={`${player.username}-card.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-primary underline underline-offset-2"
          >
            🃏 Download card
          </a>
        </div>

        {/* Recent matches */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Matches</h3>
          {!recentMatches?.length && (
            <p className="text-sm text-muted-foreground text-center py-6">No matches yet.</p>
          )}
          {recentMatches?.map((match: Match) => {
            const won = match.winner_ids.includes(id)
            const winnerNames = match.winner_ids.map((i: string) => nameMap[i] ?? '?').join(' & ')
            const loserNames = match.loser_ids.map((i: string) => nameMap[i] ?? '?').join(' & ')
            const date = new Date(match.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

            return (
              <Link key={match.id} href={`/match/${match.id}`}>
                <div className={`p-3 rounded-xl border text-sm ${
                  won ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${won ? 'text-primary' : 'text-destructive'}`}>
                      {won ? '🏆 WIN' : '💀 LOSS'}
                    </span>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {winnerNames} <span className="font-bold text-foreground">{match.score}</span> {loserNames}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Nav userId={user.id} />
    </div>
  )
}
