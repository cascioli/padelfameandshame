'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import type { Profile } from '@/lib/supabase/types'

interface PlayerSearchProps {
  label: string
  value: Profile | null
  onChange: (player: Profile | null) => void
  exclude?: string[]
}

export function PlayerSearch({ label, value, onChange, exclude = [] }: PlayerSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
      const data: Profile[] = await res.json()
      setResults(data.filter(p => !exclude.includes(p.id)))
    }, 300)
    return () => clearTimeout(timer.current)
  }, [query, exclude.join(',')])

  if (value) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-secondary rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">@</span>
          <span className="text-sm font-semibold">{value.username}</span>
          <span className="text-xs text-muted-foreground ml-1">⚡{value.karma}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground text-lg leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        placeholder={label}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-lg mt-1 overflow-hidden shadow-lg">
          {results.map(player => (
            <button
              key={player.id}
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-secondary flex items-center justify-between"
              onMouseDown={() => { onChange(player); setQuery(''); setOpen(false) }}
            >
              <span className="font-medium">@{player.username}</span>
              <span className="text-xs text-muted-foreground">⚡{player.karma} · {player.wins}W</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
