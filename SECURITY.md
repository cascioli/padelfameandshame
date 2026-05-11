# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |
| older branches | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: `security@[your-domain]` (or use GitHub's private vulnerability reporting).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You'll get a response within 48 hours. If it's a valid vulnerability, we'll coordinate a fix and credit you in the release notes.

## Security model

This app uses:

| Component | Approach |
|---|---|
| Authentication | Supabase Magic Link (no passwords stored) |
| Session validation | JWT via `getSession()` in middleware, `getUser()` in API routes |
| Database access | Row Level Security (RLS) on all tables |
| Karma updates | PostgreSQL `SECURITY DEFINER` function — no service role key |
| AI calls | Server-side only — Gemini API key never reaches the browser |
| Image generation | `next/og` server route — no sensitive data |

## Known limitations

- `getSession()` in middleware validates the JWT signature locally (no network call to Supabase). Revoked sessions remain valid until JWT expiry (~1 hour). This is an accepted tradeoff for performance in a low-sensitivity app. API routes use `getUser()` for real-time validation.
- No rate limiting on `/api/matches` or `/api/chronicle`. A malicious authenticated user could spam requests and exhaust your Gemini quota. Recommended: add Vercel's Edge rate limiting or an `upstash/ratelimit` middleware in production.

## Environment variables

| Variable | Client-side? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Safe — public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Safe — restricted by RLS |
| `GEMINI_API_KEY` | ❌ No | Server only — never expose |
