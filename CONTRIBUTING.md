# Contributing to Padel Hall of Fame & Shame

Thanks for wanting to contribute. Here's how to do it without wasting anyone's time.

## Before you start

- **Bug fix or small improvement?** Open a PR directly.
- **New feature?** Open an issue first to discuss. Nothing worse than building something that won't be merged.
- **Question?** Use GitHub Discussions.

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/padel-fame-and-shame.git
cd padel-fame-and-shame
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

You'll need:
- A Supabase project (free tier works)
- A Gemini API key (free at aistudio.google.com)
- Run `supabase/schema.sql` in your Supabase SQL Editor

## Pull Request rules

1. **One PR = one thing.** Don't refactor half the codebase while fixing a bug.
2. **TypeScript must pass.** Run `npx tsc --noEmit` before pushing.
3. **Mobile first.** Test on a 390px viewport. This app lives at the bar, not on a desktop.
4. **No new dependencies without discussion.** Bundle size matters on mobile networks.

## Code style

- No comments explaining *what* the code does — name things well instead.
- Server Components by default, `'use client'` only when you need interactivity.
- Tailwind classes only — no inline styles except in `next/og` image routes (Satori requires them).

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add player avatar upload
fix: beer debtor karma not updating on draw
chore: bump gemini sdk to 0.25
```

## What we're looking for

- 🐛 Bug fixes
- 🌍 i18n (currently Italian/English mix — pick one or support both)
- 📱 PWA improvements (offline support, push notifications)
- 🎨 New trading card themes
- ⚡ Performance improvements
- 🧪 Tests (we have zero — help welcome)

## What we're NOT looking for

- Rewrites to a different framework
- Dark/light mode toggle (always dark — it's a bar app)
- Admin dashboards (keep it simple)
