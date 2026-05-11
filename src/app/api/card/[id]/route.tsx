import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

type ProfileRow = { username: string; wins: number; losses: number; karma: number }

function getTitle(wins: number, losses: number, karma: number): string {
  if (karma > 150 && wins > 10) return 'LEGEND'
  if (wins > 10) return 'CHAMPION'
  if (karma >= 100 && wins >= 5) return 'VETERAN'
  if (losses > wins * 2) return 'PUNCHING BAG'
  if (karma < 50 && losses > wins) return 'LINE THIEF'
  if (karma < 50) return 'TOXIC PLAYER'
  return 'CLUB MEMBER'
}

function getTheme(wins: number, karma: number) {
  if (karma < 50) {
    return { bg: '#050f05', accent: '#00ff41', badge: '#0a2a0a', text: '#00ff41', label: 'TOXIC' }
  }
  if (wins > 10) {
    return { bg: '#0f0e00', accent: '#ffd700', badge: '#2a2500', text: '#ffd700', label: 'GOLD' }
  }
  return { bg: '#080808', accent: '#d4ff00', badge: '#1a1f00', text: '#d4ff00', label: 'STANDARD' }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Profiles are publicly readable (RLS: for select using (true))
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=username,wins,losses,karma`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 60 },
    }
  )

  const rows: ProfileRow[] = await res.json()
  const profile = rows[0]

  if (!profile) {
    return new Response('Player not found', { status: 404 })
  }

  const { username, wins, losses, karma } = profile
  const theme = getTheme(wins, karma)
  const title = getTitle(wins, losses, karma)
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '400px',
          height: '560px',
          background: theme.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px 24px',
          fontFamily: 'sans-serif',
          border: `2px solid ${theme.accent}`,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: theme.accent, fontSize: '11px', letterSpacing: '4px', fontWeight: 700 }}>
            PADEL HALL OF FAME & SHAME
          </span>
          <div style={{
            background: theme.badge,
            border: `1px solid ${theme.accent}`,
            padding: '2px 12px',
            borderRadius: '4px',
          }}>
            <span style={{ color: theme.accent, fontSize: '10px', letterSpacing: '3px' }}>{theme.label}</span>
          </div>
        </div>

        {/* Avatar placeholder */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: theme.badge,
          border: `3px solid ${theme.accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '52px' }}>🎾</span>
        </div>

        {/* Username */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 900, letterSpacing: '1px' }}>
            @{username}
          </span>
          <div style={{
            background: theme.accent,
            padding: '4px 16px',
            borderRadius: '4px',
          }}>
            <span style={{ color: theme.bg, fontSize: '12px', fontWeight: 900, letterSpacing: '3px' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          width: '100%',
        }}>
          {[
            { label: 'WINS', value: wins, icon: '🏆' },
            { label: 'LOSSES', value: losses, icon: '💀' },
            { label: 'WIN%', value: `${winRate}%`, icon: '📊' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: theme.badge,
                border: `1px solid ${theme.accent}22`,
                borderRadius: '8px',
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '18px' }}>{stat.icon}</span>
              <span style={{ color: theme.accent, fontSize: '20px', fontWeight: 900 }}>{stat.value}</span>
              <span style={{ color: '#666', fontSize: '9px', letterSpacing: '2px' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Karma */}
        <div style={{
          width: '100%',
          background: theme.badge,
          border: `1px solid ${theme.accent}`,
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: '#aaa', fontSize: '12px', letterSpacing: '2px' }}>⚡ KARMA</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '120px',
              height: '6px',
              background: '#333',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(karma, 200) / 2}%`,
                height: '100%',
                background: theme.accent,
                borderRadius: '3px',
              }} />
            </div>
            <span style={{ color: theme.accent, fontSize: '18px', fontWeight: 900 }}>{karma}</span>
          </div>
        </div>
      </div>
    ),
    { width: 400, height: 560 }
  )
}
