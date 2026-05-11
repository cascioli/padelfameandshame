import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MatchForm } from '@/components/match-form'
import { Nav } from '@/components/nav'

export default async function NewMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/setup')

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <h1 className="font-black text-base">Log a Match</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <MatchForm />
      </main>

      <Nav userId={user.id} />
    </div>
  )
}
