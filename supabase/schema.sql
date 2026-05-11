-- Padel Hall of Fame & Shame — Database Schema
-- Run this in Supabase SQL Editor

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  karma integer not null default 100,
  wins integer not null default 0,
  losses integer not null default 0,
  avatar_url text,
  created_at timestamp with time zone default now() not null
);

-- Matches
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  winner_ids uuid[] not null,
  loser_ids uuid[] not null,
  score text not null,
  beer_debtor_id uuid references public.profiles(id) not null,
  chronicle_text text,
  vibe text check (vibe in ('epic', 'roast', 'friendly')) not null default 'friendly'
);

-- Grant table-level access to roles (required before RLS policies take effect)
grant usage on schema public to authenticated, anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.matches to authenticated;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.matches enable row level security;

-- Profiles policies
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Matches policies
create policy "Matches viewable by authenticated users"
  on public.matches for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert matches"
  on public.matches for insert
  with check (auth.role() = 'authenticated');

-- Index for performance
create index matches_winner_ids_gin on public.matches using gin(winner_ids);
create index matches_loser_ids_gin on public.matches using gin(loser_ids);
create index matches_beer_debtor_id on public.matches(beer_debtor_id);
create index matches_created_at on public.matches(created_at desc);
