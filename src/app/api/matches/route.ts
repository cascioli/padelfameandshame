import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { winner_ids, loser_ids, score, beer_debtor_id, vibe } = body

  if (!winner_ids?.length || !loser_ids?.length || !score || !beer_debtor_id || !vibe) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Fetch usernames for AI chronicle
  const allIds = [...winner_ids, ...loser_ids]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', allIds)

  if (!profiles || profiles.length < 4) {
    return NextResponse.json({ error: 'Players not found' }, { status: 400 })
  }

  const getName = (id: string) => profiles.find(p => p.id === id)?.username ?? 'Unknown'
  const winners = winner_ids.map(getName)
  const losers = loser_ids.map(getName)
  const beerDebtorName = getName(beer_debtor_id)

  // Calculate grudge count
  const { count: grudgeCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .contains('winner_ids', winner_ids)
    .contains('loser_ids', loser_ids)

  // Generate AI chronicle
  let chronicle_text: string | null = null
  try {
    const chronicleRes = await fetch(new URL('/api/chronicle', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, winners, losers, vibe, beerDebtor: beerDebtorName, grudgeCount: grudgeCount ?? 0 }),
    })
    const { chronicle } = await chronicleRes.json()
    chronicle_text = chronicle
  } catch {}

  // Save match using admin client (bypasses RLS for karma updates)
  const admin = createAdminClient()

  const { data: match, error: matchError } = await admin
    .from('matches')
    .insert({ winner_ids, loser_ids, score, beer_debtor_id, chronicle_text, vibe })
    .select()
    .single()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  // Fetch current karma/stats to compute new values
  const { data: currentProfiles } = await admin
    .from('profiles')
    .select('id, karma, wins, losses')
    .in('id', allIds)

  const statMap = Object.fromEntries((currentProfiles ?? []).map(p => [p.id, p]))

  await Promise.all([
    ...winner_ids.map((id: string) => {
      const cur = statMap[id]
      if (!cur) return Promise.resolve()
      return admin.from('profiles').update({
        karma: Math.max(0, cur.karma + 10),
        wins: cur.wins + 1,
      }).eq('id', id)
    }),
    ...loser_ids.map((id: string) => {
      const cur = statMap[id]
      if (!cur) return Promise.resolve()
      const karmaLoss = id === beer_debtor_id ? 8 : 5
      return admin.from('profiles').update({
        karma: Math.max(0, cur.karma - karmaLoss),
        losses: cur.losses + 1,
      }).eq('id', id)
    }),
  ])

  return NextResponse.json({ matchId: match.id, chronicle: chronicle_text })
}
