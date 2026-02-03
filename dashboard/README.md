# Ops Dashboard (Kanban)

Goal: Online status/kanban for Clawdbot runs.

## Security
- Never commit `.env*` files.
- Use **anon key** only in the browser.
- Use **service_role** only on the server (API routes / server actions).

## Setup (local)
1) Create `dashboard/.env.local` based on `.env.example`
2) Run:
   - `npm install`
   - `npm run dev`

## Supabase schema
Run SQL in Supabase SQL editor: `supabase/schema_ops.sql`

## Deploy
Deploy to Vercel, set env vars (same as `.env.example`).
