Campus Build Lab — Production Upgrade Notes

Summary
- Frontend: Vite + React app (client/)
- Serverless: Vercel-compatible API routes under `api/` that use Supabase REST with `SUPABASE_SERVICE_ROLE_KEY` for admin operations.
- Database: Supabase (Postgres). Migration SQL in `script/migrations/001_supabase_init.sql`.

Required environment variables
- ADMIN_PASSWORD (server-side)
- SUPABASE_URL (server-side)
- SUPABASE_ANON_KEY (client or server)
- SUPABASE_SERVICE_ROLE_KEY (server-side ONLY)
- VITE_WHATSAPP_NUMBER (client; e.g. 911234567890)
- VITE_BUILD_PRICE (client; integer)

.env.example included with recommended names and hints.

Deployment (Vercel)
1. Set the environment variables in the Vercel dashboard. Ensure `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` are set as secret server-side values.
2. Confirm `VITE_WHATSAPP_NUMBER` and `VITE_BUILD_PRICE` are set for client usage.
3. Deploy the repo to Vercel. The `api/` folder contains serverless endpoints automatically exposed.

Database migration
Use the SQL in `script/migrations/001_supabase_init.sql` to create the `orders` table and RLS policy.
Run with psql or Supabase SQL editor. Example:

```bash
# via supabase CLI
supabase sql "$(cat script/migrations/001_supabase_init.sql)"

# or via psql
psql "$SUPABASE_DB_URL" -f script/migrations/001_supabase_init.sql
```

Notes & security
- Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Serverless functions use that key server-side only.
- Admin auth is lightweight: password in `ADMIN_PASSWORD` validated server-side; auth is expressed as an HTTP-only cookie signed with HMAC.
- Public users can submit orders via `POST /api/orders` which forwards to Supabase (service key). You can switch to direct client-side anon inserts and RLS if preferred.

Performance
- Removed Google font imports in favor of system font stack.
- Replaced heavy animation library usage with lightweight CSS and a small vanilla 3D-tilt implementation (desktop-only).
- Kept UI minimal and the color system is updated to deep charcoal background and muted indigo accent.
