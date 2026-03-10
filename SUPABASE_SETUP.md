# Supabase Connection & Deployment Guide

This document explains how to connect this project to Supabase, run the database migration, configure environment variables, and what files/folders should be present in the repository for deployment (Vercel recommended).

Overview
- Database: Supabase (hosted PostgreSQL)
- Server: Vercel serverless API routes (the `api/` folder)
- Client: Vite + React (the `client/` folder)

Important files in this repo
- `script/migrations/001_supabase_init.sql` — SQL to create the `orders` table, indices and RLS policy.
- `shared/schema.ts` — TypeScript schema (drizzle) used in code and for reference.
- `api/` — serverless endpoints that talk to Supabase using the server-only service role key.
  - `api/orders/index.ts` — `GET /api/orders` and `POST /api/orders` handler
  - `api/orders/[id].ts` — `DELETE /api/orders/:id`
  - `api/orders/[id]/status.ts` — `PATCH /api/orders/:id/status`
  - `api/admin/*.ts` — admin login, check-auth, logout handlers
  - `api/_lib/auth.ts` — small auth helper (HMAC-signed cookie helpers)
- `client/` — frontend app (Vite). Uses `fetch('/api/...')` to call serverless endpoints.
- `.env.example` — example environment variables (do NOT commit secrets in `.env`).

1) Create a Supabase project and obtain keys
1. Go to https://app.supabase.com and create a new project.
2. From the project dashboard copy the following values and keep them safe:
   - `SUPABASE_URL` (your project's URL, e.g. `https://xy123.supabase.co`)
   - `SUPABASE_ANON_KEY` (public anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key — **server-only, never commit or expose**)

2) Apply the database migration
You can create the table and RLS using one of these methods.

- Option A — Supabase SQL editor (recommended if you prefer the dashboard):
  1. Open the Supabase project dashboard → SQL Editor → New query.
  2. Paste the contents of `script/migrations/001_supabase_init.sql` and click Run.

- Option B — Supabase CLI / psql (developer workflow):
  - If you have the Supabase CLI installed you can run (after logging in):

```bash
# from repo root
supabase db remote set <your-db-connection-string>
psql "$SUPABASE_DB_URL" -f script/migrations/001_supabase_init.sql
```

Notes about the migration
- The migration enables Row Level Security and creates a policy `public_insert` that allows anonymous users to INSERT into `public.orders`.
- The migration intentionally does not add SELECT/UPDATE/DELETE policies for public; server-side admin operations should use the `SUPABASE_SERVICE_ROLE_KEY`.

3) Environment variables (Vercel / local)
- Server-side environment variables (must be set in Vercel as **server only**):
  - `ADMIN_PASSWORD` — admin passphrase used to sign the auth cookie (example value: set your secure password).
  - `SUPABASE_URL` — your Supabase URL.
  - `SUPABASE_SERVICE_ROLE_KEY` — service role key (DO NOT expose to client).

- Client (exposed to browser via Vite; Vite variables must be prefixed with `VITE_`):
  - `VITE_WHATSAPP_NUMBER` — e.g. `911234567890` (used on the success page link).
  - `VITE_BUILD_PRICE` — build price shown in the UI (e.g. `200`).
  - `SUPABASE_ANON_KEY` — optional if you want the client to talk directly to Supabase (not required with current server proxy approach).

Local testing (development)
1. Copy `.env.example` to `.env.local` (or set environment variables in your shell). **Do not commit `.env.local`.**
2. Install deps and run the frontend dev server:

```powershell
npm install
npx vite
# open http://localhost:5173/
```

3. Running serverless API routes locally
- To run the `api/` serverless endpoints locally (to have `/api/*` available to the client) use `vercel dev`:

```bash
npm i -g vercel
# set the required server env vars in your shell before running
# on Windows PowerShell example:
$env:ADMIN_PASSWORD='your_password'; $env:SUPABASE_URL='https://...'; $env:SUPABASE_SERVICE_ROLE_KEY='service_role_key'; vercel dev
```

Alternative: keep using the Vite frontend and run admin server tests via the `api/` modules directly (see `script/test-admin.ts`) for quick local verification of cookie signing.

4) What to upload to your repository
Include these files & folders (these are required for the app and for Vercel to build and serve the serverless functions):
- `client/` — the frontend source
- `api/` — serverless endpoints (Vercel will expose these as `/api/*`)
- `shared/` — shared TypeScript schemas and routes
- `script/migrations/001_supabase_init.sql` — migration SQL
- `.env.example` — example environment variables (but do NOT commit any real secrets)
- `package.json`, `tsconfig.json`, `vite.config.ts`, `README.md`, `drizzle.config.ts` (if present)

Do NOT upload these to the remote repository:
- `node_modules/`
- any `.env` or files that contain real secrets (e.g. `.env.local` with `SUPABASE_SERVICE_ROLE_KEY`)

5) Deploying on Vercel (recommended)
1. Import the repo into Vercel (use the Vercel dashboard → New Project → Import Git Repository).
2. Set project environment variables in the Vercel dashboard (Environment → Production):
   - `ADMIN_PASSWORD` (server)
   - `SUPABASE_URL` (server)
   - `SUPABASE_SERVICE_ROLE_KEY` (server, **secret**)
   - `SUPABASE_ANON_KEY` (optional; if using on client)
   - `VITE_WHATSAPP_NUMBER` (client)
   - `VITE_BUILD_PRICE` (client)
3. Deploy. Vercel will detect the `client` framework and expose `api/` endpoints as serverless functions.

6) Test endpoints (curl examples)
- Create (public):

```bash
curl -X POST https://<your-vercel-app>.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+911234567890","idea":"Test idea"}'
```

- Admin login (creates auth cookie):

```bash
curl -i -X POST https://<your-vercel-app>.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"<ADMIN_PASSWORD>"}'
```

- List orders (admin) — include cookie returned from login above:

```bash
curl -X GET https://<your-vercel-app>.vercel.app/api/orders \
  -H "Cookie: cbl_auth=<token from login cookie>"
```

7) Security notes
- Never commit `SUPABASE_SERVICE_ROLE_KEY` or `ADMIN_PASSWORD` to source control.
- The service role key has full privileges and bypasses RLS — treat it like a root password.
- If you prefer a client-driven flow, you can allow anonymous inserts and have clients write directly to Supabase with `SUPABASE_ANON_KEY`. In that case, restrict server-side routes to admin-only operations using the service role key.

8) Troubleshooting
- Error: `Supabase not configured` — ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set for serverless environment.
- Error: invalid token / unauthorized — ensure `ADMIN_PASSWORD` used for login matches the server env value and the cookie is passed with requests.
- If Vercel returns 500 for serverless endpoints: check function logs in Vercel dashboard; confirm env vars are present.

If you'd like, I can:
- Produce a one-command script to push the migration to Supabase (requires you to provide a secure connection string), or
- Prepare a Vercel deployment guide with exact build & output settings specific to your repository layout.
