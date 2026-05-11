<div align="center">

# 🎾 Padel Hall of Fame & Shame

**Gamify your club's post-match rituals. Zero hardware. Maximum drama.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

[**Live Demo**](https://your-demo-url.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## The problem

You just won 6-0, 6-1. Your opponent owes everyone a round of beers. You take a photo of the scoreboard and send it to the WhatsApp group. It gets buried in 40 other messages. Nobody remembers who owes what. The shame dies in silence.

**Not anymore.**

## What it does

Log a match in 30 seconds at the bar. Get an AI-generated chronicle tailored to the drama. Track who owes beers. Generate shareable trading cards for every player. Build a permanent Hall of Fame — and Hall of Shame.

| Feature | What happens |
|---|---|
| ⚡ **Match Logging** | Select 4 players, enter score, pick vibe (Epic / Roast / Friendly), assign beer debtor |
| 📰 **AI Chronicles** | Gemini 2.0 Flash writes a snarky 280-char match summary |
| 👊 **The Grudge** | AI knows how many times the winners have beaten the same losers |
| 🃏 **Trading Cards** | Dynamic PNG cards per player — Gold for legends, Toxic green for shameful karma |
| 🍺 **Hall of Shame** | Ranked leaderboard of who owes the most rounds |
| ⚡ **Karma System** | Win → +10 karma. Lose → -5. Owe beers → -8. Floor is 0. |
| 🔗 **Magic Link Auth** | No passwords. No apps. Just email. Works at the bar. |

## Stack

```
Frontend   Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui
Backend    Supabase (PostgreSQL + Auth + Row Level Security)
AI         Google Gemini 2.0 Flash
Cards      next/og (Satori) — dynamic PNG generation
Deploy     Vercel
```

**No service role key needed.** Karma updates use a PostgreSQL `SECURITY DEFINER` function — privilege escalation happens inside the database, not in application code.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Gemini API key](https://aistudio.google.com) (free)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/padelfameandshame.git
cd padelfameandshame
npm install
```

### 2. Set up the database

Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project's SQL Editor.

This creates:
- `profiles` and `matches` tables with RLS policies
- `log_match_karma()` — a `SECURITY DEFINER` function that safely updates karma across users

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
GEMINI_API_KEY="your-gemini-key"
```

### 4. Configure Supabase Auth redirect

Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/api/auth/callback`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with a magic link, pick a username, and start logging matches.

## Deploy to production

**Vercel (one command):**

```bash
npx vercel --prod
```

Or connect the GitHub repo at [vercel.com](https://vercel.com) and it deploys on every push.

Remember to:
1. Add all env vars in Vercel → Settings → Environment Variables
2. Update Supabase redirect URLs to your production domain

## Project structure

```
src/
  app/
    page.tsx              Homepage — chronicles feed + CTA
    login/                Magic link auth
    setup/                Username picker (first login)
    match/new/            Match logging form
    match/[id]/           Chronicle detail + trading card + WhatsApp share
    dashboard/            Karma ranking + Hall of Shame tabs
    player/[id]/          Player profile + card + recent matches
    api/
      chronicle/          POST — Gemini AI story generator
      matches/            POST — create match + trigger karma update
      card/[id]/          GET  — trading card PNG (next/og)
      players/search/     GET  — username autocomplete
      auth/callback/      GET  — Supabase magic link exchange
  components/
    match-form.tsx        Interactive 4-player match form (client)
    player-search.tsx     Debounced player autocomplete (client)
    nav.tsx               Mobile bottom navigation
  lib/supabase/
    client.ts             Browser client
    server.ts             Server client (SSR, API routes)
    types.ts              Full Database generic type
supabase/
  schema.sql              Complete DB schema — run this first
```

## Security

- All API routes validate the session with `getUser()` (real-time Supabase auth validation)
- RLS restricts every table — users can only modify their own profile
- No service role key in the codebase
- Gemini API key is server-only (no `NEXT_PUBLIC_` prefix)

See [SECURITY.md](SECURITY.md) for the full security model and how to report vulnerabilities.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). TL;DR: one PR per thing, TypeScript must pass, mobile first.

## License

[MIT](LICENSE) — fork it, deploy it for your club, make it your own.

---

<div align="center">

*Built for the bar. Tested at the net.*

</div>
