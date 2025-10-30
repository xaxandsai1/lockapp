-- Create profiles table that extends auth.users
-- This stores additional user information beyond what Supabase Auth provides

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('SUB', 'KEYHOLDER')),
  bio text,
  avatar_url text,
  date_of_birth date not null,
  country text,
  language text default 'pl',
  is_verified boolean default false,
  is_banned boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_all"
  on public.profiles for select
  using (true); -- Anyone can view profiles (needed for discovery)

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create indexes for performance
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_display_name_idx on public.profiles(display_name);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
