import { createClient } from '@/lib/supabase/server'
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

  const { count: grudgeCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .contains('winner_ids', winner_ids)
    .contains('loser_ids', loser_ids)

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

  // RLS allows authenticated users to insert matches
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({ winner_ids, loser_ids, score, beer_debtor_id, chronicle_text, vibe })
    .select()
    .single()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 })
  }

  // SECURITY DEFINER function — runs with elevated DB privileges, no service role key needed
  await supabase.rpc('log_match_karma', {
    p_winner_ids: winner_ids,
    p_loser_ids: loser_ids,
    p_beer_debtor_id: beer_debtor_id,
  })

  return NextResponse.json({ matchId: match.id, chronicle: chronicle_text })
}
