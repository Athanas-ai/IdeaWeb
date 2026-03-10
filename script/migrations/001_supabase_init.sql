-- Supabase / Postgres migration for Campus Build Lab
-- Creates orders table with UUID PK, indices, and RLS policies

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  idea text not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Allow public inserts (anonymous users can insert)
create policy public_insert on public.orders
  for insert with check (true);

-- Do NOT create public select/update/delete policies.
-- Admin operations (select/update/delete) should be performed server-side
-- using the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
