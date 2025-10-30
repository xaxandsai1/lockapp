-- Create relationships table for SUB-KEYHOLDER connections
-- Tracks the state of relationships between users

create type relationship_status as enum ('pending', 'active', 'paused', 'ended');

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  sub_id uuid not null references public.profiles(id) on delete cascade,
  keyholder_id uuid not null references public.profiles(id) on delete cascade,
  status relationship_status default 'pending' not null,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Ensure SUB and KEYHOLDER are different users
  constraint different_users check (sub_id != keyholder_id),
  
  -- Ensure only one active relationship per SUB-KEYHOLDER pair
  constraint unique_active_relationship unique (sub_id, keyholder_id, status)
);

-- Enable RLS
alter table public.relationships enable row level security;

-- RLS Policies for relationships
create policy "relationships_select_own"
  on public.relationships for select
  using (auth.uid() = sub_id or auth.uid() = keyholder_id);

create policy "relationships_insert_sub"
  on public.relationships for insert
  with check (auth.uid() = sub_id);

create policy "relationships_update_participants"
  on public.relationships for update
  using (auth.uid() = sub_id or auth.uid() = keyholder_id);

create policy "relationships_delete_participants"
  on public.relationships for delete
  using (auth.uid() = sub_id or auth.uid() = keyholder_id);

-- Create indexes
create index if not exists relationships_sub_id_idx on public.relationships(sub_id);
create index if not exists relationships_keyholder_id_idx on public.relationships(keyholder_id);
create index if not exists relationships_status_idx on public.relationships(status);

-- Add updated_at trigger
create trigger relationships_updated_at
  before update on public.relationships
  for each row
  execute function public.handle_updated_at();
