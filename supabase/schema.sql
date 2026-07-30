create extension if not exists "pgcrypto";

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  english text not null,
  spanish text not null,
  example text not null default '',
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.flashcards enable row level security;

create policy "Public can read flashcards"
on public.flashcards for select
to anon
using (true);

create policy "Public can create flashcards"
on public.flashcards for insert
to anon
with check (true);

create policy "Public can update flashcards"
on public.flashcards for update
to anon
using (true)
with check (true);
