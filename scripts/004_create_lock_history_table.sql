-- Create lock_history table for tracking time modifications
-- Provides full audit trail of lock changes

create type lock_action_type as enum (
  'created',
  'time_added',
  'time_removed',
  'paused',
  'resumed',
  'completed',
  'cancelled'
);

create table if not exists public.lock_history (
  id uuid primary key default gen_random_uuid(),
  lock_id uuid not null references public.locks(id) on delete cascade,
  action lock_action_type not null,
  performed_by uuid not null references public.profiles(id) on delete cascade,
  time_change_seconds bigint default 0,
  reason text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.lock_history enable row level security;

-- RLS Policies for lock_history
create policy "lock_history_select_participants"
  on public.lock_history for select
  using (
    exists (
      select 1 from public.locks l
      join public.relationships r on r.id = l.relationship_id
      where l.id = lock_history.lock_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "lock_history_insert_participants"
  on public.lock_history for insert
  with check (
    exists (
      select 1 from public.locks l
      join public.relationships r on r.id = l.relationship_id
      where l.id = lock_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

-- Create indexes
create index if not exists lock_history_lock_id_idx on public.lock_history(lock_id);
create index if not exists lock_history_performed_by_idx on public.lock_history(performed_by);
create index if not exists lock_history_created_at_idx on public.lock_history(created_at);
